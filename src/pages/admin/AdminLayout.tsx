import { useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, HelpCircle, GraduationCap,
  Map, FileText, MessageSquare, Flag, Bot, Bell, BarChart3,
  Activity, Settings, ChevronLeft, ChevronRight, LogOut,
  Shield, Menu, Zap, Video
} from 'lucide-react';
import { useAdminRole } from '../../hooks/useAdminRole';
import { AdminGuard } from '../../components/admin/AdminGuard';
import { useAuth } from '../../context/AuthContext';

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  requiredRole: 'moderator' | 'content_editor' | 'admin' | 'super_admin';
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, requiredRole: 'moderator' },
  { label: 'Users', path: '/admin/users', icon: <Users className="w-4 h-4" />, requiredRole: 'admin' },
  { label: 'Video Learning', path: '/admin/video-learning', icon: <Video className="w-4 h-4" />, requiredRole: 'content_editor' },
  { label: 'Resources', path: '/admin/resources', icon: <BookOpen className="w-4 h-4" />, requiredRole: 'content_editor' },
  { label: 'Question Bank', path: '/admin/questions', icon: <HelpCircle className="w-4 h-4" />, requiredRole: 'content_editor' },
  { label: 'Exams', path: '/admin/exams', icon: <GraduationCap className="w-4 h-4" />, requiredRole: 'content_editor' },
  { label: 'Roadmaps', path: '/admin/roadmaps', icon: <Map className="w-4 h-4" />, requiredRole: 'content_editor' },
  { label: 'Mock Tests', path: '/admin/mock-tests', icon: <FileText className="w-4 h-4" />, requiredRole: 'content_editor' },
  { label: 'Community', path: '/admin/community', icon: <MessageSquare className="w-4 h-4" />, requiredRole: 'moderator' },
  { label: 'Reports', path: '/admin/reports', icon: <Flag className="w-4 h-4" />, requiredRole: 'moderator' },
  { label: 'StudyMate AI', path: '/admin/study-ai', icon: <Bot className="w-4 h-4" />, requiredRole: 'admin' },
  { label: 'Announcements', path: '/admin/announcements', icon: <Bell className="w-4 h-4" />, requiredRole: 'content_editor' },
  { label: 'Analytics', path: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" />, requiredRole: 'admin' },
  { label: 'System Health', path: '/admin/system', icon: <Activity className="w-4 h-4" />, requiredRole: 'admin' },
  { label: 'Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" />, requiredRole: 'super_admin' },
];

const ROLE_HIERARCHY: Record<string, number> = {
  student: 0, moderator: 1, content_editor: 2, admin: 3, super_admin: 4,
};

export default function AdminLayout() {
  const location = useLocation();
  const { role } = useAdminRole();
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(
    item => ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[item.requiredRole]
  );

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const roleBadgeColor = {
    super_admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    admin: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    content_editor: 'bg-green-500/20 text-green-300 border-green-500/30',
    moderator: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    student: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  }[role] || 'bg-gray-500/20 text-gray-300 border-gray-500/30';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-[#5CE1E6] flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-[#062B3D]" />
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm">Study Hub</div>
            <div className="text-white/40 text-xs">Admin Console</div>
          </div>
        )}
      </div>

      {/* Role Badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-white/10">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleBadgeColor} uppercase tracking-wider`}>
            <Zap className="w-3 h-3" />
            {role.replace('_', ' ')}
          </span>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {visibleItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
              isActive(item.path)
                ? 'bg-[#5CE1E6]/15 text-[#5CE1E6] border border-[#5CE1E6]/25'
                : 'text-white/60 hover:text-white hover:bg-white/8'
            } ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <span className={`flex-shrink-0 ${isActive(item.path) ? 'text-[#5CE1E6]' : 'text-white/40 group-hover:text-white/70'}`}>
              {item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && item.badge && (
              <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>

      {/* User Footer */}
      <div className={`border-t border-white/10 p-4 ${collapsed ? 'flex justify-center' : ''}`}>
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5CE1E6] to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">
                  {user?.user_metadata?.full_name || 'Admin'}
                </div>
                <div className="text-white/40 text-xs truncate">{user?.email}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/dashboard"
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all"
              >
                ← Student View
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center justify-center px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => signOut()}
            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <AdminGuard requiredRole="moderator">
      <div className="flex h-screen bg-[#04202E] overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className={`hidden md:flex flex-col flex-shrink-0 bg-[#062B3D] border-r border-white/10 transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
          <SidebarContent />
          {/* Collapse Toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute bottom-24 -right-3 w-6 h-6 rounded-full bg-[#062B3D] border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/40 transition-all z-10"
            style={{ position: 'absolute', left: collapsed ? '50px' : '228px' }}
          >
            {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
          </button>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
            <aside className="relative w-60 bg-[#062B3D] border-r border-white/10 flex flex-col z-10">
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Top Bar */}
          <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#062B3D] border-b border-white/10">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-white font-semibold text-sm">Study Hub Admin</span>
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
