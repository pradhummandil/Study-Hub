import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CheckCircle2, Bookmark, Sparkles } from 'lucide-react';
import { fetchPracticeQuestions, toggleSaveMistake, getLocalSavedMistakes } from '../lib/practiceApi';
import type { PracticeQuestion } from '../types/student-core';

export default function QuestionDetail() {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<PracticeQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    async function loadQuestion() {
      if (!questionId) return;
      setLoading(true);
      const all = await fetchPracticeQuestions({});
      const found = all.find((q) => q.id === questionId);
      if (found) {
        setQuestion(found);
      }
      setIsSaved(getLocalSavedMistakes().includes(questionId));
      setLoading(false);
    }
    loadQuestion();
  }, [questionId]);

  const handleToggleSave = async () => {
    if (!questionId) return;
    const nextState = !isSaved;
    setIsSaved(nextState);
    await toggleSaveMistake(questionId, nextState);
  };

  const handleAskStudyMate = () => {
    if (!question) return;
    const promptText = `Please explain this ${question.exam} question on ${question.topic} step by step:\n\nQuestion: "${question.question_text}"\nOptions: ${JSON.stringify(question.options)}\nCorrect Answer: ${JSON.stringify(question.correct_answer)}\nExplanation: ${question.explanation || 'N/A'}`;
    navigate('/study-ai', { state: { prompt: promptText, mode: 'Explain', subject: question.subject } });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-muted-foreground">Loading question details...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Question Not Found</h2>
        <p className="text-xs text-muted-foreground mb-4">The requested question ID could not be loaded.</p>
        <Link to="/practice" className="gradient-cta rounded-full px-6 py-2.5 text-xs text-black font-semibold">
          Back to Question Bank
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Question View — {question.topic} | Study Hub</title>
      </Helmet>

      <div className="px-6 pt-10 max-w-4xl mx-auto pb-24 space-y-6">
        <Link to="/mistakes" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Back to Mistakes Notebook
        </Link>

        <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6 shadow-2xl">
          {/* Metadata */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="liquid-glass px-2.5 py-1 rounded-lg text-cyan-300 font-mono font-semibold border border-cyan-500/20">
                {question.exam} {question.year || ''}
              </span>
              <span className="text-muted-foreground">• {question.subject}</span>
              <span className="text-muted-foreground">• {question.topic}</span>
            </div>

            <button
              onClick={handleToggleSave}
              className={`text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                isSaved
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'liquid-glass text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isSaved ? 'Saved in Mistakes ✓' : 'Save to Mistakes'}
            </button>
          </div>

          {/* Question text */}
          <div className="text-base sm:text-lg text-foreground font-normal leading-relaxed">
            {question.question_text}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {question.options?.map((opt, i) => {
              const letter = String.fromCharCode(65 + i);
              const isSelected = selectedOption === letter;
              const isCorrectOpt = String(question.correct_answer).toUpperCase() === letter;

              let optClass = 'liquid-glass border-white/10 hover:border-white/30 text-foreground';
              if (revealed) {
                if (isCorrectOpt) {
                  optClass = 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-semibold';
                } else if (isSelected && !isCorrectOpt) {
                  optClass = 'bg-rose-500/20 border-rose-400 text-rose-300';
                }
              } else if (isSelected) {
                optClass = 'bg-cyan-500/10 border-cyan-400 text-foreground ring-1 ring-cyan-400/50';
              }

              return (
                <button
                  key={i}
                  onClick={() => {
                    setSelectedOption(letter);
                    setRevealed(true);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border text-sm transition-all flex items-center justify-between ${optClass}`}
                >
                  <span>{opt}</span>
                  {revealed && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Solution Explanation Box */}
          {revealed && (
            <div className="mt-6 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-fade-rise">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-mono">Verified Solution</span>
                <button
                  onClick={handleAskStudyMate}
                  className="liquid-glass rounded-full px-3 py-1 text-xs text-violet-300 border border-violet-500/30 hover:bg-violet-500/20 transition-colors inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Ask StudyMate
                </button>
              </div>

              <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                {question.explanation || 'Step-by-step verification complete.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
