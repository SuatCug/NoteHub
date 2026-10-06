import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ChatSheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

// Mesajlaşma ekranlarındaki pencereler: telefonda alttan açılan sayfa, büyük ekranda ortada pencere.
export default function ChatSheet({ title, onClose, children }: ChatSheetProps) {
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKey);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center sm:p-4" role="presentation">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="sheet-up relative flex h-[85dvh] sm:h-auto sm:max-h-[min(600px,85vh)] w-full sm:max-w-md flex-col rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl pb-safe"
      >
        <div className="sm:hidden mx-auto mt-2.5 h-1 w-10 rounded-full bg-gray-300" aria-hidden="true" />
        <header className="flex items-center justify-between px-5 pt-3 pb-2 sm:pt-4">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </header>
        {children}
      </div>
    </div>,
    document.body
  );
}
