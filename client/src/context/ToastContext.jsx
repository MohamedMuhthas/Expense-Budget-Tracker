import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Toast from '../components/Toast.jsx';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const showToast = useCallback((message, type = 'success') => {
    window.clearTimeout(timer.current);
    setToast({ message, type, id: Date.now() });
    timer.current = window.setTimeout(() => setToast(null), 3500);
  }, []);
  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
