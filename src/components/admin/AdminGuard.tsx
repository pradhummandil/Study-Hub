import type { ReactNode } from 'react';
import { Shield, Lock } from 'lucide-react';
import { useAdminRole } from '../../hooks/useAdminRole';
import type { UserRole } from '../../hooks/useAdminRole';

interface AdminGuardProps {
  children: ReactNode;
  requiredRole?: UserRole;
}

export function AdminGuard({ children, requiredRole = 'moderator' }: AdminGuardProps) {
  const { role, loading } = useAdminRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#062B3D]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-[#5CE1E6] border-t-transparent animate-spin" />
          <p className="text-[#5CE1E6] text-sm font-medium tracking-wide">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Check if user has the required role
  const roleHierarchy: Record<UserRole, number> = {
    student: 0,
    moderator: 1,
    content_editor: 2,
    admin: 3,
    super_admin: 4,
  };

  const hasAccess = roleHierarchy[role] >= roleHierarchy[requiredRole];

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#062B3D]">
        <div className="text-center p-8 max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
              <Lock className="w-10 h-10 text-red-400" />
            </div>
          </div>
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold tracking-widest uppercase">
              <Shield className="w-3 h-3" />
              Access Denied
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Restricted Area</h1>
          <p className="text-white/60 mb-6 leading-relaxed">
            You don't have permission to access this section.
            This area requires <span className="text-white/90 font-medium">{requiredRole}</span> privileges or higher.
          </p>
          <p className="text-white/30 text-sm">
            Current role: <span className="text-white/50 font-medium">{role}</span>
          </p>
          <a
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5CE1E6]/10 border border-[#5CE1E6]/30 text-[#5CE1E6] text-sm font-medium hover:bg-[#5CE1E6]/20 transition-colors"
          >
            ← Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
