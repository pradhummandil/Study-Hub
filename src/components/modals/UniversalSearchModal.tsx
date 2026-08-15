import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, BookOpen, Video, FileText, Layers, AlertCircle, Sparkles } from 'lucide-react';
import { useStudentContext } from '../../context/StudentContext';

interface SearchResultItem {
  id: string;
  type: 'Question' | 'Topic' | 'Video' | 'Notes' | 'Flashcard' | 'Mistake';
  title: string;
  subtitle: string;
  url: string;
}

interface UniversalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Synonym Map for Intelligent Query Expansion
const SYNONYM_MAP: Record<string, string[]> = {
  tcp: ['transmission control protocol', 'congestion control', 'networking'],
  os: ['operating system', 'process scheduling', 'deadlock', 'paging'],
  dbms: ['database', 'sql', 'normalization', 'transactions', 'acid'],
  algo: ['algorithms', 'sorting', 'graphs', 'dynamic programming'],
  ds: ['data structures', 'trees', 'linked list', 'heaps'],
};

export const UniversalSearchModal: React.FC<UniversalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { targetExam, subjects } = useStudentContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);

  // Keyboard shortcut Ctrl+K / Cmd+K to open
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const matches: SearchResultItem[] = [];

    // Expand search query with synonyms
    const expandedTerms = [q];
    Object.entries(SYNONYM_MAP).forEach(([key, syns]) => {
      if (q.includes(key)) {
        expandedTerms.push(...syns);
      }
    });

    // Match Subjects & Topics
    subjects.forEach((sub) => {
      if (expandedTerms.some((t) => sub.toLowerCase().includes(t))) {
        matches.push({
          id: `topic-${sub}`,
          type: 'Topic',
          title: sub,
          subtitle: `${targetExam} Core Subject`,
          url: `/practice?subject=${encodeURIComponent(sub)}`,
        });
        matches.push({
          id: `video-${sub}`,
          type: 'Video',
          title: `${sub} Video Lectures`,
          subtitle: `Watch topic breakdown and lectures`,
          url: `/video-learning?subject=${encodeURIComponent(sub)}`,
        });
        matches.push({
          id: `notes-${sub}`,
          type: 'Notes',
          title: `${sub} Formula & Concept Notes`,
          subtitle: `Read high-yield notes`,
          url: `/notes?subject=${encodeURIComponent(sub)}`,
        });
      }
    });

    // Sample Search Match Additions
    if (q.includes('tcp') || q.includes('congestion') || q.includes('network')) {
      matches.push({
        id: 'q-tcp-1',
        type: 'Question',
        title: 'TCP Congestion Control Window Size Calculation',
        subtitle: 'Official GATE CS 2024 PYQ',
        url: '/practice?subject=Computer%20Networks&topic=TCP%20Congestion%20Control',
      });
      matches.push({
        id: 'm-tcp-1',
        type: 'Mistake',
        title: 'TCP Slow Start Threshold Miscalculation',
        subtitle: 'Saved in Mistake Notebook',
        url: '/mistakes?search=TCP',
      });
    }

    if (q.includes('schedul') || q.includes('process') || q.includes('os')) {
      matches.push({
        id: 'fc-os-1',
        type: 'Flashcard',
        title: 'CPU Scheduling Algorithms Comparison',
        subtitle: 'Flashcard Deck (SJF vs Round Robin)',
        url: '/flashcards?subject=Operating%20Systems',
      });
    }

    setResults(matches.slice(0, 8));
  }, [query, subjects, targetExam]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 p-4">
      <div className="bg-paper border border-forest/15 rounded-3xl p-5 max-w-2xl w-full shadow-2xl space-y-4 animate-scale-up">
        {/* Search Input Header */}
        <div className="flex items-center gap-3 bg-parchment/80 rounded-2xl px-4 py-3 border border-forest/10">
          <Search className="w-5 h-5 text-scholar shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search questions, topics, videos, notes, flashcards for ${targetExam}...`}
            className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-muted hover:text-ink">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Container */}
        {results.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {results.map((res) => (
              <div
                key={res.id}
                onClick={() => {
                  navigate(res.url);
                  onClose();
                }}
                className="p-3 bg-parchment/50 hover:bg-parchment rounded-2xl border border-forest/10 hover:border-scholar transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded-xl bg-scholar/10 text-scholar shrink-0">
                    {res.type === 'Video' && <Video className="w-4 h-4" />}
                    {res.type === 'Notes' && <BookOpen className="w-4 h-4" />}
                    {res.type === 'Question' && <FileText className="w-4 h-4" />}
                    {res.type === 'Flashcard' && <Layers className="w-4 h-4" />}
                    {res.type === 'Mistake' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                    {res.type === 'Topic' && <Sparkles className="w-4 h-4 text-gold" />}
                  </div>

                  <div className="overflow-hidden">
                    <h4 className="text-xs sm:text-sm font-bold text-ink group-hover:text-scholar transition-colors truncate">
                      {res.title}
                    </h4>
                    <p className="text-[11px] text-muted truncate mt-0.5">{res.subtitle}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-scholar/10 text-scholar font-bold rounded-md shrink-0">
                  {res.type}
                </span>
              </div>
            ))}
          </div>
        ) : query.trim() ? (
          <div className="py-8 text-center text-xs text-muted font-mono">
            No direct matches for "{query}". Try searching for subject names like "Computer Networks" or "OS".
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-muted font-mono">
            Type to search across Questions, Videos, Notes, Flashcards & Saved Mistakes.
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-forest/10 text-[10px] font-mono text-muted">
          <span>Search index tuned for {targetExam}</span>
          <span>Press ESC or Ctrl+K to close</span>
        </div>
      </div>
    </div>
  );
};
