import React from 'react';
import { LottiePlayer } from './motion/LottiePlayer';
import { LOTTIE_ASSET_REGISTRY } from '../../config/lottie-assets';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GlobalEmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionPath?: string;
  onAction?: () => void;
}

export const GlobalEmptyState: React.FC<GlobalEmptyStateProps> = ({
  title = 'Nothing found yet',
  description = 'There are no items matching your criteria right now.',
  actionText,
  actionPath,
  onAction,
}) => {
  const navigate = useNavigate();

  const handleAction = () => {
    if (onAction) onAction();
    else if (actionPath) navigate(actionPath);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-parchment/40 rounded-3xl border border-forest/10 space-y-4 shadow-card max-w-md mx-auto my-8">
      <div className="w-24 h-24 flex items-center justify-center">
        <LottiePlayer
          src={LOTTIE_ASSET_REGISTRY.empty_search.localPath}
          className="w-full h-full"
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-xl font-serif font-bold text-ink">{title}</h3>
        <p className="text-xs text-muted leading-relaxed">{description}</p>
      </div>

      {(actionText && (actionPath || onAction)) && (
        <button
          onClick={handleAction}
          className="px-6 py-3 rounded-xl bg-scholar text-paper font-bold text-xs shadow-card hover:bg-forest transition-colors flex items-center gap-2"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
