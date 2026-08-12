import { motion } from 'framer-motion';
import type { Message } from '../../types/study-ai';
import { StudyAIAvatar } from './StudyAIAvatar';
import { RefreshCw } from 'lucide-react';

// Simple markdown-like renderer for AI responses
function renderContent(content: string): React.ReactNode {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (!line.trim()) {
      elements.push(<div key={key++} className="h-2" />);
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      elements.push(
        <h4 key={key++} className="font-semibold text-white/90 mt-2 mb-1 text-sm">
          {renderInline(line.slice(4))}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h3 key={key++} className="font-semibold text-white mt-2 mb-1">
          {renderInline(line.slice(3))}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h2 key={key++} className="font-semibold text-white mt-2 mb-1 text-base">
          {renderInline(line.slice(2))}
        </h2>
      );
    }
    // Bullet points
    else if (line.startsWith('- ') || line.startsWith('• ')) {
      elements.push(
        <div key={key++} className="flex gap-2 items-start pl-1">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: '#5CE1E6', opacity: 0.8 }} />
          <span className="text-white/85 text-sm leading-relaxed">{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered lists
    else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.+)$/);
      if (match) {
        elements.push(
          <div key={key++} className="flex gap-2 items-start pl-1">
            <span className="mt-0.5 text-xs font-bold shrink-0 w-5 text-right" style={{ color: '#5CE1E6' }}>
              {match[1]}.
            </span>
            <span className="text-white/85 text-sm leading-relaxed">{renderInline(match[2])}</span>
          </div>
        );
      }
    }
    // Horizontal rule
    else if (line === '---' || line === '***') {
      elements.push(
        <hr key={key++} className="border-white/10 my-2" />
      );
    }
    // Normal paragraph
    else {
      elements.push(
        <p key={key++} className="text-white/85 text-sm leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  }

  return <div className="flex flex-col gap-1">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold**, *italic*, `code`
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={i} className="italic text-white/80">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 rounded text-xs font-mono"
          style={{ background: 'rgba(92,225,230,0.15)', color: '#5CE1E6' }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

interface StudyAIMessageProps {
  message: Message;
  isLast?: boolean;
  onRetry?: () => void;
}

export function StudyAIMessage({ message, isLast = false, onRetry }: StudyAIMessageProps) {
  const isAI = message.role === 'assistant';
  const isTyping = message.isTyping;
  const isError = message.isError || message.status === 'error';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex gap-3 ${isAI ? 'items-start' : 'items-start justify-end'}`}
    >
      {/* AI Avatar */}
      {isAI && (
        <div className="shrink-0 mt-1">
          <StudyAIAvatar size="sm" showSparkle={isLast && !isTyping && !isError} />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 relative ${
          isAI ? 'rounded-tl-sm' : 'rounded-tr-sm'
        }`}
        style={
          isAI
            ? {
                background: isError
                  ? 'rgba(255,100,100,0.08)'
                  : 'rgba(255,255,255,0.04)',
                border: isError
                  ? '1px solid rgba(255,100,100,0.25)'
                  : '1px solid rgba(92,225,230,0.15)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
              }
            : {
                background: 'linear-gradient(135deg, rgba(92,225,230,0.12), rgba(124,131,253,0.12))',
                border: '1px solid rgba(124,131,253,0.25)',
                boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
              }
        }
      >
        <div>
          {isAI ? (
            <div className="ai-message-content">
              {renderContent(message.content)}
            </div>
          ) : (
            <p className="text-white/90 text-sm leading-relaxed">{message.content}</p>
          )}
        </div>

        {/* Error state and inline retry button */}
        {isError && (
          <div className="mt-3 pt-2.5 border-t border-red-500/20 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs text-red-300/90 font-medium flex items-center gap-1.5">
              <span>⚠️</span>
              <span>StudyMate couldn't answer right now. Your question is saved.</span>
            </span>
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                id="message-retry-btn"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Try again</span>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
