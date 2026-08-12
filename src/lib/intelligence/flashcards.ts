// src/lib/intelligence/flashcards.ts
import { supabase } from '../supabase';
import type { FlashcardDeck, Flashcard, SpacedRating } from '../../types/intelligence';
import { calculateNextSpacedInterval } from './revision';

const FLASHCARD_DECKS_KEY = 'studyhub_flashcard_decks';
const FLASHCARDS_KEY = 'studyhub_flashcards';

export interface RawAIFlashcardItem {
  front: string;
  back: string;
  topic?: string;
  difficulty?: string;
}

export function validateAIFlashcardItem(raw: any): RawAIFlashcardItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const front = typeof raw.front === 'string' ? raw.front.trim() : '';
  const back = typeof raw.back === 'string' ? raw.back.trim() : '';

  if (!front || !back) return null;

  return {
    front,
    back,
    topic: typeof raw.topic === 'string' ? raw.topic.trim() : 'General',
    difficulty: ['Easy', 'Medium', 'Hard'].includes(raw.difficulty) ? raw.difficulty : 'Medium',
  };
}

export async function fetchFlashcardDecks(exam: string = 'GATE'): Promise<FlashcardDeck[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data, error } = await supabase
        .from('flashcard_decks')
        .select('*')
        .eq('user_id', user.id)
        .eq('exam', exam);

      if (!error && data && data.length > 0) {
        saveLocalDecks(data as FlashcardDeck[]);
        return data as FlashcardDeck[];
      }
    }
  } catch (err) {
    console.warn('Flashcard decks fetch warning:', err);
  }
  return getLocalDecks().filter((d) => d.exam === exam);
}

export async function fetchFlashcards(params: { exam?: string; deckId?: string; subject?: string }): Promise<Flashcard[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      let query = supabase.from('flashcards').select('*').eq('user_id', user.id);
      if (params.deckId) query = query.eq('deck_id', params.deckId);
      if (params.exam) query = query.eq('exam', params.exam);
      if (params.subject) query = query.eq('subject', params.subject);

      const { data, error } = await query;
      if (!error && data) {
        saveLocalCards(data as Flashcard[]);
        return data as Flashcard[];
      }
    }
  } catch (err) {
    console.warn('Flashcards fetch warning:', err);
  }

  let list = getLocalCards();
  if (params.deckId) list = list.filter((c) => c.deck_id === params.deckId);
  if (params.exam) list = list.filter((c) => c.exam === params.exam);
  if (params.subject) list = list.filter((c) => c.subject === params.subject);
  return list;
}

export async function createFlashcardDeck(params: {
  exam: string;
  subject: string;
  title: string;
  description?: string;
}): Promise<FlashcardDeck> {
  const deck: FlashcardDeck = {
    id: `deck-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: 'local',
    exam: params.exam,
    subject: params.subject,
    title: params.title,
    description: params.description,
    card_count: 0,
    is_public: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const list = getLocalDecks();
  list.unshift(deck);
  saveLocalDecks(list);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      deck.user_id = user.id;
      await supabase.from('flashcard_decks').insert(deck);
    }
  } catch (err) {
    console.warn('Failed to insert flashcard deck:', err);
  }

  return deck;
}

export async function createFlashcard(params: {
  deckId?: string;
  exam: string;
  subject: string;
  topic: string;
  front: string;
  back: string;
  sourceType?: 'custom' | 'ai_generated' | 'mistake' | 'roadmap';
  sourceId?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}): Promise<Flashcard> {
  const card: Flashcard = {
    id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: 'local',
    deck_id: params.deckId,
    exam: params.exam,
    subject: params.subject,
    topic: params.topic,
    front: params.front,
    back: params.back,
    source_type: params.sourceType || 'custom',
    source_id: params.sourceId,
    difficulty: params.difficulty || 'Medium',
    review_count: 0,
    interval_days: 1,
    easiness: 2.5,
    next_review_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const cards = getLocalCards();
  cards.unshift(card);
  saveLocalCards(cards);

  if (params.deckId) {
    updateDeckCardCount(params.deckId, 1);
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      card.user_id = user.id;
      await supabase.from('flashcards').insert(card);
    }
  } catch (err) {
    console.warn('Failed to insert flashcard:', err);
  }

  return card;
}

export async function reviewFlashcard(id: string, rating: SpacedRating): Promise<Flashcard | null> {
  const cards = getLocalCards();
  const index = cards.findIndex((c) => c.id === id);
  if (index < 0) return null;

  const card = cards[index];
  const { nextIntervalDays, newEasiness } = calculateNextSpacedInterval({
    rating,
    intervalDays: card.interval_days || 1,
    easiness: card.easiness || 2.5,
  });

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + nextIntervalDays);

  const updated: Flashcard = {
    ...card,
    review_count: card.review_count + 1,
    interval_days: nextIntervalDays,
    easiness: newEasiness,
    last_reviewed_at: new Date().toISOString(),
    next_review_at: nextDate.toISOString(),
    updated_at: new Date().toISOString(),
  };

  cards[index] = updated;
  saveLocalCards(cards);

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      updated.user_id = user.id;
      await supabase.from('flashcards').upsert(updated);
      await supabase.from('flashcard_reviews').insert({
        user_id: user.id,
        flashcard_id: updated.id,
        rating,
        interval_days: nextIntervalDays,
      });
    }
  } catch (err) {
    console.warn('Failed to persist flashcard review:', err);
  }

  return updated;
}

export async function bulkInsertAIFlashcards(params: {
  deckId?: string;
  exam: string;
  subject: string;
  rawItems: any[];
}): Promise<Flashcard[]> {
  const validCards: Flashcard[] = [];

  for (const raw of params.rawItems) {
    const validated = validateAIFlashcardItem(raw);
    if (validated) {
      const card = await createFlashcard({
        deckId: params.deckId,
        exam: params.exam,
        subject: params.subject,
        topic: validated.topic || 'General',
        front: validated.front,
        back: validated.back,
        sourceType: 'ai_generated',
        difficulty: (validated.difficulty as any) || 'Medium',
      });
      validCards.push(card);
    }
  }

  return validCards;
}

function updateDeckCardCount(deckId: string, delta: number) {
  const decks = getLocalDecks();
  const d = decks.find((item) => item.id === deckId);
  if (d) {
    d.card_count = Math.max(0, (d.card_count || 0) + delta);
    saveLocalDecks(decks);
  }
}

function getLocalDecks(): FlashcardDeck[] {
  try {
    const raw = localStorage.getItem(FLASHCARD_DECKS_KEY);
    return raw ? JSON.parse(raw) : getSeedDecks();
  } catch {
    return getSeedDecks();
  }
}

function saveLocalDecks(items: FlashcardDeck[]) {
  try {
    localStorage.setItem(FLASHCARD_DECKS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Local flashcard decks save warning:', err);
  }
}

function getLocalCards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(FLASHCARDS_KEY);
    return raw ? JSON.parse(raw) : getSeedCards();
  } catch {
    return getSeedCards();
  }
}

function saveLocalCards(items: Flashcard[]) {
  try {
    localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Local flashcards save warning:', err);
  }
}

function getSeedDecks(): FlashcardDeck[] {
  return [
    {
      id: 'deck-cn-subnets',
      user_id: 'local',
      exam: 'GATE',
      subject: 'Computer Networks',
      title: 'Subnetting & IP Formulas',
      description: 'Essential network CIDR prefixes, host limits, and subnet mask mappings.',
      card_count: 3,
      is_public: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'deck-os-deadlocks',
      user_id: 'local',
      exam: 'GATE',
      subject: 'Operating Systems',
      title: 'Deadlock Conditions & Prevention',
      description: 'Quick memory triggers for Coffman conditions and resource allocation graphs.',
      card_count: 2,
      is_public: true,
      created_at: new Date().toISOString(),
    },
  ];
}

function getSeedCards(): Flashcard[] {
  const today = new Date().toISOString();
  return [
    {
      id: 'fc-1',
      user_id: 'local',
      deck_id: 'deck-cn-subnets',
      exam: 'GATE',
      subject: 'Computer Networks',
      topic: 'Subnetting',
      front: 'What does a /26 prefix length mean in IPv4 subnetting?',
      back: '26 bits allocated for network & subnet ID, leaving 6 bits for host IDs (2^6 - 2 = 62 usable hosts). Subnet mask: 255.255.255.192.',
      source_type: 'custom',
      difficulty: 'Medium',
      review_count: 0,
      interval_days: 1,
      easiness: 2.5,
      next_review_at: today,
      created_at: today,
    },
    {
      id: 'fc-2',
      user_id: 'local',
      deck_id: 'deck-cn-subnets',
      exam: 'GATE',
      subject: 'Computer Networks',
      topic: 'TCP/UDP',
      front: 'What controls the rate of sender transmission in TCP flow control?',
      back: 'The Receiver Window (rwnd) advertised in TCP header ACK segments to prevent buffer overflow at the receiver.',
      source_type: 'mistake',
      difficulty: 'Hard',
      review_count: 1,
      interval_days: 2,
      easiness: 2.4,
      next_review_at: today,
      created_at: today,
    },
    {
      id: 'fc-3',
      user_id: 'local',
      deck_id: 'deck-os-deadlocks',
      exam: 'GATE',
      subject: 'Operating Systems',
      topic: 'Deadlocks',
      front: 'Name the 4 necessary conditions for Deadlock.',
      back: '1. Mutual Exclusion\n2. Hold & Wait\n3. No Preemption\n4. Circular Wait',
      source_type: 'custom',
      difficulty: 'Easy',
      review_count: 2,
      interval_days: 4,
      easiness: 2.6,
      next_review_at: today,
      created_at: today,
    },
  ];
}
