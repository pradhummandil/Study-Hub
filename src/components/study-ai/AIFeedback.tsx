import { useState } from 'react';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

interface AIFeedbackProps {
  sessionId?: string;
  messagePreview?: string; // First 200 chars of the assistant message
}

const FEEDBACK_REASONS = [
  'Incorrect information',
  'Didn\'t answer my question',
  'Too long or complex',
  'Off-topic response',
  'Technical error',
  'Other',
];

export function AIFeedback({ sessionId, messagePreview }: AIFeedbackProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<'helpful' | 'not_helpful' | null>(null);
  const [showReasons, setShowReasons] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;
  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-white/30 text-xs">
        <span>Thanks for your feedback</span>
      </div>
    );
  }

  async function submitFeedback(r: 'helpful' | 'not_helpful', reason?: string) {
    if (submitting) return;
    setSubmitting(true);
    try {
      await supabase.from('ai_feedback').insert({
        user_id: user!.id,
        session_id: sessionId,
        rating: r,
        feedback_text: reason || null,
        message_preview: messagePreview?.substring(0, 200) || null,
      });
      setSubmitted(true);
    } catch (err) {
      console.warn('[AIFeedback] Failed to submit:', err);
      setSubmitted(true); // Don't show error to user for feedback
    } finally {
      setSubmitting(false);
    }
  }

  if (rating === 'not_helpful' && showReasons) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-white/50 text-xs">
          <span>What went wrong?</span>
          <button
            onClick={() => { setRating(null); setShowReasons(false); }}
            className="text-white/30 hover:text-white/60"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FEEDBACK_REASONS.map(reason => (
            <button
              key={reason}
              onClick={() => {
                submitFeedback('not_helpful', reason);
              }}
              className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-xs transition-all"
            >
              {reason}
            </button>
          ))}
        </div>
        <button
          onClick={() => submitFeedback('not_helpful')}
          className="text-white/30 text-xs hover:text-white/50 text-left"
        >
          Skip →
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-white/30 text-xs mr-1">Helpful?</span>
      <button
        onClick={() => { setRating('helpful'); submitFeedback('helpful'); }}
        disabled={submitting}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all disabled:opacity-50 ${
          rating === 'helpful'
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'text-white/40 hover:text-green-400 hover:bg-green-500/10'
        }`}
      >
        <ThumbsUp className="w-3 h-3" />
        <span>Yes</span>
      </button>
      <button
        onClick={() => { setRating('not_helpful'); setShowReasons(true); }}
        disabled={submitting}
        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all disabled:opacity-50 ${
          rating === 'not_helpful'
            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
            : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
        }`}
      >
        <ThumbsDown className="w-3 h-3" />
        <span>No</span>
      </button>
    </div>
  );
}
