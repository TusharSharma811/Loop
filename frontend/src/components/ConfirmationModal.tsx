import { useEffect } from 'react';
import { TriangleAlert } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md glass-strong rounded-2xl p-6 shadow-[var(--shadow-elevated)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:flex sm:items-start">
          <div className="mx-auto flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-danger/15 sm:mx-0">
            <TriangleAlert className="h-5 w-5 text-danger" />
          </div>
          <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
            <h3 className="text-base font-semibold text-text">{title}</h3>
            <p className="mt-2 text-sm text-text-secondary">{message}</p>
          </div>
        </div>

        <div className="mt-5 sm:flex sm:flex-row-reverse sm:gap-3">
          <button
            type="button"
            className="w-full sm:w-auto px-4 py-2 bg-danger text-white text-sm font-medium rounded-lg hover:bg-danger/80 transition-colors"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            type="button"
            className="mt-3 sm:mt-0 w-full sm:w-auto px-4 py-2 glass text-text text-sm font-medium rounded-lg hover:bg-surface-hover transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;