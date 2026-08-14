import React, { useEffect, useState } from 'react';
import { LottiePlayer } from './motion/LottiePlayer';
import { LOTTIE_ASSET_REGISTRY } from '../../config/lottie-assets';

interface FullPageLoaderProps {
  label?: string;
  timeoutMs?: number;
  onTimeout?: () => void;
}

export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  label = 'Preparing your study space...',
  timeoutMs = 4500,
  onTimeout,
}) => {
  const [hasTimedOut, setHasTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHasTimedOut(true);
      onTimeout?.();
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [timeoutMs, onTimeout]);

  if (hasTimedOut) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-6 text-center space-y-3">
        <p className="text-xs font-semibold text-terracotta">This request is taking longer than usual.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-scholar text-paper text-xs font-bold shadow-card hover:bg-forest transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center min-h-[50vh] p-6 space-y-4 text-center"
    >
      <div className="w-20 h-20 flex items-center justify-center">
        {LOTTIE_ASSET_REGISTRY.startup_loader?.localPath ? (
          <LottiePlayer
            src={LOTTIE_ASSET_REGISTRY.startup_loader.localPath}
            className="w-full h-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full border-2 border-[#2D5A3F] border-t-transparent animate-spin" />
        )}
      </div>
      <p className="text-xs font-semibold text-muted tracking-wide">{label}</p>
    </div>
  );
};
