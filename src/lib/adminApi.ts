/**
 * Study Hub admin API client.
 * All calls go to Supabase Edge Functions — never to client-side code.
 * The service role key stays server-side.
 */
import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token || ''}`,
    'apikey': SUPABASE_ANON_KEY,
  };
}

async function callEdgeFunction(
  functionName: string,
  options: { method?: string; body?: object; params?: Record<string, string> } = {}
) {
  const { method = 'GET', body, params } = options;
  const headers = await getAuthHeaders();
  const url = new URL(`${SUPABASE_URL}/functions/v1/${functionName}`);

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url.toString(), {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Admin Stats ─────────────────────────────────────────────
export async function getAdminStats() {
  return callEdgeFunction('admin-stats');
}

// ─── User Management ─────────────────────────────────────────
export async function listAdminUsers(options: { search?: string; status?: string; page?: number } = {}) {
  return callEdgeFunction('admin-users', {
    params: {
      action: 'list',
      ...(options.search ? { search: options.search } : {}),
      ...(options.status ? { status: options.status } : {}),
      page: String(options.page || 1),
    },
  });
}

export async function suspendUser(userId: string, reason?: string) {
  return callEdgeFunction('admin-users', {
    method: 'POST',
    params: { action: 'suspend' },
    body: { target_user_id: userId, reason },
  });
}

export async function restoreUser(userId: string, reason?: string) {
  return callEdgeFunction('admin-users', {
    method: 'POST',
    params: { action: 'restore' },
    body: { target_user_id: userId, reason },
  });
}

export async function changeUserRole(userId: string, newRole: string, reason?: string) {
  return callEdgeFunction('admin-users', {
    method: 'POST',
    params: { action: 'change_role' },
    body: { target_user_id: userId, new_role: newRole, reason },
  });
}

export async function resetUserOnboarding(userId: string) {
  return callEdgeFunction('admin-users', {
    method: 'POST',
    params: { action: 'reset_onboarding' },
    body: { target_user_id: userId },
  });
}

export async function revokeUserSessions(userId: string, reason?: string) {
  return callEdgeFunction('admin-users', {
    method: 'POST',
    params: { action: 'revoke_sessions' },
    body: { target_user_id: userId, reason },
  });
}

// ─── Data Export ──────────────────────────────────────────────
export async function requestDataExport(): Promise<Blob> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${SUPABASE_URL}/functions/v1/data-export`, {
    headers,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Export failed');
  }
  return res.blob();
}

// ─── Account Deletion ────────────────────────────────────────
export async function deleteAccount() {
  return callEdgeFunction('account-delete', { method: 'POST' });
}

// ─── Audit Log Helper ─────────────────────────────────────────
export async function writeAuditLog(entry: {
  action: string;
  target_type: string;
  target_id: string;
  target_label?: string;
  before_state?: object;
  after_state?: object;
  reason?: string;
}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .maybeSingle();

  await supabase.from('admin_audit_log').insert({
    actor_id: session.user.id,
    actor_role: roleData?.role || 'unknown',
    ...entry,
  });
}
