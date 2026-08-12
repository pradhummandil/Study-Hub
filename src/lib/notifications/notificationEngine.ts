// src/lib/notifications/notificationEngine.ts
import { supabase } from '../supabase';
import type { AppNotification, NotificationPreferences } from '../../types/ecosystem';

export async function fetchUserNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error || !data) return [];
    return data as AppNotification[];
  } catch (err) {
    console.warn('Failed to fetch user notifications:', err);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    return !error;
  } catch (err) {
    console.warn('Failed to mark notification read:', err);
    return false;
  }
}

export async function markAllNotificationsAsRead(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    return !error;
  } catch (err) {
    console.warn('Failed to mark all notifications read:', err);
    return false;
  }
}

export async function fetchNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const defaultPrefs: NotificationPreferences = {
    user_id: userId,
    study_reminders: true,
    revision_reminders: true,
    mock_reminders: true,
    community: true,
    achievements: true,
  };

  try {
    const { data } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) return data as NotificationPreferences;
  } catch (err) {
    console.warn('Failed to fetch notification preferences:', err);
  }

  return defaultPrefs;
}

export async function updateNotificationPreferences(prefs: NotificationPreferences): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert(prefs);

    return !error;
  } catch (err) {
    console.warn('Failed to upsert notification preferences:', err);
    return false;
  }
}

export async function createNotification(notif: Omit<AppNotification, 'id' | 'created_at' | 'read'>): Promise<boolean> {
  try {
    const { error } = await supabase.from('notifications').insert({
      user_id: notif.user_id,
      type: notif.type,
      title: notif.title,
      body: notif.body,
      action_url: notif.action_url,
      read: false,
    });

    return !error;
  } catch (err) {
    console.warn('Failed to create notification:', err);
    return false;
  }
}
