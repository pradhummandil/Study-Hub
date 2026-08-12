import React, { useState } from 'react';
import { ShieldAlert, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { submitAiResponseReport } from '../../lib/admin/aiQualityApi';

interface ReportAnswerModalProps {
  isOpen: boolean;
  onClose: () => void;
  messageId: string;
  promptText?: string;
  responseText?: string;
  userId?: string;
}

export const ReportAnswerModal: React.FC<ReportAnswerModalProps> = ({
  isOpen,
  onClose,
  messageId,
  promptText,
  responseText,
  userId = 'anon_user',
}) => {
  const [reason, setReason] = useState<'Incorrect' | 'Not relevant' | 'Missing source' | 'Confusing' | 'Unsafe'>('Incorrect');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await submitAiResponseReport(userId, messageId, reason, details, promptText, responseText);
    setLoading(false);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#062B3D] border border-cyan-500/30 p-6 text-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Report AI Response</h3>
            <p className="text-xs text-slate-400">Help maintain Study Hub trust & academic quality</p>
          </div>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h4 className="font-semibold text-emerald-300">Report Submitted</h4>
            <p className="text-xs text-slate-300">
              Thank you! Our AI Quality team will review this response against official sources.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Reason for Reporting
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full rounded-xl bg-slate-900/80 border border-cyan-500/30 px-3 py-2 text-sm text-white focus:outline-none focus:border-[#5CE1E6]"
              >
                <option value="Incorrect">Incorrect answer or formula</option>
                <option value="Missing source">Missing verified source / citation</option>
                <option value="Not relevant">Not relevant to exam topic</option>
                <option value="Confusing">Confusing explanation</option>
                <option value="Unsafe">Unsafe or inappropriate output</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Explain why this response was incorrect or missing source..."
                rows={3}
                className="w-full rounded-xl bg-slate-900/80 border border-cyan-500/30 p-3 text-xs text-white focus:outline-none focus:border-[#5CE1E6] placeholder-slate-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 flex items-start gap-2 text-[11px] text-slate-400">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Reports enter human admin review to refine prompts and grounded resource indices.</span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-slate-950 hover:brightness-110 transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
