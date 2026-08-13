// src/components/modals/ModalShell.tsx
import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  titleId?: string;
  descriptionId?: string;
  children: React.ReactNode;
  maxWidthClassName?: string;
  className?: string;
  showCloseButton?: boolean;
  closeTooltip?: string;
}

export const ModalShell: React.FC<ModalShellProps> = ({
  isOpen,
  onClose,
  titleId = 'modal-title',
  descriptionId = 'modal-description',
  children,
  maxWidthClassName = 'max-w-3xl',
  className = '',
  showCloseButton = true,
  closeTooltip = 'Close',
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  // Prevent background body scroll without layout shift
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isOpen]);

  // Keyboard Escape listener & Focus Trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // Tab trap
      if (e.key === 'Tab' && cardRef.current) {
        const focusables = cardRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;

        const firstElement = focusables[0];
        const lastElement = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          aria-modal="true"
          role="dialog"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto select-none"
        >
          {/* Backdrop with translucent navy & radial blue glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#031926]/75 backdrop-blur-[16px]"
            style={{
              background:
                'radial-gradient(circle at 50% 40%, rgba(40, 123, 255, 0.16), transparent 55%), rgba(3, 25, 38, 0.76)',
            }}
          />

          {/* Elevated Glass Modal Card Container */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative w-full ${maxWidthClassName} rounded-[28px] overflow-hidden shadow-[0_30px_100px_rgba(6,43,61,0.35)] border border-[#287BFF]/20 bg-gradient-to-br from-white/98 to-[#F4F9FF]/95 dark:from-slate-900/98 dark:to-slate-950/95 dark:border-slate-800 text-slate-900 dark:text-slate-100 z-10 ${className}`}
          >
            {/* Ambient Cyan / Electric Blue Subtle Radial Glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-blue-600/15 blur-3xl pointer-events-none" />

            {/* Top Close Button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                title={closeTooltip}
                aria-label={closeTooltip}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-9 h-9 rounded-full bg-slate-900/5 dark:bg-white/10 hover:bg-[#287BFF]/15 text-slate-600 dark:text-slate-300 hover:text-[#287BFF] transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#287BFF]/40"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const ModalHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-6 sm:p-8 pb-3 ${className}`}>{children}</div>;

export const ModalBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-6 sm:p-8 py-2 ${className}`}>{children}</div>;

export const ModalFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => <div className={`p-6 sm:p-8 pt-4 border-t border-slate-200/60 dark:border-slate-800 ${className}`}>{children}</div>;
