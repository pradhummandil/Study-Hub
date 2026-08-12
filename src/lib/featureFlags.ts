// ─── Study Hub Feature Flags Engine ───────────────────────────────────────────
import { supabase } from './supabase';
import type { FeatureFlagItem } from '../types/phase5';

const DEFAULT_FLAGS: Record<string, boolean> = {
  advanced_tutor: true,
  rag: true,
  voice_mode: true,
  exam_simulator: true,
  billing: true,
  referrals: true,
  mentor_portal: true,
  institution_mode: true,
};

let cachedFlags: Record<string, boolean> = { ...DEFAULT_FLAGS };

export async function loadFeatureFlags(): Promise<Record<string, boolean>> {
  try {
    const { data } = await supabase.from('feature_flags').select('*');
    if (data && data.length > 0) {
      data.forEach((flag: FeatureFlagItem) => {
        cachedFlags[flag.flag_key] = flag.enabled;
      });
    }
  } catch {
    // Keep defaults
  }
  return cachedFlags;
}

export function isFeatureEnabled(flagKey: string): boolean {
  return cachedFlags[flagKey] ?? DEFAULT_FLAGS[flagKey] ?? true;
}
