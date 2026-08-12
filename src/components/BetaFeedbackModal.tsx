import React, { useState } from 'react';
import { MessageSquare, X, CheckCircle, Send } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const BetaFeedbackModal: React.FC<BetaFeedbackModalProps> = ({
  isOpen,
  onClose,
  userId = 'anon_user',
}) => {
  const [type, setType] = useState<'Feature Request' | 'Bug Report' | 'AI Feedback' | 'Content Report' | 'General'>('General');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await supabase.from('community_posts').insert({
        author_id: userId === 'anon_user' ? '00000000-0000-0000-0000-000000000000' : userId,
        author_name: 'Beta Student Feedback',
        author_avatar: '',
        title: `[${type}] Feedback Submission`,
        content: message,
        category: 'general',
        tags: ['beta', type.toLowerCase().replace(' ', '_')],
      });
    } catch (err) {
      console.warn('Feedback submit fallback:', err);
    }

    setLoading(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#062B3D] border border-cyan-500/30 p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/20 text-[#5CE1E6] border border-cyan-500/30">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Study Hub Beta Feedback</h3>
            <p className="text-xs text-slate-400">Direct channel to product & AI engineering team</p>
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h4 className="font-semibold text-emerald-300">Feedback Recorded!</h4>
            <p className="text-xs text-slate-300">
              Thank you for shaping the next generation of Study Hub intelligent learning.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900/80 border border-cyan-500/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5CE1E6]"
              >
                <option value="General">General Feedback</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Bug Report">Bug Report</option>
                <option value="AI Feedback">StudyMate AI Feedback</option>
                <option value="Content Report">Official Content Report</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Feedback</label>
              <textarea
                value={message}
                required
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts, missing features, or issue details..."
                rows={4}
                className="w-full rounded-xl bg-slate-900/80 border border-cyan-500/30 p-3 text-xs text-white focus:outline-none focus:border-[#5CE1E6] placeholder-slate-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-slate-950 flex items-center gap-1.5 hover:brightness-110 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" /> {loading ? 'Sending...' : 'Send Feedback'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
