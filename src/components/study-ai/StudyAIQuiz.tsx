import { motion, AnimatePresence } from 'framer-motion';
import type { QuizQuestion, DifficultyLevel, ExamType } from '../../types/study-ai';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

interface QuizState {
  questions: QuizQuestion[];
  currentIndex: number;
  answers: Record<number, 'A' | 'B' | 'C' | 'D' | null>;
  revealed: Record<number, boolean>;
  completed: boolean;
}

interface QuizConfig {
  count: 5 | 10 | 15;
  difficulty: DifficultyLevel;
  exam: ExamType;
}

interface StudyAIQuizProps {
  quizState: QuizState;
  onAnswer: (answer: 'A' | 'B' | 'C' | 'D') => void;
  onNext: () => void;
  onFinish: () => void;
  config: QuizConfig | null;
}

function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = ((current) / total) * 100;
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs text-white/50 shrink-0 font-medium">
        Question {current} of {total}
      </span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{
            background: 'linear-gradient(90deg, #5CE1E6, #7C83FD)',
          }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function StudyAIQuiz({ quizState, onAnswer, onNext, onFinish }: StudyAIQuizProps) {
  const { questions, currentIndex, answers, revealed } = quizState;

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white/40 text-sm">No questions available</div>
      </div>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  const selectedAnswer = answers[currentIndex] ?? null;
  const isRevealed = revealed[currentIndex] ?? false;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const isLast = currentIndex === questions.length - 1;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl p-5"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(92,225,230,0.12)',
        }}
      >
        {/* Progress */}
        <ProgressBar current={currentIndex + 1} total={questions.length} />

        {/* Topic + difficulty badge */}
        <div className="flex items-center gap-2 mb-3">
          {question.topic && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
              style={{
                background: 'rgba(92,225,230,0.1)',
                color: '#5CE1E6',
                border: '1px solid rgba(92,225,230,0.2)',
              }}
            >
              {question.topic}
            </span>
          )}
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium text-white/40"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            {question.difficulty}
          </span>
          <span className="text-[10px] text-white/30 italic">AI-generated practice</span>
        </div>

        {/* Question */}
        <p className="text-white/90 text-sm md:text-base leading-relaxed mb-5 font-medium">
          {question.question}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.label;
            const isCorrectOption = option.label === question.correctAnswer;

            let optionStyle: React.CSSProperties = {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.8)',
            };

            if (isRevealed) {
              if (isCorrectOption) {
                optionStyle = {
                  background: 'rgba(92,225,230,0.12)',
                  border: '1px solid rgba(92,225,230,0.4)',
                  color: '#5CE1E6',
                };
              } else if (isSelected && !isCorrectOption) {
                optionStyle = {
                  background: 'rgba(255,100,100,0.1)',
                  border: '1px solid rgba(255,100,100,0.3)',
                  color: 'rgba(255,150,150,0.9)',
                };
              } else {
                optionStyle = {
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.4)',
                };
              }
            } else if (isSelected) {
              optionStyle = {
                background: 'linear-gradient(135deg, rgba(92,225,230,0.12), rgba(124,131,253,0.12))',
                border: '1px solid rgba(124,131,253,0.4)',
                color: 'white',
              };
            }

            return (
              <motion.button
                key={option.label}
                onClick={() => !isRevealed && onAnswer(option.label)}
                disabled={isRevealed}
                whileHover={!isRevealed ? { scale: 1.01, x: 2 } : {}}
                whileTap={!isRevealed ? { scale: 0.99 } : {}}
                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5CE1E6]/50 flex items-center gap-3 disabled:cursor-default"
                style={optionStyle}
                id={`quiz-option-${option.label}`}
                aria-label={`Option ${option.label}: ${option.text}`}
              >
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: isRevealed && isCorrectOption
                      ? '#5CE1E6'
                      : isRevealed && isSelected && !isCorrectOption
                      ? 'rgba(255,100,100,0.4)'
                      : isSelected && !isRevealed
                      ? 'rgba(124,131,253,0.4)'
                      : 'rgba(255,255,255,0.08)',
                    color: isRevealed && isCorrectOption ? '#062B3D' : 'inherit',
                  }}
                >
                  {option.label}
                </span>
                <span className="flex-1">{option.text}</span>
                {isRevealed && isCorrectOption && (
                  <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#5CE1E6' }} />
                )}
                {isRevealed && isSelected && !isCorrectOption && (
                  <XCircle className="w-4 h-4 shrink-0" style={{ color: 'rgba(255,100,100,0.8)' }} />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Result + explanation */}
        <AnimatePresence>
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              {/* Result badge */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                style={{
                  background: isCorrect
                    ? 'rgba(92,225,230,0.08)'
                    : 'rgba(255,179,138,0.08)',
                  border: isCorrect
                    ? '1px solid rgba(92,225,230,0.2)'
                    : '1px solid rgba(255,179,138,0.2)',
                }}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#5CE1E6' }} />
                    <span className="text-xs font-semibold" style={{ color: '#5CE1E6' }}>
                      Correct! ✓
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" style={{ color: '#FFB38A' }} />
                    <span className="text-xs font-semibold" style={{ color: '#FFB38A' }}>
                      Not quite — the answer is {question.correctAnswer}
                    </span>
                  </>
                )}
              </div>

              {/* Explanation */}
              {question.explanation && (
                <div
                  className="px-3 py-2.5 rounded-xl mb-4"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <p className="text-xs font-semibold text-white/60 mb-1">Explanation</p>
                  <p className="text-sm text-white/75 leading-relaxed">{question.explanation}</p>
                </div>
              )}

              {/* Next / Finish */}
              <motion.button
                onClick={isLast ? onFinish : onNext}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #5CE1E6, #7C83FD)',
                  color: 'white',
                  boxShadow: '0 0 16px rgba(92,225,230,0.3)',
                }}
                id={isLast ? 'quiz-finish-btn' : 'quiz-next-btn'}
              >
                {isLast ? 'See my results' : 'Next question'}
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
