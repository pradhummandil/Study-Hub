// src/lib/studyRooms/studyRoomApi.ts
import { supabase } from '../supabase';
import type { StudyRoom } from '../../types/ecosystem';
import { recordStudyActivity } from '../activity/eventBus';

const FALLBACK_ROOMS: StudyRoom[] = [
  {
    id: 'r1',
    host_id: 'u201',
    title: 'GATE CS Deep Work Session',
    goal: 'Complete 15 CN Subnetting PYQs',
    exam: 'GATE',
    subject: 'Computer Networks',
    duration_minutes: 50,
    privacy: 'public',
    max_participants: 10,
    status: 'active',
    started_at: new Date(Date.now() - 60000 * 15).toISOString(),
    ends_at: new Date(Date.now() + 60000 * 35).toISOString(),
    participant_count: 6,
    host_name: 'Vikram R.',
  },
  {
    id: 'r2',
    host_id: 'u202',
    title: 'JEE Mechanics Sprint',
    goal: 'Rotational Dynamics Problem Set 4',
    exam: 'JEE Advanced',
    subject: 'Physics',
    duration_minutes: 25,
    privacy: 'public',
    max_participants: 8,
    status: 'active',
    started_at: new Date(Date.now() - 60000 * 5).toISOString(),
    ends_at: new Date(Date.now() + 60000 * 20).toISOString(),
    participant_count: 4,
    host_name: 'Ananya S.',
  },
  {
    id: 'r3',
    host_id: 'u203',
    title: 'NEET NCERT Biology Silent Room',
    goal: 'Genetics & Evolution Line-by-Line',
    exam: 'NEET',
    subject: 'Botany',
    duration_minutes: 90,
    privacy: 'public',
    max_participants: 12,
    status: 'active',
    started_at: new Date(Date.now() - 60000 * 40).toISOString(),
    ends_at: new Date(Date.now() + 60000 * 50).toISOString(),
    participant_count: 9,
    host_name: 'Devika M.',
  },
];

export async function fetchActiveStudyRooms(exam?: string): Promise<StudyRoom[]> {
  try {
    let query = supabase.from('study_rooms').select('*').eq('status', 'active').order('started_at', { ascending: false });

    if (exam) {
      query = query.eq('exam', exam);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      let filtered = [...FALLBACK_ROOMS];
      if (exam) filtered = filtered.filter((r) => r.exam === exam);
      return filtered;
    }

    return data as StudyRoom[];
  } catch (err) {
    console.warn('Failed to fetch study rooms:', err);
    return FALLBACK_ROOMS;
  }
}

export async function createStudyRoom(room: {
  hostId: string;
  title: string;
  goal: string;
  exam: string;
  subject?: string;
  durationMinutes: number; // 25, 50, 90
  privacy: 'public' | 'circle' | 'private';
  maxParticipants?: number;
}): Promise<{ success: boolean; room?: StudyRoom; error?: string }> {
  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + room.durationMinutes * 60 * 1000);

  try {
    const { data, error } = await supabase
      .from('study_rooms')
      .insert({
        host_id: room.hostId,
        title: room.title.trim(),
        goal: room.goal.trim(),
        exam: room.exam,
        subject: room.subject || 'General',
        duration_minutes: room.durationMinutes,
        privacy: room.privacy,
        max_participants: room.maxParticipants || 10,
        status: 'active',
        started_at: startedAt.toISOString(),
        ends_at: endsAt.toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to create room.' };
    }

    // Auto add host as participant
    await supabase.from('study_room_participants').insert({
      room_id: data.id,
      user_id: room.hostId,
    });

    return { success: true, room: data as StudyRoom };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error creating study room.' };
  }
}

export async function joinStudyRoom(roomId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('study_room_participants').insert({
      room_id: roomId,
      user_id: userId,
    });

    return !error;
  } catch (err) {
    console.warn('Failed to join study room:', err);
    return false;
  }
}

export async function leaveStudyRoom(roomId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('study_room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', userId);

    return !error;
  } catch (err) {
    console.warn('Failed to leave study room:', err);
    return false;
  }
}

export async function completeStudyRoomSession(
  userId: string,
  subject: string,
  minutes: number
): Promise<void> {
  await recordStudyActivity({
    userId,
    type: 'focus_session_completed',
    metadata: {
      minutes,
      subject,
    },
  });
}
