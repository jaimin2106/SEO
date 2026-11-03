// src/components/admin/AdminShell.tsx
//
// Layout architecture — matches ChatGPT / Claude / Linear:
//
//   body                   overflow: hidden  (never scrolls)
//   .admin-shell           display: flex; height: 100vh; overflow: hidden
//     .admin-sidebar-wrap  width: 256px | 0;  transition: width  ← collapses content space
//       <AdminSidebar>     height:100%; overflow-y:auto; overscroll:contain
//     .admin-main          flex:1; min-w:0; display:flex flex-col; overflow:hidden
//       .admin-header-bar  height:56px; flex-shrink:0
//       .admin-content     flex:1; overflow-y:auto; overscroll:contain  ← only this scrolls
//
// WHY this fixes sidebar scrolling:
//   The sidebar is an in-flow flex child with overflow-y:auto.
//   The browser knows the cursor is inside a scrollable element.
//   Wheel events are captured by the sidebar naturally — no JS needed.
//   When cursor leaves sidebar → wheel goes to .admin-content.
//
// On mobile: wrapper is always 0px wide. Sidebar becomes position:fixed overlay.

import React, { useState, useEffect, useCallback } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Menu } from 'lucide-react';
import { useAdminRealtime } from '@/hooks/admin/useAdminRealtime';
import { useLocation } from 'react-router-dom';

const SIDEBAR_W = 256; // px — matches .admin-sidebar width in CSS

interface AdminShellProps {
  children: React.ReactNode;
}

export const AdminShell: React.FC<AdminShellProps> = ({ children }) => {
  const getIsDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1024;

  const [sidebarOpen, setSidebarOpen] = useState(getIsDesktop);
  const [isMobile, setIsMobile]       = useState(() => !getIsDesktop());
  const location = useLocation();

  useAdminRealtime();

  // Track breakpoint
  const handleResize = useCallback(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    setSidebarOpen(!mobile); // open on desktop, closed on mobile
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Close on route change (mobile only)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // Lock body scroll when mobile overlay is open
  useEffect(() => {
    document.body.style.overflow = isMobile && sidebarOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobile, sidebarOpen]);

  // Escape closes mobile sidebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobile && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobile, sidebarOpen]);

  return (
    <div className="admin-shell" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="admin-backdrop"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/*
        ── Sidebar wrapper ─────────────────────────────────────────
        Desktop: transitions width 256→0 to open/close, pushing content.
        Mobile:  always 0px wide — sidebar renders as fixed overlay via CSS.
      */}
      <div
        className="admin-sidebar-wrap"
        style={{
          width: !isMobile && sidebarOpen ? `${SIDEBAR_W}px` : 0,
          // Transition only on desktop — mobile is instant overlay
          transition: !isMobile
            ? `width 280ms cubic-bezier(0.4, 0, 0.2, 1)`
            : 'none',
        }}
        aria-hidden={!sidebarOpen}
      >
        <AdminSidebar
          isOpen={sidebarOpen}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="admin-main">

        {/* Sticky header */}
        <div className="admin-header-bar">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="admin-menu-btn"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-expanded={sidebarOpen}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <AdminHeader />
          </div>
        </div>

        {/* Scrollable content — the ONLY vertical scroll zone on desktop */}
        <main className="admin-content" role="main">
          <div className="admin-content-inner">
            {children}
          </div>
        </main>
      </div>

    </div>
  );
};
