import { motion } from 'framer-motion';
import type { ExamType, StudyMode } from '../../types/study-ai';

interface QuickAction {
  id: string;
  emoji: string;
  label: string;
  prompt: string;
  exam?: ExamType;
  mode?: StudyMode;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'brain-test',
    emoji: '🧠',
    label: 'Quick brain test',
    prompt: 'Give me a quick 5-question brain test with mixed difficulty questions covering general academic topics. Present one question at a time with A, B, C, D options.',
    mode: 'Quiz',
  },
  {
    id: 'gate-prep',
    emoji: '🎯',
    label: 'Help me prepare for GATE',
    prompt: 'I want to prepare for GATE CSE. Can you first ask me which subject I want to focus on, then my confidence level, and then create a diagnostic quiz?',
    exam: 'GATE',
  },
  {
    id: 'cn-quiz',
    emoji: '💻',
    label: 'Computer Networks quiz',
    prompt: 'Start a Computer Networks quiz. Ask me which topic: OSI Model, TCP/IP, TCP vs UDP, IP Addressing, Subnetting, Routing, DNS, HTTP/HTTPS, Congestion Control, or Network Security.',
    mode: 'Quiz',
  },
  {
    id: 'jee-main',
    emoji: '📐',
    label: 'JEE Main practice',
    prompt: 'I want to practice for JEE Main. Ask me which subject (Physics/Chemistry/Mathematics) and difficulty level, then give me 5 AI-generated practice questions.',
    exam: 'JEE Main',
    mode: 'Practice',
  },
  {
    id: 'jee-advanced',
    emoji: '🔥',
    label: 'JEE Advanced challenge',
    prompt: 'Give me a challenging JEE Advanced level AI-generated practice problem. Make it multi-step and conceptually deep. Clearly label it as AI-generated practice.',
    exam: 'JEE Advanced',
    mode: 'Practice',
  },
  {
    id: 'explain-topic',
    emoji: '📚',
    label: 'Explain a topic',
    prompt: 'I want you to explain an academic topic. Please ask me: what subject, which topic, and what level (beginner/intermediate/advanced)?',
    mode: 'Explain',
  },
  {
    id: 'study-plan',
    emoji: '🗓️',
    label: 'Build my study plan',
    prompt: 'Help me build a personalized study plan. Please ask me: exam target, exam date, hours available per day, subjects, weak areas, and preferred study time.',
    mode: 'Study Plan',
  },
  {
    id: 'study-today',
    emoji: '⏱️',
    label: 'What should I study today?',
    prompt: "I need guidance on what to study today. Ask me about my exam, subjects, how much time I have, and what I studied yesterday.",
  },
  {
    id: 'neet-practice',
    emoji: '🔬',
    label: 'NEET practice',
    prompt: 'I want to practice for NEET. Ask me which subject (Biology/Physics/Chemistry) and topic, then give me 5 AI-generated practice questions.',
    exam: 'NEET',
    mode: 'Practice',
  },
  {
    id: 'revision-mode',
    emoji: '📝',
    label: 'Revision mode',
    prompt: 'I want to revise a topic. Ask me which subject and topic, and I\'ll give you concise revision notes with key points, formulas, and memory tips.',
    mode: 'Revision',
  },
];

interface StudyAIQuickActionsProps {
  onAction: (prompt: string, exam?: ExamType, mode?: StudyMode) => void;
  compact?: boolean;
}

export function StudyAIQuickActions({ onAction, compact = false }: StudyAIQuickActionsProps) {
  return (
    <div className={`flex gap-2 ${compact ? 'overflow-x-auto pb-1 no-scrollbar' : 'flex-wrap'}`}>
      {QUICK_ACTIONS.map((action, i) => (
        <motion.button
          key={action.id}
          id={`quick-action-${action.id}`}
          onClick={() => onAction(action.prompt, action.exam, action.mode)}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5CE1E6]/50"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.8)',
            whiteSpace: 'nowrap',
          }}
          aria-label={action.label}
        >
          <span>{action.emoji}</span>
          <span>{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
}
