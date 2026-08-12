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

    // Collect user data — never expose internal IDs unnecessarily, never export secrets
    const [profile, gamification, mistakes, flashcards, mockAttempts, downloads, privacy, aiPrefs] = await Promise.all([
      supabase.from('student_profiles').select('target_exam, target_exam_year, target_goal, daily_study_minutes, current_level, onboarding_completed, created_at').eq('user_id', uid).maybeSingle(),
      supabase.from('student_gamification').select('xp, level, level_title, current_streak, longest_streak').eq('user_id', uid).maybeSingle(),
      supabase.from('mistake_notebook').select('exam, subject, topic, mistake_type, severity, mastered, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(500),
      supabase.from('flashcards').select('exam, subject, topic, front, back, source_type, review_count, created_at').eq('user_id', uid).order('created_at', { ascending: false }).limit(500),
      supabase.from('mock_attempts').select('status, score, max_score, accuracy_pct, total_questions, correct_count, wrong_count, time_spent_seconds, started_at, completed_at').eq('user_id', uid).order('started_at', { ascending: false }).limit(100),
      supabase.from('resource_downloads').select('resource_title, downloaded_at').eq('user_id', uid).order('downloaded_at', { ascending: false }).limit(200),
      supabase.from('user_privacy_settings').select('public_profile, community_visibility, leaderboard_participation, ai_chat_history_saved').eq('user_id', uid).maybeSingle(),
      supabase.from('user_ai_preferences').select('response_style, study_difficulty, preferred_mode').eq('user_id', uid).maybeSingle(),
    ]);

    const exportData = {
      export_metadata: {
        generated_at: new Date().toISOString(),
        user_email: user.email,
        export_version: '1.0',
        note: 'This export contains your Study Hub data. Internal database IDs have been omitted.',
      },
      profile: profile.data || null,
      gamification: gamification.data || null,
      privacy_settings: privacy.data || null,
      ai_preferences: aiPrefs.data || null,
      study_data: {
        mistake_notebook: mistakes.data || [],
        flashcards: flashcards.data || [],
        mock_attempts: mockAttempts.data || [],
        downloaded_resources: downloads.data || [],
      },
    };

    return new Response(
      JSON.stringify(exportData, null, 2),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="studyhub-export-${new Date().toISOString().split('T')[0]}.json"`,
        },
      }
    );
  } catch (err) {
    console.error('[data-export] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Export failed. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
