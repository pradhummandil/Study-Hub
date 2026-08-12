// src/lib/focusStorage.ts

export interface SessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  minutes: number;
  timestamp: number;
}

export interface FocusData {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  logs: SessionLog[];
}

const STORAGE_KEY = 'studyhub_focus_data';

export function getLocalDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getYesterdayDateStr(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateStr(yesterday);
}

const DEFAULT_DATA: FocusData = {
  totalSessions: 0,
  totalMinutes: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastSessionDate: null,
  logs: [],
};

export function getFocusData(): FocusData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_DATA };
    const parsed: FocusData = JSON.parse(raw);

    // Validate & sanitize
    const logs = Array.isArray(parsed.logs) ? parsed.logs : [];
    let currentStreak = typeof parsed.currentStreak === 'number' ? parsed.currentStreak : 0;
    const longestStreak = typeof parsed.longestStreak === 'number' ? parsed.longestStreak : 0;
    const lastSessionDate = typeof parsed.lastSessionDate === 'string' ? parsed.lastSessionDate : null;

    // Check if streak broke because a day was missed
    const today = getLocalDateStr();
    const yesterday = getYesterdayDateStr();

    if (lastSessionDate && lastSessionDate !== today && lastSessionDate !== yesterday) {
      currentStreak = 0;
    }

    return {
      totalSessions: typeof parsed.totalSessions === 'number' ? parsed.totalSessions : 0,
      totalMinutes: typeof parsed.totalMinutes === 'number' ? parsed.totalMinutes : 0,
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
      lastSessionDate,
      logs,
    };
  } catch (error) {
    console.warn('Failed to read focus data from localStorage:', error);
    return { ...DEFAULT_DATA };
  }
}

export function logSession(subject: string, minutes: number): FocusData {
  try {
    const data = getFocusData();
    const today = getLocalDateStr();
    const yesterday = getYesterdayDateStr();

    let newStreak = data.currentStreak;

    if (data.lastSessionDate === today) {
      // Already logged a session today, streak stays intact
      newStreak = Math.max(1, data.currentStreak);
    } else if (data.lastSessionDate === yesterday) {
      // Continued streak from yesterday
      newStreak = data.currentStreak + 1;
    } else {
      // Missed at least one day or first session
      newStreak = 1;
    }

    const newLongest = Math.max(data.longestStreak, newStreak);

    const newLog: SessionLog = {
      id: String(Date.now()),
      date: today,
      subject: subject.trim() || 'General Study',
      minutes,
      timestamp: Date.now(),
    };

    const updatedData: FocusData = {
      totalSessions: data.totalSessions + 1,
      totalMinutes: data.totalMinutes + minutes,
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastSessionDate: today,
      logs: [newLog, ...data.logs].slice(0, 50),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return updatedData;
  } catch (error) {
    console.warn('Failed to save focus data to localStorage:', error);
    return getFocusData();
  }
}
