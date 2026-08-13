import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

// Standalone function pattern (requires a registered listener)
let standaloneToastListeners: ((toast: ToastItem) => void)[] = [];

export const toast = {
  success: (msg: string) => dispatchStandalone('success', msg),
  error: (msg: string) => dispatchStandalone('error', msg),
  info: (msg: string) => dispatchStandalone('info', msg),
  warning: (msg: string) => dispatchStandalone('warning', msg),
};

const dispatchStandalone = (type: ToastType, message: string) => {
  const item = { id: Math.random().toString(36).substr(2, 9), type, message };
  standaloneToastListeners.forEach(l => l(item));
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    setToasts(prev => {
      const newToasts = [...prev, { id: Math.random().toString(36).substr(2, 9), type, message }];
      return newToasts.slice(-3); // Keep only max 3
    });
  }, []);

  useEffect(() => {
    const listener = (item: ToastItem) => {
      setToasts(prev => {
        const newToasts = [...prev, item];
        return newToasts.slice(-3);
      });
    };
    standaloneToastListeners.push(listener);
    return () => {
      standaloneToastListeners = standaloneToastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const contextValue = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg),
    warning: (msg: string) => addToast('warning', msg),
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <ToastItemComponent key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItemComponent = ({ toast, onDismiss }: { toast: ToastItem, onDismiss: () => void }) => {
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsShowing(true));
    const timer = setTimeout(() => {
      setIsShowing(false);
      setTimeout(onDismiss, 300); // Wait for exit animation
    }, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: 'bg-[#FCFBF8] border-[#2E8B72]/30 text-[#2E8B72] shadow-[0_14px_40px_rgba(16,35,63,0.12)]',
    error: 'bg-[#FCFBF8] border-[#C95C5C]/30 text-[#C95C5C] shadow-[0_14px_40px_rgba(16,35,63,0.12)]',
    info: 'bg-[#FCFBF8] border-[#1F5F8B]/30 text-[#1F5F8B] shadow-[0_14px_40px_rgba(16,35,63,0.12)]',
    warning: 'bg-[#FCFBF8] border-[#D99A3D]/30 text-[#D99A3D] shadow-[0_14px_40px_rgba(16,35,63,0.12)]'
  };

  const icons = {
    success: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    error: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
    info: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>,
    warning: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
  };

  return (
    <div 
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        isShowing ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${colors[toast.type]}`}
    >
      {icons[toast.type]}
      <span className="text-[#172033] text-sm font-medium pr-4">{toast.message}</span>
      <button 
        onClick={() => { setIsShowing(false); setTimeout(onDismiss, 300); }}
        className="ml-auto text-[#627083] hover:text-[#172033] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
  );
};

