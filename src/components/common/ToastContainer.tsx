import React from 'react';
import { CheckCircle2, Info, X, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)]"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.variant === 'success'
            ? CheckCircle2
            : toast.variant === 'error'
            ? AlertCircle
            : Info;
        const iconColor =
          toast.variant === 'success'
            ? 'text-emerald-600'
            : toast.variant === 'error'
            ? 'text-rose-600'
            : 'text-blue-700';

        return (
          <div
            key={toast.id}
            role="status"
            className="bg-white border border-slate-200 rounded-xl shadow-md p-3.5 flex items-start gap-3"
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-slate-600 mt-0.5 truncate">{toast.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="p-1 rounded text-slate-400 hover:text-slate-700 transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
