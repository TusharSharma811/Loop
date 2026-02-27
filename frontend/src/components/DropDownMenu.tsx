import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';

const DropdownMenu = ({ onDelete }: { onDelete: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-text-muted hover:text-text hover:bg-surface-hover rounded-lg transition-colors"
        title="More options"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-44 glass-strong rounded-xl shadow-[var(--shadow-elevated)] z-10 overflow-hidden">
          <button
            onClick={() => { onDelete(); setIsOpen(false); }}
            className="flex items-center w-full text-left px-4 py-2.5 text-sm text-danger hover:bg-surface-hover transition-colors"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Chat
          </button>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;