// src/components/admin/AdminSidebar.tsx
//
// Desktop: in-flow flex child inside .admin-sidebar-wrap.
//          height: 100%; overflow-y: auto; overscroll-behavior: contain.
//          Mouse wheel is captured here naturally — no JS needed.
//
// Mobile:  position: fixed overlay (rendered via .admin-sidebar--mobile CSS class).
//          Controlled by isMobile prop.

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, BarChart3,
  Settings, ScrollText, HeadphonesIcon, Shield, LogOut, Activity,
  ScanSearch, FileDown, Sparkles, Edit3
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ROLE_LABELS, Permission } from '@/lib/adminRbac';

interface NavItem {
  label: string;
  icon: any;
  to: string;
  permission?: Permission;
}

const PLATFORM_NAV: NavItem[] = [
  { label: 'Dashboard',   icon: LayoutDashboard, to: '/admin/dashboard' },
  { label: 'Activity',    icon: Activity,        to: '/admin/activity',     permission: 'audit.view' },
  { label: 'Users',       icon: Users,           to: '/admin/users',        permission: 'users.view' },
  { label: 'Scans',       icon: ScanSearch,      to: '/admin/scans',        permission: 'reports.view' },
  { label: 'Reports',     icon: FileText,        to: '/admin/reports',      permission: 'reports.view' },
  { label: 'PDFs',        icon: FileDown,        to: '/admin/pdfs',         permission: 'reports.view' },
  { label: 'AI Intel',    icon: Sparkles,        to: '/admin/ai',           permission: 'reports.view' },
  { label: 'Blogs',       icon: Edit3,           to: '/admin/blogs',        permission: 'settings.edit' },
];

const FINANCIAL_NAV: NavItem[] = [
  { label: 'Revenue',       icon: BarChart3,  to: '/admin/revenue',       permission: 'analytics.view' },
  { label: 'Subscriptions', icon: ScrollText, to: '/admin/subscriptions', permission: 'credits.view' },
  { label: 'Plans',         icon: Settings,   to: '/admin/plans',         permission: 'settings.edit' },
  { label: 'Credits',       icon: Sparkles,   to: '/admin/credits',       permission: 'credits.view' },
];

const SETTINGS_NAV: NavItem[] = [
  { label: 'Support',    icon: HeadphonesIcon, to: '/admin/support' },
  { label: 'Settings',   icon: Settings,       to: '/admin/settings', permission: 'settings.view' },
  { label: 'Audit Logs', icon: ScrollText,     to: '/admin/logs',     permission: 'audit.view' },
];

interface AdminSidebarProps {
  isOpen?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen = true,
  isMobile = false,
  onClose,
}) => {
  const { adminUser, signOutAdmin, can } = useAdminAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutAdmin();
    navigate('/admin/login');
  };

  const handleNavClick = () => {
    if (isMobile && onClose) onClose();
  };

  const filterNav = (items: NavItem[]) =>
    items.filter(item => !item.permission || can(item.permission));

  const filteredPlatform = filterNav(PLATFORM_NAV);
  const filteredFinancial = filterNav(FINANCIAL_NAV);
  const filteredSettings  = filterNav(SETTINGS_NAV);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    ['sidebar-nav-item', isActive ? 'sidebar-nav-item--active' : 'sidebar-nav-item--idle'].join(' ');

  // On mobile: position fixed, translate to open/close.
  // On desktop: stays in-flow inside wrapper (wrapper handles width collapse).
  const asideClass = isMobile
    ? `admin-sidebar admin-sidebar--mobile ${isOpen ? 'admin-sidebar--mobile-open' : ''}`
    : 'admin-sidebar';

  return (
    <aside
      className={asideClass}
      aria-label="Admin navigation"
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Shield className="h-4 w-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <p className="sidebar-logo-name">SEO Hub</p>
          <p className="sidebar-logo-sub">Admin Console</p>
        </div>
      </div>

      {/* Nav — THE scroll container on desktop */}
      <nav className="sidebar-nav" aria-label="Admin menu">

        {filteredPlatform.length > 0 && (
          <div>
            <p className="sidebar-section-label">Platform</p>
            <div className="sidebar-nav-group">
              {filteredPlatform.map(({ label, icon: Icon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={handleNavClick}
                  className={navLinkClass}
                  end={to === '/admin/dashboard'}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {filteredFinancial.length > 0 && (
          <div>
            <p className="sidebar-section-label">Financial Ops</p>
            <div className="sidebar-nav-group">
              {filteredFinancial.map(({ label, icon: Icon, to }) => (
                <NavLink key={to} to={to} onClick={handleNavClick} className={navLinkClass}>
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {filteredSettings.length > 0 && (
          <div>
            <p className="sidebar-section-label">System</p>
            <div className="sidebar-nav-group">
              {filteredSettings.map(({ label, icon: Icon, to }) => (
                <NavLink key={to} to={to} onClick={handleNavClick} className={navLinkClass}>
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            <span>{adminUser?.email?.[0]?.toUpperCase() ?? 'A'}</span>
          </div>
          <div className="sidebar-user-info">
            <p className="sidebar-user-email">{adminUser?.email ?? '—'}</p>
            {adminUser?.role && (
              <p className="sidebar-user-role">{ROLE_LABELS[adminUser.role]}</p>
            )}
          </div>
        </div>
        <button onClick={handleSignOut} className="sidebar-signout">
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
