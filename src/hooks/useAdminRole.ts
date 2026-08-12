import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export type UserRole = 'student' | 'moderator' | 'content_editor' | 'admin' | 'super_admin';

export interface AdminRoleState {
  role: UserRole;
  isStudent: boolean;
  isModerator: boolean;
  isContentEditor: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canAccessAdmin: boolean;
  loading: boolean;
  error: string | null;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  student: 0,
  moderator: 1,
  content_editor: 2,
  admin: 3,
  super_admin: 4,
};

export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function useAdminRole(): AdminRoleState {
  const { user, loading: authLoading } = useAuth();
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setRole('student');
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchRole() {
      try {
        // Always fetch from database — never trust localStorage or client-supplied role
        const { data, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user!.id)
          .maybeSingle();

        if (cancelled) return;

        if (roleError) {
          console.warn('[useAdminRole] Error fetching role:', roleError.message);
          setError(roleError.message);
          setRole('student');
        } else {
          setRole((data?.role as UserRole) || 'student');
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to verify role');
          setRole('student');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRole();
    return () => { cancelled = true; };
  }, [user, authLoading]);

  const canAccessAdmin = hasRole(role, 'moderator');

  return {
    role,
    isStudent: role === 'student',
    isModerator: hasRole(role, 'moderator'),
    isContentEditor: hasRole(role, 'content_editor'),
    isAdmin: hasRole(role, 'admin'),
    isSuperAdmin: role === 'super_admin',
    canAccessAdmin,
    loading: authLoading || loading,
    error,
  };
}
