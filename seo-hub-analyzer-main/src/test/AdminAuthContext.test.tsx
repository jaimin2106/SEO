import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  from: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
      signOut: mocks.signOut,
    },
    from: mocks.from,
  },
  isMockMode: false,
}));

vi.mock("@/lib/adminAudit", () => ({ logAdminAction: vi.fn() }));

import { AdminGuard } from "@/components/admin/AdminGuard";
import { PermissionGuard } from "@/components/admin/PermissionGuard";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";

const adminSession: Session = {
  access_token: "test-access-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "test-refresh-token",
  user: {
    id: "admin-user",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01T00:00:00Z",
    email: "admin@example.test",
  },
};

let authStateCallback:
  | ((event: AuthChangeEvent, session: Session | null) => void)
  | undefined;

function renderProtectedAdmin(initialPath = "/admin") {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AdminAuthProvider>
        <Routes>
          <Route
            path="/admin/*"
            element={
              <AdminGuard>
                <div>Admin page</div>
                <PermissionGuard permission="settings.edit">
                  <div>Admin settings</div>
                </PermissionGuard>
              </AdminGuard>
            }
          />
          <Route path="/admin/login" element={<div>Login page</div>} />
          <Route path="/admin/forbidden" element={<div>Forbidden page</div>} />
        </Routes>
      </AdminAuthProvider>
    </MemoryRouter>,
  );
}

function setRoleResult(result: unknown) {
  const single = vi.fn().mockImplementation(() => Promise.resolve(result));
  mocks.from.mockReturnValue({
    select: () => ({
      eq: () => single(),
    }),
  });
  return single;
}

describe("AdminAuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authStateCallback = undefined;
    mocks.getSession.mockResolvedValue({
      data: { session: adminSession },
      error: null,
    });
    mocks.onAuthStateChange.mockImplementation((callback: unknown) => {
      authStateCallback = callback as (
        event: AuthChangeEvent,
        session: Session | null
      ) => void;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
  });

  it("allows an authorized admin after restoring the persisted session", async () => {
    setRoleResult({
      data: [
        { role_id: "viewer-role", admin_roles: { name: "VIEWER" } },
        { role_id: "admin-role", admin_roles: { name: "SUPER_ADMIN" } },
      ],
      error: null,
    });

    renderProtectedAdmin();

    expect(await screen.findByText("Admin page")).toBeInTheDocument();
    expect(await screen.findByText("Admin settings")).toBeInTheDocument();
    expect(screen.queryByText("Forbidden page")).not.toBeInTheDocument();
  });

  it("allows an authorized admin to load a nested route directly", async () => {
    setRoleResult({
      data: [{ role_id: "admin-role", admin_roles: { name: "ADMIN" } }],
      error: null,
    });

    renderProtectedAdmin("/admin/settings");

    expect(await screen.findByText("Admin page")).toBeInTheDocument();
    expect(await screen.findByText("Admin settings")).toBeInTheDocument();
  });

  it("redirects an unauthenticated visitor to the admin login route", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    renderProtectedAdmin();

    expect(await screen.findByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Admin page")).not.toBeInTheDocument();
  });

  it("keeps a normal authenticated user blocked", async () => {
    setRoleResult({
      data: [],
      error: null,
    });

    renderProtectedAdmin();

    expect(await screen.findByText("Forbidden page")).toBeInTheDocument();
    expect(screen.queryByText("Admin page")).not.toBeInTheDocument();
  });

  it("surfaces role lookup failures instead of treating them as non-admin users", async () => {
    setRoleResult({
      data: null,
      error: { code: "42501", message: "Permission denied" },
    });

    renderProtectedAdmin();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to verify admin role: Permission denied",
    );
    expect(screen.queryByText("Forbidden page")).not.toBeInTheDocument();
  });

  it("does not restore admin access when sign-out races the initial role lookup", async () => {
    let resolveRoleLookup!: (result: { data: unknown; error: null }) => void;
    const pendingRoleLookup = new Promise<{ data: unknown; error: null }>((resolve) => {
      resolveRoleLookup = resolve;
    });
    setRoleResult(pendingRoleLookup);

    renderProtectedAdmin();
    await waitFor(() => expect(mocks.from).toHaveBeenCalledWith("user_roles"));

    act(() => {
      authStateCallback?.("SIGNED_OUT", null);
    });

    expect(await screen.findByText("Login page")).toBeInTheDocument();

    await act(async () => {
      resolveRoleLookup({
        data: [{ role_id: "admin-role", admin_roles: { name: "SUPER_ADMIN" } }],
        error: null,
      });
      await pendingRoleLookup;
    });

    expect(screen.queryByText("Admin page")).not.toBeInTheDocument();
    expect(screen.queryByText("Forbidden page")).not.toBeInTheDocument();
  });
});
