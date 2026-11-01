import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm backdrop-blur-md transition-all transform animate-in slide-in-from-top-3 ${
              isSuccess
                ? 'bg-emerald-900/90 text-white border-emerald-700/50 shadow-emerald-900/20'
                : isError
                ? 'bg-rose-900/90 text-white border-rose-700/50 shadow-rose-900/20'
                : 'bg-slate-900/90 text-white border-slate-700/50 shadow-slate-900/20'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
              {!isSuccess && !isError && <Info className="w-5 h-5 text-teal-400 flex-shrink-0" />}
              <span className="font-medium text-slate-100">{toast.message}</span>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
