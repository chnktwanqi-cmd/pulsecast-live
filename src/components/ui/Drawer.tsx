import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <button className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm" aria-label="Close panel" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/70 bg-white/85 p-6 shadow-glass backdrop-blur-xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
