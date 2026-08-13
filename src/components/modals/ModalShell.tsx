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
          {/* Backdrop with translucent navy & subtle blue glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#10233F]/75 backdrop-blur-[16px]"
            style={{
              background:
                'radial-gradient(circle at 50% 40%, rgba(31, 95, 139, 0.16), transparent 55%), rgba(16, 35, 63, 0.76)',
            }}
          />

          {/* Elevated Glass Modal Card Container */}
          <motion.div
            ref={cardRef}
            initial={{ opacity: 0, scale: 0.95, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className={`relative w-full ${maxWidthClassName} rounded-[28px] overflow-hidden shadow-[0_24px_70px_rgba(16,35,63,0.14)] border border-[#1F5F8B]/18 bg-[#FCFBF8] text-[#172033] z-10 ${className}`}
          >
            {/* Ambient Warm Cream / Soft Blue Subtle Glow */}
            <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#F7E7D0]/25 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#4E88B7]/15 blur-3xl pointer-events-none" />

            {/* Top Close Button */}
            {showCloseButton && (
              <button
                onClick={onClose}
                title={closeTooltip}
                aria-label={closeTooltip}
                className="absolute top-4 right-4 sm:top-5 sm:right-5 z-20 w-9 h-9 rounded-full bg-[#10233F]/05 hover:bg-[#1F5F8B]/15 text-[#627083] hover:text-[#1F5F8B] transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#1F5F8B]/40"
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
}) => <div className={`p-6 sm:p-8 pt-4 border-t border-[#10233F]/08 ${className}`}>{children}</div>;

