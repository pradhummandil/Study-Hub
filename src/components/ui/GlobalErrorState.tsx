import React from 'react';
import { AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GlobalErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const GlobalErrorState: React.FC<GlobalErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not complete your request. Please try again or go back.',
  onRetry,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center bg-paper rounded-3xl border border-forest/10 space-y-4 shadow-card max-w-lg mx-auto my-8">
      <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center">
        <AlertCircle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-serif font-bold text-ink">{title}</h3>
        <p className="text-xs text-muted leading-relaxed">{message}</p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl bg-scholar hover:bg-forest text-paper text-xs font-bold shadow-card transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        )}
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl bg-parchment hover:bg-parchment/80 border border-forest/10 text-ink text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Go Back
        </button>
      </div>
    </div>
  );
};
