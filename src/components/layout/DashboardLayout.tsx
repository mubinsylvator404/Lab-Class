import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  Bell,
  Briefcase,
  CheckSquare,
  Compass,
  FolderGit2,
  FolderKanban,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  Sparkles,
  User as UserIcon,
  Users,
  X,
  ExternalLink,
} from 'lucide-react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { BreadcrumbItem, Breadcrumbs } from '../common/Breadcrumbs';
import { NotificationDropdown } from '../notifications/NotificationDropdown';

interface NavItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

const STUDENT_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/student/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', to: '/student/profile', icon: UserIcon },
  { label: 'My Skills', to: '/student/skills', icon: Award },
  { label: 'My Portfolio', to: '/student/portfolio', icon: FolderGit2 },
  { label: 'Browse Projects', to: '/student/browse', icon: Compass },
  { label: 'Recommended', to: '/student/recommendations', icon: Sparkles },
  { label: 'My Applications', to: '/student/applications', icon: CheckSquare },
  { label: 'Notifications', to: '/student/notifications', icon: Bell },
  { label: 'Settings', to: '/student/settings', icon: Settings },
];

const CLIENT_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/client/dashboard', icon: LayoutDashboard },
  { label: 'My Projects', to: '/client/projects', icon: Briefcase },
  { label: 'Create Project', to: '/client/projects/new', icon: PlusCircle },
  { label: 'Applications', to: '/client/applications', icon: CheckSquare },
  { label: 'Matched Students', to: '/client/recommended-students', icon: Sparkles },
  { label: 'Client Profile', to: '/client/profile', icon: UserIcon },
  { label: 'Notifications', to: '/client/notifications', icon: Bell },
  { label: 'Settings', to: '/client/settings', icon: Settings },
];

const ADMIN_NAV: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'User Management', to: '/admin/users', icon: Users },
  { label: 'Project Management', to: '/admin/projects', icon: FolderKanban },
  { label: 'Applications', to: '/admin/applications', icon: CheckSquare },
  { label: 'Categories', to: '/admin/categories', icon: Layers },
  { label: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

interface DashboardLayoutProps {
  breadcrumbs: BreadcrumbItem[];
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  breadcrumbs,
  action,
  children,
}) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentUser) return null;

  const navItems =
    currentUser.role === 'student'
      ? STUDENT_NAV
      : currentUser.role === 'client'
      ? CLIENT_NAV
      : ADMIN_NAV;

  const roleLabel =
    currentUser.role === 'student'
      ? 'Student Workspace'
      : currentUser.role === 'client'
      ? 'Client Workspace'
      : 'Administration Console';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between shrink-0">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight text-slate-900 font-display whitespace-nowrap"
        >
          SkillBridge
        </Link>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs font-medium text-slate-500">{roleLabel}</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-200 space-y-3 shrink-0">
        <Link
          to="/explore"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        >
          <span>Public Marketplace</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <div className="flex items-center gap-3 px-2 py-1">
          <Avatar
            src={currentUser.studentProfile?.photo || currentUser.clientProfile?.logo}
            name={currentUser.name}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900 truncate">
              {currentUser.name}
            </p>
            <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile/Tablet Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative w-64 max-w-[85vw] h-full z-10">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar navigation"
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Breadcrumbs items={breadcrumbs} />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {action}
            <NotificationDropdown />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1360px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
