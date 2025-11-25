import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onCopy?: () => void;
  onCut?: () => void;
  onPaste?: () => void;
  onDelete?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onSelectAll?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const isCtrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      // Copy: Ctrl+C / Cmd+C
      if (isCtrlOrCmd && event.key === 'c' && config.onCopy) {
        event.preventDefault();
        config.onCopy();
      }

      // Cut: Ctrl+X / Cmd+X
      if (isCtrlOrCmd && event.key === 'x' && config.onCut) {
        event.preventDefault();
        config.onCut();
      }

      // Paste: Ctrl+V / Cmd+V
      if (isCtrlOrCmd && event.key === 'v' && config.onPaste) {
        event.preventDefault();
        config.onPaste();
      }

      // Delete: Delete key
      if (event.key === 'Delete' && config.onDelete) {
        event.preventDefault();
        config.onDelete();
      }

      // Undo: Ctrl+Z / Cmd+Z
      if (isCtrlOrCmd && event.key === 'z' && !event.shiftKey && config.onUndo) {
        event.preventDefault();
        config.onUndo();
      }

      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z or Ctrl+Y / Cmd+Y
      if (
        ((isCtrlOrCmd && event.shiftKey && event.key === 'z') ||
          (isCtrlOrCmd && event.key === 'y')) &&
        config.onRedo
      ) {
        event.preventDefault();
        config.onRedo();
      }

      // Select All: Ctrl+A / Cmd+A
      if (isCtrlOrCmd && event.key === 'a' && config.onSelectAll) {
        event.preventDefault();
        config.onSelectAll();
      }

      // Escape
      if (event.key === 'Escape' && config.onEscape) {
        event.preventDefault();
        config.onEscape();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [config]);
}

