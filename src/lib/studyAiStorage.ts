import { supabase } from './supabase';
import type { ChatSession, Message, ExamType, StudyMode, MessageMetadata, MessageStatus } from '../types/study-ai';

const LOCAL_CHATS_KEY = 'study_mate_local_chats';
const LOCAL_MSG_PREFIX = 'study_mate_local_msg_';

// Deterministic short title generator (max 45 chars)
export function generateChatTitle(firstUserMessage: string, exam?: ExamType): string {
  const clean = firstUserMessage.trim().replace(/^[^\w]+/, '');
  if (!clean) return exam && exam !== 'General' ? `${exam} Study Session` : 'New study session';

  let title = clean;
  // Remove common question prefixes for cleaner titles
  title = title.replace(/^(explain|what is|how to|help me with|tell me about|can you|give me a|give me)\s+/i, '');
  title = title.charAt(0).toUpperCase() + title.slice(1);

  if (title.length > 40) {
    title = title.slice(0, 37).trim() + '...';
  }

  if (exam && exam !== 'General' && !title.toLowerCase().includes(exam.toLowerCase())) {
    title = `${exam}: ${title}`;
    if (title.length > 45) title = title.slice(0, 42) + '...';
  }

  return title;
}

// ── Supabase Database Storage (Authenticated) ───────────────────────────────────

export async function dbFetchUserChats(userId: string): Promise<ChatSession[]> {
  try {
    const { data, error } = await supabase
      .from('study_ai_chats')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching study_ai_chats:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      exam: row.exam as ExamType,
      subject: row.subject,
      mode: row.mode as StudyMode,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (err) {
    console.error('dbFetchUserChats error:', err);
    return [];
  }
}

export async function dbFetchChatMessages(chatId: string, userId: string): Promise<Message[]> {
  try {
    const { data, error } = await supabase
      .from('study_ai_messages')
      .select('*')
      .eq('chat_id', chatId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching study_ai_messages:', error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      status: row.status as MessageStatus,
      metadata: row.metadata as MessageMetadata,
      timestamp: new Date(row.created_at),
      isError: row.status === 'error',
    }));
  } catch (err) {
    console.error('dbFetchChatMessages error:', err);
    return [];
  }
}

export async function dbCreateChat(params: {
  userId: string;
  title: string;
  exam?: ExamType;
  subject?: string;
  mode?: StudyMode;
}): Promise<ChatSession | null> {
  try {
    const { data, error } = await supabase
      .from('study_ai_chats')
      .insert({
        user_id: params.userId,
        title: params.title,
        exam: params.exam || 'General',
        subject: params.subject || null,
        mode: params.mode || 'Explain',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating study_ai_chat:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      exam: data.exam as ExamType,
      subject: data.subject,
      mode: data.mode as StudyMode,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.error('dbCreateChat error:', err);
    return null;
  }
}

export async function dbSaveMessage(params: {
  chatId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  status?: MessageStatus;
  metadata?: MessageMetadata;
}): Promise<Message | null> {
  try {
    const { data, error } = await supabase
      .from('study_ai_messages')
      .insert({
        chat_id: params.chatId,
        user_id: params.userId,
        role: params.role,
        content: params.content,
        status: params.status || 'complete',
        metadata: params.metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving study_ai_message:', error);
      return null;
    }

    // Touch parent chat updated_at
    await supabase
      .from('study_ai_chats')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.chatId)
      .eq('user_id', params.userId);

    return {
      id: data.id,
      role: data.role,
      content: data.content,
      status: data.status as MessageStatus,
      metadata: data.metadata as MessageMetadata,
      timestamp: new Date(data.created_at),
      isError: data.status === 'error',
    };
  } catch (err) {
    console.error('dbSaveMessage error:', err);
    return null;
  }
}

export async function dbUpdateMessage(
  messageId: string,
  userId: string,
  content: string,
  status: MessageStatus = 'complete'
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('study_ai_messages')
      .update({ content, status })
      .eq('id', messageId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error updating study_ai_message:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('dbUpdateMessage error:', err);
    return false;
  }
}

export async function dbRenameChat(chatId: string, userId: string, newTitle: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('study_ai_chats')
      .update({ title: newTitle, updated_at: new Date().toISOString() })
      .eq('id', chatId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

export async function dbDeleteChat(chatId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('study_ai_chats')
      .delete()
      .eq('id', chatId)
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

export async function dbClearAllChats(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('study_ai_chats')
      .delete()
      .eq('user_id', userId);

    return !error;
  } catch {
    return false;
  }
}

// ── LocalStorage Fallback (Unauthenticated) ────────────────────────────────────

export function localGetChats(): ChatSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_CHATS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function localSaveChats(chats: ChatSession[]): void {
  try {
    localStorage.setItem(LOCAL_CHATS_KEY, JSON.stringify(chats));
  } catch (err) {
    console.error('localStorage save error:', err);
  }
}

export function localGetMessages(chatId: string): Message[] {
  try {
    const raw = localStorage.getItem(LOCAL_MSG_PREFIX + chatId);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed.map((m: any) => ({
      ...m,
      timestamp: new Date(m.timestamp),
    }));
  } catch {
    return [];
  }
}

export function localSaveMessages(chatId: string, messages: Message[]): void {
  try {
    localStorage.setItem(LOCAL_MSG_PREFIX + chatId, JSON.stringify(messages));
  } catch (err) {
    console.error('localStorage message save error:', err);
  }
}

export function localDeleteChat(chatId: string): void {
  try {
    const chats = localGetChats().filter((c) => c.id !== chatId);
    localSaveChats(chats);
    localStorage.removeItem(LOCAL_MSG_PREFIX + chatId);
  } catch (err) {
    console.error('localStorage delete error:', err);
  }
}

export function localClearAll(): void {
  try {
    const chats = localGetChats();
    chats.forEach((c) => localStorage.removeItem(LOCAL_MSG_PREFIX + c.id));
    localStorage.removeItem(LOCAL_CHATS_KEY);
  } catch (err) {
    console.error('localStorage clear error:', err);
  }
}

export async function migrateLocalChatsToAccount(userId: string): Promise<boolean> {
  try {
    const localChats = localGetChats();
    if (localChats.length === 0) return false;

    for (const localChat of localChats) {
      const messages = localGetMessages(localChat.id);
      const newChat = await dbCreateChat({
        userId,
        title: localChat.title,
        exam: localChat.exam,
        subject: localChat.subject,
        mode: localChat.mode,
      });

      if (newChat && messages.length > 0) {
        for (const msg of messages) {
          await dbSaveMessage({
            chatId: newChat.id,
            userId,
            role: msg.role,
            content: msg.content,
            status: msg.status || 'complete',
            metadata: msg.metadata,
          });
        }
      }
    }

    localClearAll();
    return true;
  } catch (err) {
    console.error('Migration error:', err);
    return false;
  }
}

