// src/contexts/AdminAuthContext.tsx
// Isolated admin auth context — completely separate from the user AuthContext.
// On mount: validates session → loads user_role from DB → exposes can() helper.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { supabase } from '@/lib/supabase';
import {
  AdminRole,
  Permission,
  ROLE_HIERARCHY,
  hasPermission,
  isAdminRole,
} from '@/lib/adminRbac';
import { logAdminAction } from '@/lib/adminAudit';

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
}

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  /** True only during the initial session + role check */
  isLoading: boolean;
  /** Present when Supabase could not complete session or role verification */
  authError: string | null;
  /** True once role has been confirmed from DB */
  isAdminAuthenticated: boolean;
  /** True if the user has an active session, even if they aren't an admin */
  hasSession: boolean;
  /** Check a specific permission for the current admin */
  can: (permission: Permission) => boolean;
  retryAdminVerification: () => Promise<void>;
  signInAdmin: (email: string, password: string) => Promise<{ error: string | null }>;
  signOutAdmin: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

// ------------------------------------------------------------
// Provider
// ------------------------------------------------------------

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const roleLookupSequence = React.useRef(0);
  const authEventSequence = React.useRef(0);

  /**
   * Given a Supabase auth user id + email, look up their role in user_roles.
   * Returns null if the user has no admin role at all.
   */
  const fetchAdminRole = useCallback(async (userId: string, email: string): Promise<AdminUser | null> => {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role_id, admin_roles(name)')
      .eq('user_id', userId)

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Unable to verify admin role: ${error.message}`);
    }
    if (!data) return null;

    // data.admin_roles may be an array (join) or object depending on supabase-js version
    const roleNames = (Array.isArray(data) ? data : [data]).flatMap((row) => {
      const roleRow = Array.isArray(row.admin_roles)
        ? row.admin_roles[0]
        : row.admin_roles;
      return isAdminRole(roleRow?.name) ? [roleRow.name] : [];
    });
    const roleName = roleNames.reduce<AdminRole | null>(
      (highestRole, role) =>
        highestRole === null || ROLE_HIERARCHY[role] > ROLE_HIERARCHY[highestRole]
          ? role
          : highestRole,
      null,
    );

    if (!roleName) return null;

    return { id: userId, email, role: roleName };
  }, []);

  const clearSession = useCallback(() => {
    roleLookupSequence.current += 1;
    setHasSession(false);
    setAdminUser(null);
    setAuthError(null);
    setIsLoading(false);
  }, []);

  const verifyAdminRole = useCallback(async (
    userId: string,
    email: string,
    requestSequence: number,
  ) => {
    try {
      const admin = await fetchAdminRole(userId, email);
      if (requestSequence !== roleLookupSequence.current) return;
      setAdminUser(admin);
      setAuthError(null);
    } catch (error) {
      if (requestSequence !== roleLookupSequence.current) return;
      console.error('Admin role verification failed:', error);
      setAdminUser(null);
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Unable to verify admin access. Please try again.',
      );
    } finally {
      if (requestSequence === roleLookupSequence.current) setIsLoading(false);
    }
  }, [fetchAdminRole]);

  const startRoleLookup = useCallback((
    userId: string,
    email: string,
    defer = false,
  ) => {
    const requestSequence = ++roleLookupSequence.current;
    setHasSession(true);
    setAdminUser(null);
    setAuthError(null);
    setIsLoading(true);

    const verify = () => {
      if (requestSequence === roleLookupSequence.current) {
        void verifyAdminRole(userId, email, requestSequence);
      }
    };

    if (defer) window.setTimeout(verify, 0);
    else verify();
  }, [verifyAdminRole]);

  // Subscribe before reading the stored session so auth events cannot be lost
  // while getSession is pending. Sequence numbers make stale role checks inert.
  useEffect(() => {
    let cancelled = false;
    const authEventSequenceAtStart = authEventSequence.current;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      authEventSequence.current += 1;

      if (session?.user) {
        startRoleLookup(session.user.id, session.user.email ?? '', true);
      } else {
        clearSession();
      }
    });

    const init = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (cancelled || authEventSequence.current !== authEventSequenceAtStart) return;
        if (error) throw error;

        if (session?.user) {
          startRoleLookup(session.user.id, session.user.email ?? '');
        } else {
          clearSession();
        }
      } catch (error) {
        if (cancelled || authEventSequence.current !== authEventSequenceAtStart) return;
        console.error('AdminAuthContext session initialization failed:', error);
        roleLookupSequence.current += 1;
        setHasSession(false);
        setAdminUser(null);
        setAuthError(
          error instanceof Error
            ? error.message
            : 'Unable to load your session. Please try again.',
        );
        setIsLoading(false);
      }
    };

    void init();

    return () => {
      cancelled = true;
      roleLookupSequence.current += 1;
      subscription.unsubscribe();
    };
  }, [clearSession, startRoleLookup]);

  const retryAdminVerification = useCallback(async () => {
    const requestSequence = ++roleLookupSequence.current;
    const authVersion = authEventSequence.current;
    setIsLoading(true);
    setAdminUser(null);
    setAuthError(null);

    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (
        requestSequence !== roleLookupSequence.current ||
        authVersion !== authEventSequence.current
      ) return;
      if (error) throw error;

      if (!session?.user) {
        clearSession();
        return;
      }

      setHasSession(true);
      await verifyAdminRole(
        session.user.id,
        session.user.email ?? '',
        requestSequence,
      );
    } catch (error) {
      if (
        requestSequence !== roleLookupSequence.current ||
        authVersion !== authEventSequence.current
      ) return;
      console.error('Admin session retry failed:', error);
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Unable to verify admin access. Please try again.',
      );
      setIsLoading(false);
    }
  }, [clearSession, verifyAdminRole]);

  // ------------------------------------------------------------

  const signInAdmin = useCallback(async (email: string, password: string): Promise<{ error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return { error: error.message };
    if (!data.user) return { error: 'Sign-in failed. Please try again.' };

    const requestSequence = ++roleLookupSequence.current;
    setHasSession(true);
    setAdminUser(null);
    setAuthError(null);
    setIsLoading(true);

    let admin: AdminUser | null;
    try {
      admin = await fetchAdminRole(data.user.id, data.user.email ?? '');
    } catch (roleError) {
      if (requestSequence !== roleLookupSequence.current) {
        return { error: 'Authentication changed before admin access could be verified.' };
      }
      await supabase.auth.signOut();
      return {
        error: roleError instanceof Error ? roleError.message : 'Unable to verify admin access.',
      };
    }

    if (requestSequence !== roleLookupSequence.current) {
      return { error: 'Authentication changed before admin access could be verified.' };
    }

    if (!admin) {
      await supabase.auth.signOut();
      return { error: 'Access denied. You do not have admin privileges.' };
    }

    setAdminUser(admin);
    setAuthError(null);
    setIsLoading(false);
    logAdminAction({ action: 'ADMIN_LOGIN', metadata: { email } });
    return { error: null };
  }, [fetchAdminRole]);

  const signOutAdmin = useCallback(async () => {
    if (adminUser) {
      logAdminAction({ action: 'ADMIN_LOGOUT', metadata: { email: adminUser.email } });
    }
    await supabase.auth.signOut();
    setAdminUser(null);
  }, [adminUser]);

  const can = useCallback((permission: Permission): boolean => {
    if (!adminUser) return false;
    return hasPermission(adminUser.role, permission);
  }, [adminUser]);

  // ------------------------------------------------------------

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isLoading,
        authError,
        isAdminAuthenticated: !!adminUser,
        hasSession,
        can,
        retryAdminVerification,
        signInAdmin,
        signOutAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------

export function useAdminAuth(): AdminAuthContextType {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used inside <AdminAuthProvider>');
  return ctx;
}
