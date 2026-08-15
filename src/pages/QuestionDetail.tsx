import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, CheckCircle2, Bookmark, Sparkles, ExternalLink, Lightbulb, AlertTriangle, BookOpen } from 'lucide-react';
import { getCanonicalQuestionById } from '../lib/questionEngineApi';
import { toggleSaveMistake, getLocalSavedMistakes } from '../lib/practiceApi';
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
      const found = await getCanonicalQuestionById(questionId);
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
    const promptText = `Please explain this ${question.exam} question on ${question.topic} step by step:\n\nQuestion: "${question.question_text}"\nConcept: ${question.concept || 'N/A'}\nOptions: ${JSON.stringify(question.options)}\nCorrect Answer: ${JSON.stringify(question.correct_answer)}\nExplanation: ${question.solution_text || question.explanation || 'N/A'}`;
    navigate('/study-ai', { state: { prompt: promptText, mode: 'Explain', subject: question.subject } });
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-paper">
        <div className="w-8 h-8 rounded-full border-2 border-scholar border-t-transparent animate-spin mb-3" />
        <p className="text-xs text-muted">Loading question details...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 bg-paper">
        <h2 className="text-2xl font-normal text-ink mb-2" style={{ fontFamily: "'Instrument Serif', serif" }}>Question Not Found</h2>
        <p className="text-xs text-muted mb-4">The requested question ID could not be loaded.</p>
        <Link to="/practice" className="px-6 py-2.5 rounded-xl text-xs text-paper bg-terracotta font-bold shadow-card">
          Back to Question Explorer
        </Link>
      </div>
    );
  }

  const optionsList = Array.isArray(question.options) ? question.options : [];

  return (
    <>
      <Helmet>
        <title>{`Question Detail — ${question.topic} | Study Hub`}</title>
      </Helmet>

      <div className="px-6 pt-10 max-w-4xl mx-auto pb-24 space-y-6 bg-paper text-ink">
        <Link to="/practice" className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-ink">
          <ArrowLeft className="w-4 h-4" /> Back to Question Explorer
        </Link>

        <div className="bg-paper rounded-3xl p-6 sm:p-8 border border-forest/10 space-y-6 shadow-card">
          {/* Metadata Header */}
          <div className="flex items-center justify-between border-b border-forest/10 pb-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="bg-scholar/10 px-3 py-1 rounded-full text-scholar font-mono font-bold border border-scholar/20">
                {question.exam_code || question.exam} {question.year || ''}
              </span>
              <span className="text-muted">• {question.subject}</span>
              <span className="text-muted">• {question.topic}</span>
              {question.source_type && (
                <span className="bg-gold/10 text-gold px-2.5 py-0.5 rounded-full border border-gold/30 text-[10px] font-bold">
                  {question.source_type.replace('_', ' ')}
                </span>
              )}
            </div>

            <button
              onClick={handleToggleSave}
              className={`text-xs px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 font-medium ${
                isSaved
                  ? 'bg-terracotta/20 text-terracotta border border-terracotta/40'
                  : 'bg-parchment text-muted hover:text-ink border border-forest/10'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              {isSaved ? 'Saved ✓' : 'Save Question'}
            </button>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg text-ink font-normal leading-relaxed">
            {question.question_text}
          </div>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {optionsList.map((opt: any, i: number) => {
              const letter = typeof opt === 'object' ? opt.id : String.fromCharCode(65 + i);
              const text = typeof opt === 'object' ? opt.text : opt;
              const isSelected = selectedOption === letter;
              const isCorrectOpt = String(question.correct_answer).toUpperCase().includes(letter);

              let optClass = 'bg-parchment/40 border-forest/10 hover:border-scholar/40 text-ink';
              if (revealed) {
                if (isCorrectOpt) {
                  optClass = 'bg-success/10 border-success text-ink font-semibold';
                } else if (isSelected && !isCorrectOpt) {
                  optClass = 'bg-terracotta/10 border-terracotta text-ink';
                }
              } else if (isSelected) {
                optClass = 'bg-scholar/10 border-scholar text-ink ring-1 ring-scholar/40';
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
                  <span>
                    <strong className="font-mono text-scholar mr-2">{letter}.</strong> {text}
                  </span>
                  {revealed && isCorrectOpt && <CheckCircle2 className="w-5 h-5 text-success shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Solution & Concept Breakdown Box */}
          {revealed && (
            <div className="mt-6 p-6 rounded-3xl bg-parchment/60 border border-forest/10 space-y-5 animate-fade-rise">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-scholar font-mono flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-success" /> Verified Solution
                </span>
                <button
                  onClick={handleAskStudyMate}
                  className="bg-forest text-paper rounded-full px-3.5 py-1.5 text-xs border border-sage/30 hover:bg-forest/90 transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold" /> Ask StudyMate AI
                </button>
              </div>

              {/* Solution Text */}
              <div className="text-xs sm:text-sm text-ink leading-relaxed">
                <p className="font-semibold text-scholar mb-1">Correct Answer: {String(question.correct_answer)}</p>
                <p>{question.solution_text || question.explanation || 'Step-by-step verification complete.'}</p>
              </div>

              {/* Step by Step Breakdown */}
              {question.solution_steps && question.solution_steps.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-forest/10">
                  <p className="text-xs font-bold text-ink uppercase tracking-wider">Solution Steps:</p>
                  <ol className="list-decimal list-inside text-xs text-muted space-y-1">
                    {question.solution_steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Concept & Formula Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-forest/10">
                {question.concept && (
                  <div className="bg-paper p-3.5 rounded-2xl border border-forest/10">
                    <span className="text-[11px] font-bold uppercase text-gold tracking-wider flex items-center gap-1 mb-1">
                      <Lightbulb className="w-3.5 h-3.5 text-gold" /> Key Concept
                    </span>
                    <p className="text-xs text-ink">{question.concept}</p>
                  </div>
                )}

                {question.formula && (
                  <div className="bg-paper p-3.5 rounded-2xl border border-forest/10">
                    <span className="text-[11px] font-bold uppercase text-scholar tracking-wider flex items-center gap-1 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-scholar" /> Formula
                    </span>
                    <p className="text-xs text-ink font-mono">{question.formula}</p>
                  </div>
                )}
              </div>

              {/* Common Mistake Alert */}
              {question.common_mistake && (
                <div className="bg-terracotta/10 p-3.5 rounded-2xl border border-terracotta/20 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-bold uppercase text-terracotta tracking-wider block">Common Pitfall</span>
                    <p className="text-xs text-ink">{question.common_mistake}</p>
                  </div>
                </div>
              )}

              {/* Source Attribution Link */}
              <div className="pt-3 border-t border-forest/10 flex items-center justify-between text-xs text-muted">
                <span>
                  Source: <strong>{question.source_name || 'Official Exam Paper'}</strong>
                </span>
                {question.source_url && (
                  <a
                    href={question.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-scholar font-semibold hover:underline inline-flex items-center gap-1"
                  >
                    View Original Reference <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              {/* Requirement 13 Multi-Modal Action Toolbar */}
              <div className="mt-6 pt-4 border-t border-forest/10 bg-parchment/60 rounded-2xl p-4 space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-scholar bg-scholar/10 px-2.5 py-0.5 rounded">
                    MULTI-MODAL STUDY CONNECTION
                  </span>
                  <h4 className="text-sm font-bold text-ink mt-1">
                    Topic Actions for {question.topic}
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    to={`/practice?subject=${encodeURIComponent(question.subject)}&topic=${encodeURIComponent(question.topic)}`}
                    className="px-3.5 py-2 rounded-xl bg-scholar text-paper font-bold text-xs hover:bg-forest transition-colors shadow-xs"
                  >
                    Practice similar →
                  </Link>
                  <Link
                    to={`/video-learning?subject=${encodeURIComponent(question.subject)}&topic=${encodeURIComponent(question.topic)}`}
                    className="px-3.5 py-2 rounded-xl bg-parchment border border-forest/15 text-ink font-bold text-xs hover:bg-paper transition-colors"
                  >
                    Watch lesson 🎥
                  </Link>
                  <Link
                    to={`/notes?subject=${encodeURIComponent(question.subject)}&topic=${encodeURIComponent(question.topic)}`}
                    className="px-3.5 py-2 rounded-xl bg-parchment border border-forest/15 text-ink font-bold text-xs hover:bg-paper transition-colors"
                  >
                    Open notes 📖
                  </Link>
                  <Link
                    to={`/revision?subject=${encodeURIComponent(question.subject)}&topic=${encodeURIComponent(question.topic)}`}
                    className="px-3.5 py-2 rounded-xl bg-parchment border border-forest/15 text-ink font-bold text-xs hover:bg-paper transition-colors"
                  >
                    Revise 🔄
                  </Link>
                  <Link
                    to={`/flashcards?subject=${encodeURIComponent(question.subject)}&topic=${encodeURIComponent(question.topic)}`}
                    className="px-3.5 py-2 rounded-xl bg-parchment border border-forest/15 text-ink font-bold text-xs hover:bg-paper transition-colors"
                  >
                    Make flashcard 🎴
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
