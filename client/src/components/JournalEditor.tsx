/**
 * Journal Editor — Centered writing canvas with TipTap rich text editor
 * Full toolbar: font, size, bold, italic, underline, strikethrough, color,
 * highlight, headings, alignment, lists, blockquote, code, undo/redo
 * Auto-save with 3s debounce
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Trash2, Flame, Save, Clock, Check } from 'lucide-react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { FontFamily } from '@tiptap/extension-font-family';
import { Highlight } from '@tiptap/extension-highlight';
import { Typography } from '@tiptap/extension-typography';
import EditorToolbar from './EditorToolbar';
import { journalApi } from '@/lib/api';
import { MOOD_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';
import type { JournalEntry } from '@/pages/Dashboard';

interface JournalEditorProps {
  entry: JournalEntry | null;
  pendingMood: string | null;
  onSave: (entry: JournalEntry) => void;
  onDelete: (id: number) => void;
  onBack: () => void;
  onToggleAi: () => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function JournalEditor({ entry, pendingMood, onSave, onDelete, onBack, onToggleAi }: JournalEditorProps) {
  const [title, setTitle] = useState(entry?.title || '');
  const [mood, setMood] = useState(entry?.mood || pendingMood || '');
  const [burnMode, setBurnMode] = useState(entry?.burn_mode || false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [entryId, setEntryId] = useState<number | null>(entry?.id || null);
  const [wordCount, setWordCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChangesRef = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Begin writing...',
        emptyEditorClass: 'is-editor-empty',
      }),
      TextStyle,
      Color,
      FontFamily.configure({ types: ['textStyle'] }),
      Highlight.configure({ multicolor: true }),
      Typography,
      FontSize,
    ],
    content: entry?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[60vh] font-serif',
        style: 'color: var(--foreground); line-height: 1.85; font-size: 18px;',
      },
    },
    onUpdate: ({ editor: ed }) => {
      hasChangesRef.current = true;
      setSaveStatus('idle');
      // Update word count
      const text = ed.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
    },
  });

  // Focus editor on mount for new entries
  useEffect(() => {
    if (!entry && editor) {
      setTimeout(() => editor.commands.focus(), 300);
    }
  }, [entry, editor]);

  // Auto-save logic
  const performSave = useCallback(async () => {
    if (!editor) return;
    const content = editor.getHTML();
    const plainText = editor.getText();
    if (!content.trim() && !title.trim()) return;

    setSaveStatus('saving');
    try {
      if (entryId) {
        const res = await journalApi.updateEntry(entryId, {
          title: title || 'Untitled',
          content,
          mood: mood || undefined,
        });
        if (res.success) {
          onSave(res.entry);
          setSaveStatus('saved');
          hasChangesRef.current = false;
        } else {
          setSaveStatus('error');
        }
      } else {
        const res = await journalApi.createEntry({
          title: title || 'Untitled',
          content,
          mood: mood || undefined,
          burn_mode: burnMode,
          input_method: 'text',
        });
        if (res.success) {
          setEntryId(res.entry.id);
          onSave(res.entry);
          setSaveStatus('saved');
          hasChangesRef.current = false;
        } else {
          setSaveStatus('error');
          toast.error(res.error?.message || 'Failed to save');
        }
      }
    } catch {
      setSaveStatus('error');
    }
  }, [title, mood, burnMode, entryId, onSave, editor]);

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        hasChangesRef.current = true;
        performSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [performSave]);

  // Debounced auto-save (3 seconds after last change)
  useEffect(() => {
    if (!hasChangesRef.current) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      performSave();
    }, 3000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, wordCount, performSave]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    hasChangesRef.current = true;
    setSaveStatus('idle');
  };

  const handleManualSave = () => {
    hasChangesRef.current = true;
    performSave();
  };

  const handleDelete = async () => {
    if (!entryId) { onBack(); return; }
    try {
      const res = await journalApi.deleteEntry(entryId);
      if (res.success) {
        toast.success('Entry deleted');
        onDelete(entryId);
      } else {
        toast.error('Failed to delete entry');
      }
    } catch {
      toast.error('Failed to delete entry');
    }
  };

  const saveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving': return <Clock size={14} className="animate-pulse" />;
      case 'saved': return <Check size={14} />;
      case 'error': return <span className="text-destructive text-xs">Error</span>;
      default: return null;
    }
  };

  const saveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved';
      case 'error': return 'Save failed';
      default: return '';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top bar with back, mood, save status, and actions */}
      <header className="flex items-center justify-between px-4 lg:px-6 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-accent transition-colors" style={{ color: 'var(--muted-foreground)' }}>
            <ArrowLeft size={18} />
          </button>

          {mood && MOOD_CONFIG[mood] && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'var(--muted)' }}>
              <img src={MOOD_CONFIG[mood].icon} alt={mood} className="w-5 h-5" />
              <span className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>{mood}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs" style={{ color: saveStatus === 'saved' ? '#C9A84C' : 'var(--muted-foreground)' }}>
            {saveStatusIcon()}
            <span>{saveStatusText()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
            {wordCount} words
          </span>

          {!entryId && (
            <button
              onClick={() => setBurnMode(!burnMode)}
              className="p-2 rounded-lg transition-colors"
              style={{ color: burnMode ? '#E85D4A' : 'var(--muted-foreground)', backgroundColor: burnMode ? 'rgba(232,93,74,0.1)' : 'transparent' }}
              title="Burn Mode — auto-delete after 24h"
            >
              <Flame size={16} />
            </button>
          )}

          <button onClick={handleManualSave} className="p-2 rounded-lg hover:bg-accent transition-colors" style={{ color: 'var(--muted-foreground)' }} title="Save now (Ctrl+S)">
            <Save size={16} />
          </button>

          <button onClick={onToggleAi} className="p-2 rounded-lg hover:bg-accent transition-colors" style={{ color: '#C9A84C' }} title="AI Companion">
            <Bot size={16} />
          </button>

          {entryId && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              title="Delete entry"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Rich Text Toolbar */}
      <EditorToolbar editor={editor} />

      {/* Writing Canvas */}
      <div className="flex-1 overflow-y-auto diary-scrollbar">
        <motion.div
          className="max-w-2xl mx-auto px-6 lg:px-12 py-8 lg:py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Title your entry..."
            className="w-full font-serif text-2xl lg:text-3xl font-light bg-transparent border-none outline-none placeholder:opacity-30 mb-4"
            style={{ color: 'var(--foreground)' }}
          />

          {/* Date */}
          <p className="text-xs tracking-wider uppercase mb-6" style={{ color: 'var(--muted-foreground)' }}>
            {entry ? new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* TipTap Editor */}
          <EditorContent editor={editor} />
        </motion.div>
      </div>

      {/* Burn mode indicator */}
      {burnMode && (
        <div className="px-4 py-2 text-center text-xs flex items-center justify-center gap-2" style={{ background: 'rgba(232,93,74,0.08)', color: '#E85D4A' }}>
          <Flame size={12} /> Burn Mode — This entry will auto-delete after 24 hours
        </div>
      )}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
          <motion.div
            className="bg-card rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="font-serif text-lg mb-2" style={{ color: 'var(--foreground)' }}>Delete this entry?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-lg border text-sm" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                Cancel
              </button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground">
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
