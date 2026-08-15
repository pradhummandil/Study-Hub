import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Plus,
  RotateCw,
  Play,
} from 'lucide-react';
import { useStudentContext } from '../context/StudentContext';
import type { FlashcardDeck, Flashcard, SpacedRating } from '../types/intelligence';
import {
  fetchFlashcardDecks,
  fetchFlashcards,
  createFlashcardDeck,
  reviewFlashcard,
  bulkInsertAIFlashcards,
} from '../lib/intelligence/flashcards';

export default function FlashcardsPage() {
  const { targetExam } = useStudentContext();

  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);

  // Active Deck Study Session
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [activeCards, setActiveCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Modal States
  const [showCreateDeckModal, setShowCreateDeckModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckSubject, setNewDeckSubject] = useState('Computer Networks');

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [targetExam]);

  async function loadData() {
    const d = await fetchFlashcardDecks(targetExam);
    const c = await fetchFlashcards({ exam: targetExam });
    setDecks(d);
    setCards(c);
  }

  function startDeckStudy(deck: FlashcardDeck) {
    const deckCards = cards.filter((c) => c.deck_id === deck.id || !c.deck_id);
    setActiveDeck(deck);
    setActiveCards(deckCards.length > 0 ? deckCards : cards);
    setCurrentIndex(0);
    setIsFlipped(false);
  }

  async function handleCardRating(rating: SpacedRating) {
    const card = activeCards[currentIndex];
    if (!card) return;

    await reviewFlashcard(card.id, rating);

    if (currentIndex + 1 < activeCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setActiveDeck(null);
      loadData();
    }
  }

  // Keyboard Shortcuts (1 = Again, 2 = Hard, 3 = Good, 4 = Easy, Space = Flip)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!activeDeck || activeCards.length === 0) return;
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (isFlipped) {
        if (e.key === '1') handleCardRating('Again');
        if (e.key === '2') handleCardRating('Hard');
        if (e.key === '3') handleCardRating('Good');
        if (e.key === '4') handleCardRating('Easy');
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDeck, activeCards, currentIndex, isFlipped]);

  async function handleCreateDeck(e: React.FormEvent) {
    e.preventDefault();
    if (!newDeckTitle.trim()) return;
    const created = await createFlashcardDeck({
      exam: 'GATE',
      subject: newDeckSubject,
      title: newDeckTitle,
    });
    setDecks((prev) => [created, ...prev]);
    setNewDeckTitle('');
    setShowCreateDeckModal(false);
  }

  async function handleGenerateAiCards(e: React.FormEvent) {
    e.preventDefault();
    if (!aiTopic.trim()) return;
    setAiLoading(true);

    try {
      // Call Gemini API via /api/study-ai
      const res = await fetch('/api/study-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Generate 5 flashcards for ${aiTopic}. Respond strictly in JSON format as an array of objects with keys: "front", "back", "topic", "difficulty".`,
            },
          ],
          context: { mode: 'Revision', topic: aiTopic },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const responseText = data.response || '';
        // Extract JSON array from code fence if present
        const jsonMatch = responseText.match(/\[\s*\{.*\}\s*\]/s);
        const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
        const parsed = JSON.parse(jsonStr);

        if (Array.isArray(parsed)) {
          await bulkInsertAIFlashcards({
            deckId: activeDeck?.id,
            exam: 'GATE',
            subject: 'Computer Science',
            rawItems: parsed,
          });
          loadData();
        }
      }
    } catch (err) {
      console.warn('AI Flashcard generation error:', err);
    } finally {
      setAiLoading(false);
      setShowAiModal(false);
      setAiTopic('');
    }
  }

  const currentCard = activeDeck && activeCards.length > 0 ? activeCards[currentIndex] : null;

  return (
    <>
      <Helmet>
        <title>Flashcards | Study Hub Intelligence</title>
        <meta name="description" content="Master concepts with active recall flashcards powered by spaced repetition." />
      </Helmet>

      <div className="min-h-screen pb-16 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2 font-semibold">Active Recall System</p>
            <h1 className="text-4xl sm:text-5xl font-normal text-foreground" style={{ fontFamily: "'Instrument Serif', serif" }}>
              Flashcard Decks
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Quick active recall powered by spaced repetition.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAiModal(true)}
              className="liquid-glass px-4 py-2.5 rounded-full text-purple-300 border border-purple-500/30 font-medium text-xs flex items-center gap-2 hover:bg-purple-500/10 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Generate Deck
            </button>
            <button
              onClick={() => setShowCreateDeckModal(true)}
              className="gradient-cta px-5 py-2.5 rounded-full text-slate-950 font-semibold text-xs flex items-center gap-2 transition-transform hover:scale-105 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4" /> Create Deck
            </button>
          </div>
        </div>

        {/* Active Study Flashcard Player */}
        {activeDeck && currentCard ? (
          <div className="max-w-2xl mx-auto mb-12">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
                <span>Card {currentIndex + 1} of {activeCards.length}</span>
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 font-semibold">{currentCard.topic}</span>
              </div>

              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="relative h-72 w-full cursor-pointer perspective-1000 my-4"
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="w-full h-full relative preserve-3d"
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl p-8 bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center backface-hidden shadow-2xl">
                    <span className="text-xs text-slate-500 font-semibold uppercase mb-4">Front (Question)</span>
                    <p className="text-xl font-bold text-slate-100">{currentCard.front}</p>
                    <span className="text-xs text-cyan-400 font-semibold mt-6 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5" /> Click card to reveal back
                    </span>
                  </div>

                  {/* Back Side */}
                  <div className="absolute inset-0 w-full h-full rounded-2xl p-8 bg-gradient-to-b from-slate-900 to-slate-950 border border-cyan-500/40 flex flex-col items-center justify-center text-center backface-hidden rotate-y-180 shadow-2xl">
                    <span className="text-xs text-emerald-400 font-semibold uppercase mb-4">Back (Answer)</span>
                    <p className="text-lg font-medium text-slate-200">{currentCard.back}</p>
                  </div>
                </motion.div>
              </div>

              {/* Rating Buttons */}
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-800"
                >
                  <button
                    onClick={() => handleCardRating('Again')}
                    className="py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs font-bold flex flex-col items-center gap-0.5"
                  >
                    <span>Again</span>
                    <span className="text-[10px] opacity-70 font-mono">[1]</span>
                  </button>
                  <button
                    onClick={() => handleCardRating('Hard')}
                    className="py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold flex flex-col items-center gap-0.5"
                  >
                    <span>Hard</span>
                    <span className="text-[10px] opacity-70 font-mono">[2]</span>
                  </button>
                  <button
                    onClick={() => handleCardRating('Good')}
                    className="py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 text-xs font-bold flex flex-col items-center gap-0.5"
                  >
                    <span>Good</span>
                    <span className="text-[10px] opacity-70 font-mono">[3]</span>
                  </button>
                  <button
                    onClick={() => handleCardRating('Easy')}
                    className="py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex flex-col items-center gap-0.5"
                  >
                    <span>Easy</span>
                    <span className="text-[10px] opacity-70 font-mono">[4]</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        ) : null}

        {/* Decks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <motion.div
              key={deck.id}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 backdrop-blur-xl transition-all"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-slate-800 text-cyan-400 font-semibold">{deck.subject}</span>
                <span>{deck.card_count || 3} cards</span>
              </div>

              <h3 className="text-xl font-bold text-slate-100 mb-2">{deck.title}</h3>
              <p className="text-slate-400 text-xs line-clamp-2 mb-6">{deck.description || 'Active recall cards for rapid exam preparation.'}</p>

              <button
                onClick={() => startDeckStudy(deck)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> Study Deck
              </button>
            </motion.div>
          ))}
        </div>

        {/* Create Deck Modal */}
        {showCreateDeckModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl p-6 bg-slate-900 border border-slate-800">
              <h3 className="text-xl font-bold text-slate-100 mb-4">Create Flashcard Deck</h3>
              <form onSubmit={handleCreateDeck} className="space-y-4 text-sm">
                <div>
                  <label className="text-slate-400 block mb-1">Deck Title</label>
                  <input
                    type="text"
                    value={newDeckTitle}
                    onChange={(e) => setNewDeckTitle(e.target.value)}
                    placeholder="e.g. Subnetting & IP Formulas"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Subject</label>
                  <input
                    type="text"
                    value={newDeckSubject}
                    onChange={(e) => setNewDeckSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateDeckModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* AI Generator Modal */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md rounded-3xl p-6 bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 text-purple-400 font-semibold mb-2 text-xs">
                <Sparkles className="w-4 h-4" /> AI Flashcard Generator
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-4">Generate Cards with StudyMate</h3>
              <form onSubmit={handleGenerateAiCards} className="space-y-4 text-sm">
                <div>
                  <label className="text-slate-400 block mb-1">Topic or Keyword</label>
                  <input
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="e.g. GATE Subnetting, Operating System Deadlocks"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:border-purple-400 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAiModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={aiLoading}
                    className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {aiLoading ? 'Generating Cards...' : 'Generate Cards'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
