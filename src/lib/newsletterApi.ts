import { supabase } from './supabase';

export async function subscribeNewsletter(email: string): Promise<{ success: boolean; message?: string }> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    const { error } = await supabase
      .from('newsletter_signups')
      .insert([{ email: cleanEmail }]);

    if (error) {
      if (
        error.code === '23505' ||
        error.message?.toLowerCase().includes('already exists') ||
        error.message?.toLowerCase().includes('duplicate')
      ) {
        return { success: false, message: "You're already subscribed!" };
      }
      return { success: false, message: error.message || 'Subscription failed. Please try again.' };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to submit email.' };
  }
}

export async function getNewsletterSignupCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('newsletter_signups')
      .select('*', { count: 'exact', head: true });

    if (error || typeof count !== 'number') {
      return 0;
    }
    return count;
  } catch {
    return 0;
  }
}
