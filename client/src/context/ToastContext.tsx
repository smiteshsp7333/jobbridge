import React, { createContext, useContext, useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const remove = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  const ICON: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '!',
    info: 'i',
  };

  const COLORS: Record<ToastType, string> = {
    success: 'border-[#c5f135]/40 bg-[#c5f135]/10 text-[#c5f135]',
    error: 'border-red-500/40 bg-red-500/10 text-red-400',
    warning: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400',
    info: 'border-blue-500/40 bg-blue-500/10 text-blue-400',
  };

  const ICON_COLORS: Record<ToastType, string> = {
    success: 'bg-[#c5f135] text-[#0f0f0f]',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-[#0f0f0f]',
    info: 'bg-blue-500 text-white',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none" style={{ minWidth: 320, maxWidth: 400 }}>
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl ${COLORS[toast.type]}`}
            style={{
              animation: 'slideInRight 0.3s cubic-bezier(0.16,1,0.3,1)',
              background: 'rgba(17,17,17,0.92)',
            }}
          >
            <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-black mt-0.5 ${ICON_COLORS[toast.type]}`}>
              {ICON[toast.type]}
            </span>
            <p className="text-sm text-white leading-relaxed flex-1">{toast.message}</p>
            <button
              onClick={() => remove(toast.id)}
              className="text-[#505050] hover:text-white transition-colors flex-shrink-0 text-lg leading-none mt-0.5"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px) scale(0.95); }
          to   { opacity: 1; transform: translateX(0)    scale(1);    }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
