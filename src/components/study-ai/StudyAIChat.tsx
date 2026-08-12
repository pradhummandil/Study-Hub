import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { Message } from '../../types/study-ai';
import { StudyAIMessage } from './StudyAIMessage';
import { StudyAIThinking } from './StudyAIThinking';

interface StudyAIChatProps {
  messages: Message[];
  isThinking?: boolean;
  onRetry?: () => void;
}

export function StudyAIChat({ messages, isThinking = false, onRetry }: StudyAIChatProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message or thinking state
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  return (
    <div
      className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-5 no-scrollbar"
      role="log"
      aria-label="Chat messages"
      aria-live="polite"
    >
      {messages.map((message, i) => (
        <StudyAIMessage
          key={message.id}
          message={message}
          isLast={i === messages.length - 1}
          onRetry={onRetry}
        />
      ))}

      {/* Thinking state animation */}
      <AnimatePresence>
        {isThinking && <StudyAIThinking key="thinking-state" />}
      </AnimatePresence>

      <div ref={bottomRef} />
    </div>
  );
}
