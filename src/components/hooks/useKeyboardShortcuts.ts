import { useEffect } from 'react';

interface ShortcutHandlers {
  onSave?: (e: KeyboardEvent) => void;
  onCancel?: (e: KeyboardEvent) => void;
  onNext?: (e: KeyboardEvent) => void;
}

export function useKeyboardShortcuts({ onSave, onCancel, onNext }: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Save: Cmd/Ctrl + S
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        onSave?.(e);
      }
      // Cancel: Escape
      else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel?.(e);
      }
      // Next field: Cmd/Ctrl + Enter
      else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        onNext?.(e);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave, onCancel, onNext]);
} 