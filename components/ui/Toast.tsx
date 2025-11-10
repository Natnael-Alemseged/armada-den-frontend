'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { setToastCallback, ToastType } from '@/components/Toast';

type ToastTypeUI = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastTypeUI;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastTypeUI) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastTypeUI = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  // Set up the toast callback for the global toastBar function
  useEffect(() => {
    setToastCallback((message: string, type: ToastType) => {
      const typeMap: Record<ToastType, ToastTypeUI> = {
        [ToastType.SUCCESS]: 'success',
        [ToastType.DANGER]: 'error',
        [ToastType.INFO]: 'info',
        [ToastType.WARNING]: 'warning',
      };
      showToast(message, typeMap[type]);
    });
  }, [showToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg shadow-lg min-w-[300px] max-w-md',
              'animate-in slide-in-from-right',
              toast.type === 'success' && 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800',
              toast.type === 'error' && 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800',
              toast.type === 'info' && 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800',
              toast.type === 'warning' && 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
            )}
          >
            {toast.type === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'info' && (
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            )}
            <p
              className={cn(
                'flex-1 text-sm',
                toast.type === 'success' && 'text-green-800 dark:text-green-200',
                toast.type === 'error' && 'text-red-800 dark:text-red-200',
                toast.type === 'info' && 'text-blue-800 dark:text-blue-200',
                toast.type === 'warning' && 'text-yellow-800 dark:text-yellow-200'
              )}
            >
              {toast.message}
            </p>
            <button
              onClick={() => removeToast(toast.id)}
              className={cn(
                'flex-shrink-0',
                toast.type === 'success' && 'text-green-600 dark:text-green-400 hover:text-green-700',
                toast.type === 'error' && 'text-red-600 dark:text-red-400 hover:text-red-700',
                toast.type === 'info' && 'text-blue-600 dark:text-blue-400 hover:text-blue-700',
                toast.type === 'warning' && 'text-yellow-600 dark:text-yellow-400 hover:text-yellow-700'
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}