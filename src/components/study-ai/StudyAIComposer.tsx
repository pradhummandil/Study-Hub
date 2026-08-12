import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, CornerDownLeft } from 'lucide-react';

interface StudyAIComposerProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const MAX_LENGTH = 2000;

export function StudyAIComposer({ onSend, disabled = false, placeholder }: StudyAIComposerProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift+Enter = new line (default textarea behavior)
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value.length > MAX_LENGTH) return;
    setValue(e.target.value);
    // Auto-resize
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 160) + 'px';
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className="relative rounded-2xl transition-all duration-200"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: value.length > 0
          ? '1px solid rgba(92,225,230,0.25)'
          : '1px solid rgba(255,255,255,0.08)',
        boxShadow: value.length > 0
          ? '0 0 0 2px rgba(92,225,230,0.06)'
          : 'none',
      }}
    >
      <textarea
        ref={textareaRef}
        id="study-ai-composer"
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder || 'Ask anything about your studies…'}
        rows={1}
        maxLength={MAX_LENGTH}
        aria-label="Type your study question"
        className="w-full resize-none bg-transparent text-white/90 placeholder-white/30 text-sm leading-relaxed px-4 pt-3.5 pr-16 pb-3.5 rounded-2xl outline-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ minHeight: 52, maxHeight: 160, scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}
      />

      {/* Send Button */}
      <div className="absolute right-2 bottom-2">
        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          whileHover={canSend ? { scale: 1.05 } : {}}
          whileTap={canSend ? { scale: 0.92 } : {}}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5CE1E6]/50"
          style={
            canSend
              ? {
                  background: 'linear-gradient(135deg, #5CE1E6, #7C83FD)',
                  boxShadow: '0 0 12px rgba(92,225,230,0.4)',
                  cursor: 'pointer',
                }
              : {
                  background: 'rgba(255,255,255,0.06)',
                  cursor: 'not-allowed',
                }
          }
          aria-label="Send message"
          id="study-ai-send-btn"
        >
          <Send
            className="w-4 h-4"
            style={{ color: canSend ? 'white' : 'rgba(255,255,255,0.25)' }}
          />
        </motion.button>
      </div>

      {/* Character count + keyboard hint */}
      <div className="absolute right-14 bottom-3 flex items-center gap-3">
        {value.length > MAX_LENGTH * 0.8 && (
          <span className={`text-[10px] ${value.length >= MAX_LENGTH ? 'text-red-400' : 'text-white/30'}`}>
            {value.length}/{MAX_LENGTH}
          </span>
        )}
        {value.length === 0 && (
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-white/20">
            <CornerDownLeft className="w-3 h-3" />
            <span>send</span>
          </div>
        )}
      </div>
    </div>
  );
}
