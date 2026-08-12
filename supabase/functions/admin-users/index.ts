import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function createServiceClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  );
}

async function verifyAdmin(supabase: ReturnType<typeof createServiceClient>, token: string, requiredRoles = ['admin', 'super_admin']) {
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  const role = roleData?.role || 'student';
  if (!requiredRoles.includes(role)) return null;
  return { user, role };
}

async function logAuditAction(supabase: ReturnType<typeof createServiceClient>, data: {
  actor_id: string;
  actor_role: string;
  action: string;
  target_type: string;
  target_id: string;
  target_label?: string;
  before_state?: object;
  after_state?: object;
  reason?: string;
}) {
  await supabase.from('admin_audit_log').insert(data);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createServiceClient();
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    // LIST users — moderator and above
    if (req.method === 'GET' && action === 'list') {
      const adminUser = await verifyAdmin(supabase, token, ['moderator', 'content_editor', 'admin', 'super_admin']);
      if (!adminUser) {
        return new Response(JSON.stringify({ error: 'Access denied' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const search = url.searchParams.get('search') || '';
      const statusFilter = url.searchParams.get('status') || 'all';
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '25');
      const offset = (page - 1) * limit;

      // Get users from auth.users via admin API
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers({
        page,
        perPage: limit,
      });

      if (usersError) throw usersError;

      // Get profiles and roles for these users
      const userIds = users.map(u => u.id);
      const [profilesResult, rolesResult] = await Promise.all([
        supabase.from('student_profiles').select('user_id, target_exam, onboarding_completed').in('user_id', userIds),
        supabase.from('user_roles').select('user_id, role').in('user_id', userIds),
      ]);

      const profileMap = new Map(profilesResult.data?.map(p => [p.user_id, p]) || []);
      const roleMap = new Map(rolesResult.data?.map(r => [r.user_id, r.role]) || []);

      const enrichedUsers = users.map(u => ({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || '',
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        email_confirmed: !!u.email_confirmed_at,
        banned: u.banned_until ? new Date(u.banned_until) > new Date() : false,
        role: roleMap.get(u.id) || 'student',
        target_exam: profileMap.get(u.id)?.target_exam || '',
        onboarding_completed: profileMap.get(u.id)?.onboarding_completed || false,
      }));

      return new Response(
        JSON.stringify({ users: enrichedUsers, total: users.length }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // WRITE operations — admin and above only
    const adminUser = await verifyAdmin(supabase, token, ['admin', 'super_admin']);
    if (!adminUser) {
      return new Response(JSON.stringify({ error: 'Access denied — admin required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = req.method === 'POST' ? await req.json() : {};
    const { target_user_id, reason } = body;

    if (!target_user_id) {
      return new Response(JSON.stringify({ error: 'target_user_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'suspend') {
      const { error } = await supabase.auth.admin.updateUserById(target_user_id, {
        ban_duration: '87600h', // 10 years = effectively permanent
      });
      if (error) throw error;

      await logAuditAction(supabase, {
        actor_id: adminUser.user.id,
        actor_role: adminUser.role,
        action: 'suspend_user',
        target_type: 'user',
        target_id: target_user_id,
        reason,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'restore') {
      const { error } = await supabase.auth.admin.updateUserById(target_user_id, {
        ban_duration: 'none',
      });
      if (error) throw error;

      await logAuditAction(supabase, {
        actor_id: adminUser.user.id,
        actor_role: adminUser.role,
        action: 'restore_user',
        target_type: 'user',
        target_id: target_user_id,
        reason,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'change_role') {
      const { new_role } = body;
      const validRoles = ['student', 'moderator', 'content_editor', 'admin'];
      // super_admin can promote to admin; only super_admin can set super_admin
      if (!validRoles.includes(new_role) && !(adminUser.role === 'super_admin' && new_role === 'super_admin')) {
        return new Response(JSON.stringify({ error: 'Invalid role' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { data: currentRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', target_user_id)
        .maybeSingle();

      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: target_user_id, role: new_role, assigned_by: adminUser.user.id });
      if (error) throw error;

      await logAuditAction(supabase, {
        actor_id: adminUser.user.id,
        actor_role: adminUser.role,
        action: 'change_role',
        target_type: 'user',
        target_id: target_user_id,
        before_state: { role: currentRole?.role },
        after_state: { role: new_role },
        reason,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'reset_onboarding') {
      const { error } = await supabase
        .from('student_profiles')
        .update({ onboarding_completed: false })
        .eq('user_id', target_user_id);
      if (error) throw error;

      await logAuditAction(supabase, {
        actor_id: adminUser.user.id,
        actor_role: adminUser.role,
        action: 'reset_onboarding',
        target_type: 'user',
        target_id: target_user_id,
        reason,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'revoke_sessions') {
      const { error } = await supabase.auth.admin.signOut(target_user_id, 'global');
      if (error) throw error;

      await logAuditAction(supabase, {
        actor_id: adminUser.user.id,
        actor_role: adminUser.role,
        action: 'revoke_sessions',
        target_type: 'user',
        target_id: target_user_id,
        reason,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[admin-users] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
