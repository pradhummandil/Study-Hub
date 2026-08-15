import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Sparkles } from 'lucide-react';
import { useStudentContext } from '../../context/StudentContext';
import { fetchPracticeQuestions, recordQuestionAttempt } from '../../lib/practiceApi';
import type { PracticeQuestion } from '../../types/student-core';

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({ isOpen, onClose }) => {
  const { targetExam, refetchContext } = useStudentContext();

  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    if (isOpen) {
      let isMounted = true;
      async function loadDiagnostic() {
        setLoading(true);
        setCompleted(false);
        setCurrentIndex(0);
        setSelectedAnswers({});
        setScore(0);

        const qList = await fetchPracticeQuestions({ exam: targetExam, limit: 10 });
        if (isMounted) {
          setQuestions(qList.slice(0, 10));
          setLoading(false);
        }
      }
      loadDiagnostic();
      return () => {
        isMounted = false;
      };
    }
  }, [isOpen, targetExam]);

  if (!isOpen) return null;

  const currentQ = questions[currentIndex];

  const handleSelectOption = (optId: string) => {
    if (!currentQ) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentQ.id]: optId }));
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Evaluate results
      let correctCount = 0;
      for (const q of questions) {
        const userAns = selectedAnswers[q.id];
        const isCorrect = String(userAns || '').trim().toUpperCase() === String(q.correct_answer).trim().toUpperCase();
        if (isCorrect) correctCount++;

        // Record real attempt
        await recordQuestionAttempt({
          question_id: q.id,
          exam: targetExam,
          subject: q.subject,
          topic: q.topic,
          user_answer: userAns || 'Skipped',
          is_correct: isCorrect,
          time_taken_seconds: 45,
        });
      }

      setScore(correctCount);
      setCompleted(true);
      refetchContext();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-paper border border-forest/20 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-deep relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-ink p-1 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!completed ? (
          /* Question View */
          loading ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-scholar border-t-transparent animate-spin mx-auto" />
              <p className="text-xs text-muted font-mono">Generating {targetExam} 10-Question Diagnostic...</p>
            </div>
          ) : currentQ ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-forest/10 pb-3">
                <span className="text-xs font-bold text-scholar uppercase tracking-wider font-mono">
                  {targetExam} DIAGNOSTIC • QUESTION {currentIndex + 1} OF {questions.length}
                </span>
                <span className="text-xs text-muted font-mono bg-parchment px-2.5 py-1 rounded-full">
                  {currentQ.subject}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-ink leading-snug">
                  {currentQ.question_text}
                </h3>
                <span className="text-xs text-muted font-mono block">Topic: {currentQ.topic}</span>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQ.options && currentQ.options.length > 0 ? (
                  currentQ.options.map((opt, idx) => {
                    const optKey = String.fromCharCode(65 + idx); // A, B, C, D
                    const isSelected = selectedAnswers[currentQ.id] === optKey;
                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(optKey)}
                        className={`w-full text-left p-4 rounded-2xl border text-xs sm:text-sm font-sans transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-scholar text-paper font-bold border-scholar shadow-sm'
                            : 'bg-parchment/40 text-ink border-forest/10 hover:bg-parchment/80'
                        }`}
                      >
                        <span>{opt}</span>
                        {isSelected && <CheckCircle className="w-4 h-4 text-gold shrink-0 ml-2" />}
                      </button>
                    );
                  })
                ) : (
                  <div className="p-4 bg-parchment rounded-2xl text-xs text-muted">
                    Subjective numerical question. Key in answer:
                    <input
                      type="text"
                      placeholder="Your answer..."
                      value={selectedAnswers[currentQ.id] || ''}
                      onChange={(e) => handleSelectOption(e.target.value)}
                      className="mt-2 w-full p-3 rounded-xl border border-forest/15 bg-paper text-ink font-mono text-sm"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-forest/10">
                <span className="text-xs text-muted font-mono">
                  Progress: {Math.round(((currentIndex + 1) / questions.length) * 100)}%
                </span>
                <button
                  onClick={handleNext}
                  disabled={!selectedAnswers[currentQ.id]}
                  className={`px-6 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                    selectedAnswers[currentQ.id]
                      ? 'bg-scholar text-paper hover:bg-forest shadow-sm cursor-pointer'
                      : 'bg-parchment text-muted cursor-not-allowed'
                  }`}
                >
                  <span>{currentIndex === questions.length - 1 ? 'Finish Diagnostic →' : 'Next Question →'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-muted">No diagnostic questions available.</div>
          )
        ) : (
          /* Completion Result View */
          <div className="py-6 space-y-6 text-center">
            <div className="w-14 h-14 bg-scholar/10 text-scholar rounded-2xl flex items-center justify-center mx-auto">
              <Sparkles className="w-8 h-8 text-gold" />
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-muted tracking-wider">
                DIAGNOSTIC COMPLETED
              </span>
              <h2 className="text-3xl font-normal text-ink mt-1" style={{ fontFamily: "'Instrument Serif', serif" }}>
                Your baseline signal for {targetExam} is ready!
              </h2>
              <div className="mt-3 inline-block bg-forest text-gold px-6 py-3 rounded-2xl font-mono text-2xl font-bold shadow-md">
                {score} / {questions.length} Correct ({Math.round((score / questions.length) * 100)}%)
              </div>
            </div>

            <div className="bg-parchment/60 p-4 rounded-2xl border border-forest/10 max-w-md mx-auto text-left text-xs space-y-2">
              <span className="font-bold text-ink block font-mono">Initial Mastery Signal:</span>
              <p className="text-muted leading-relaxed">
                {score >= 7
                  ? 'Strong foundation across core subjects. You are ready for high-yield PYQ drills and full mocks.'
                  : 'Developing foundation. Recommended focus: Computer Networks & Engineering Mathematics fundamentals.'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-scholar hover:bg-forest text-paper font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <span>Go to Command Center →</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
