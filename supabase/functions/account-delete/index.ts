import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const uid = user.id;

    // Do NOT allow deleting admin accounts via self-service
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', uid)
      .maybeSingle();

    const adminRoles = ['admin', 'super_admin'];
    if (adminRoles.includes(roleData?.role || '')) {
      return new Response(
        JSON.stringify({ error: 'Admin accounts cannot be self-deleted. Contact system administrator.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Data retention policy:
    // - Personal data: deleted
    // - Community posts: anonymized (content kept, user_id nulled or replaced with deleted_user placeholder)
    // - Audit trails: retained per policy
    // - Aggregated analytics: retained (no PII)

    // Anonymize community posts (preserve content for community integrity)
    // We don't delete community content to prevent broken threads
    // Instead we dissociate from the user
    // Note: In a real implementation, you'd create a "[Deleted User]" placeholder user
    // For now, we cascade delete via the FK constraint

    // Delete the auth user — cascades to all user_id FK tables with ON DELETE CASCADE
    const { error: deleteError } = await supabase.auth.admin.deleteUser(uid);
    if (deleteError) {
      console.error('[account-delete] Error deleting user:', deleteError);
      throw deleteError;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Account successfully deleted.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[account-delete] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Account deletion failed. Please try again or contact support.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
