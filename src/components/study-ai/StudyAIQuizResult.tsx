import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, RotateCcw, BookOpen } from 'lucide-react';
import type { QuizResult } from '../../types/study-ai';

interface StudyAIQuizResultProps {
  result: QuizResult;
  onRetry: () => void;
  onPracticeWeak: (topic: string) => void;
  onNewChat: () => void;
}

function CircleScore({ score, total }: { score: number; total: number }) {
  const pct = (score / total) * 100;
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="96" height="96">
        <circle
          cx="48" cy="48" r={radius}
          strokeWidth="6"
          stroke="rgba(255,255,255,0.06)"
          fill="none"
        />
        <motion.circle
          cx="48" cy="48" r={radius}
          strokeWidth="6"
          fill="none"
          stroke="url(#scoreGrad)"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - strokeDash }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5CE1E6" />
            <stop offset="100%" stopColor="#7C83FD" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center z-10">
        <motion.span
          className="block text-2xl font-bold text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="text-xs text-white/40">/{total}</span>
      </div>
    </div>
  );
}

export function StudyAIQuizResult({ result, onRetry, onPracticeWeak, onNewChat }: StudyAIQuizResultProps) {
  const accuracyColor =
    result.accuracy >= 80
      ? '#5CE1E6'
      : result.accuracy >= 60
      ? '#FFB38A'
      : '#ff8a8a';

  const performanceLabel =
    result.accuracy >= 80
      ? '🎉 Excellent work!'
      : result.accuracy >= 60
      ? '👍 Good effort!'
      : '💪 Keep practicing!';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(92,225,230,0.06), rgba(124,131,253,0.06), rgba(255,179,138,0.04))',
        border: '1px solid rgba(92,225,230,0.15)',
      }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.p
          className="text-lg font-semibold text-white mb-1"
          style={{ fontFamily: "'Instrument Serif', serif" }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {performanceLabel}
        </motion.p>
        <p className="text-sm text-white/50">Here's how you did</p>
      </div>

      {/* Score + Accuracy */}
      <div className="flex items-center justify-center gap-8 mb-6">
        <div className="text-center">
          <CircleScore score={result.score} total={result.total} />
          <p className="text-xs text-white/50 mt-1">Your Score</p>
        </div>
        <div className="text-center">
          <motion.div
            className="text-4xl font-bold"
            style={{ color: accuracyColor }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
          >
            {result.accuracy}%
          </motion.div>
          <p className="text-xs text-white/50 mt-1">Accuracy</p>
        </div>
      </div>

      {/* Strong / Weak */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {result.strongTopics.length > 0 && (
          <div
            className="rounded-xl p-3"
            style={{ background: 'rgba(92,225,230,0.08)', border: '1px solid rgba(92,225,230,0.15)' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#5CE1E6' }} />
              <span className="text-xs font-semibold" style={{ color: '#5CE1E6' }}>Strong areas</span>
            </div>
            <ul className="space-y-0.5">
              {result.strongTopics.map((t) => (
                <li key={t} className="text-xs text-white/70">• {t}</li>
              ))}
            </ul>
          </div>
        )}

        {result.weakTopics.length > 0 && (
          <div
            className="rounded-xl p-3"
            style={{ background: 'rgba(255,179,138,0.08)', border: '1px solid rgba(255,179,138,0.15)' }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <AlertCircle className="w-3.5 h-3.5" style={{ color: '#FFB38A' }} />
              <span className="text-xs font-semibold" style={{ color: '#FFB38A' }}>Needs revision</span>
            </div>
            <ul className="space-y-0.5">
              {result.weakTopics.map((t) => (
                <li key={t} className="text-xs text-white/70">• {t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommendation */}
      {result.recommendation && (
        <div
          className="rounded-xl p-3 mb-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-xs font-semibold text-white/60 mb-1">Recommended next step</p>
          <p className="text-sm text-white/80 leading-relaxed">{result.recommendation}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {result.weakTopics.length > 0 && (
          <motion.button
            onClick={() => onPracticeWeak(result.weakTopics[0])}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{
              background: 'linear-gradient(135deg, #5CE1E6, #7C83FD)',
              color: 'white',
              boxShadow: '0 0 12px rgba(92,225,230,0.25)',
            }}
            id="quiz-result-practice-btn"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Practice weak topic
          </motion.button>
        )}

        <motion.button
          onClick={onRetry}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)',
          }}
          id="quiz-result-retry-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Try again
        </motion.button>

        <motion.button
          onClick={onNewChat}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-4 py-2 rounded-xl text-sm font-medium"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.6)',
          }}
          id="quiz-result-new-btn"
        >
          New question
        </motion.button>
      </div>
    </motion.div>
  );
}
