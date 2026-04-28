/**
 * Journal Editor — Premium branded writing canvas with TipTap rich text editor
 * Consistent Cormorant Garamond typography, gold accents
 * Full toolbar, auto-save with 3s debounce, Ctrl+S manual save
 * FIXES: Ensure performSave triggers on all change types, validates content properly
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bot, Trash2, Flame, Save, Clock, Check, FileDown, Crown } from 'lucide-react';
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
import BurnSwitch from './BurnSwitch';
import BurnTimePicker from './BurnTimePicker';
import BurnCountdown from './BurnCountdown';
import { journalApi, exportApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import PaywallModal from './PaywallModal';
import { MOOD_CONFIG } from '@/lib/constants';
import { toast } from 'sonner';
import type { JournalEntry } from '@/pages/Dashboard';

const FONT = "'Cormorant Garamond', Georgia, serif";

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
  const { isElite } = useAuth();
  const [showExportPaywall, setShowExportPaywall] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [title, setTitle] = useState(entry?.title || '');
  const [mood, setMood] = useState(entry?.mood || pendingMood || '');
  const [burnMode, setBurnMode] = useState(entry?.burn_mode || false);
  // Burn time — JS Date in local time. Rehydrated from entry.burn_date (ISO UTC
  // string from backend) when editing an existing entry. Mirrors Flutter's
  // `_burnEndTime` pattern in text_journal_screen.dart.
  const [burnDate, setBurnDate] = useState<Date | null>(
    entry?.burn_date ? new Date(entry.burn_date) : null,
  );
  const [showBurnPicker, setShowBurnPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [entryId, setEntryId] = useState<number | null>(entry?.id || null);
  const [wordCount, setWordCount] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasChangesRef = useRef(false);
  const editorContentRef = useRef('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Begin writing your thoughts...',
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
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[60vh]',
        style: `color: var(--foreground); line-height: 1.85; font-size: 18px; font-family: ${FONT};`,
      },
    },
    onUpdate: ({ editor: ed }) => {
      hasChangesRef.current = true;
      setSaveStatus('idle');
      const text = ed.getText();
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      setWordCount(words);
      editorContentRef.current = ed.getHTML();
    },
  });

  useEffect(() => {
    if (!entry && editor) {
      setTimeout(() => editor.commands.focus(), 300);
    }
  }, [entry, editor]);

  const performSave = useCallback(async () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    const finalContent = content || editorContentRef.current;
    
    // Validation: require either title or content
    const textContent = editor.getText().trim();
    if (!textContent && !title.trim()) {
      setSaveStatus('idle');
      return;
    }

    // Burn validation (Flutter parity): if burn mode is on, a time is required.
    // See text_journal_screen.dart line ~248: blocks save when burnMode && burnEndTime == null.
    if (burnMode && !burnDate) {
      setSaveStatus('idle');
      toast.error('Set a burn time before saving, or turn off Burn Mode.');
      setShowBurnPicker(true);
      return;
    }

    setSaveStatus('saving');
    try {
      if (entryId) {
        // Update existing entry — backend accepts burn_mode + end_time on PUT
        const res = await journalApi.updateEntry(entryId, {
          title: title || 'Untitled',
          content: finalContent,
          mood: mood || undefined,
          burn_mode: burnMode,
          // Send ISO UTC. Pass null when burn is off so any prior burn_date
          // gets cleared server-side.
          end_time: burnMode && burnDate ? burnDate.toISOString() : null,
        });
        if (res.success) {
          onSave(res.entry);
          setSaveStatus('saved');
          hasChangesRef.current = false;
          // Auto-hide "saved" message after 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('error');
          toast.error(res.error?.message || 'Failed to update entry');
        }
      } else {
        // Create new entry
        const res = await journalApi.createEntry({
          title: title || 'Untitled',
          content: finalContent,
          mood: mood || undefined,
          burn_mode: burnMode,
          end_time: burnMode && burnDate ? burnDate.toISOString() : undefined,
          input_method: 'text',
        });
        if (res.success) {
          setEntryId(res.entry.id);
          onSave(res.entry);
          setSaveStatus('saved');
          hasChangesRef.current = false;
          // Auto-hide "saved" message after 2 seconds
          setTimeout(() => setSaveStatus('idle'), 2000);
        } else {
          setSaveStatus('error');
          toast.error(res.error?.message || 'Failed to create entry');
        }
      }
    } catch (err) {
      setSaveStatus('error');
      toast.error('An error occurred while saving');
    }
  }, [title, mood, burnMode, burnDate, entryId, onSave, editor]);

  // Ctrl+S save
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

  // Auto-save debounced
  useEffect(() => {
    if (!hasChangesRef.current) return;
    
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    
    autoSaveTimerRef.current = setTimeout(() => {
      if (hasChangesRef.current) {
        performSave();
      }
    }, 3000);
    
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [title, wordCount, mood, burnMode, burnDate, performSave]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    hasChangesRef.current = true;
    setSaveStatus('idle');
  };

  const handleManualSave = () => {
    hasChangesRef.current = true;
    performSave();
  };

  /**
   * Fired when the BurnSwitch pill is toggled.
   * Enabling: open the time picker so the user must explicitly choose a time
   *           (Flutter parity — burn without a time is invalid).
   * Disabling: clear any previously-selected time so the next enable starts clean.
   */
  const handleBurnToggle = (next: boolean) => {
    if (next) {
      setBurnMode(true);
      setShowBurnPicker(true);
      hasChangesRef.current = true;
      setSaveStatus('idle');
    } else {
      setBurnMode(false);
      setBurnDate(null);
      hasChangesRef.current = true;
      setSaveStatus('idle');
    }
  };

  /** Fired when the user confirms a date/time in BurnTimePicker. */
  const handleBurnTimeConfirm = (date: Date) => {
    setBurnDate(date);
    setShowBurnPicker(false);
    hasChangesRef.current = true;
    setSaveStatus('idle');
  };

  /** Fired when the user cancels BurnTimePicker. If burn was just turned ON
   *  but no date had been set previously, treat cancel as turning burn back OFF. */
  const handleBurnPickerCancel = () => {
    setShowBurnPicker(false);
    if (burnMode && !burnDate) {
      setBurnMode(false);
    }
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
      case 'error': return <span className="text-destructive text-xs" style={{ fontFamily: FONT }}>Error</span>;
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
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-4 lg:px-6 py-2.5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ArrowLeft size={18} />
          </button>

          {mood && MOOD_CONFIG[mood] && (
            <div
              className="flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'var(--muted)', fontFamily: FONT }}
            >
              <img src={MOOD_CONFIG[mood].icon} alt={mood} className="w-5 h-5" />
              <span className="text-xs font-semibold capitalize tracking-wide" style={{ color: 'var(--muted-foreground)' }}>
                {mood}
              </span>
            </div>
          )}

          <div
            className="flex items-center gap-1.5 text-xs tracking-wide"
            style={{
              color: saveStatus === 'saved' ? '#C9A84C' : 'var(--muted-foreground)',
              fontFamily: FONT,
              fontWeight: 600,
            }}
          >
            {saveStatusIcon()}
            <span>{saveStatusText()}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span
            className="text-xs tabular-nums px-2"
            style={{ color: 'var(--muted-foreground)', fontFamily: FONT, fontWeight: 600, letterSpacing: '0.05em' }}
          >
            {wordCount} words
          </span>

          {/* Burn Mode pill — visible on both new and existing entries.
              Tapping ON opens BurnTimePicker for time selection. */}
          <BurnSwitch
            value={burnMode}
            onChange={handleBurnToggle}
            disabled={saveStatus === 'saving'}
            id="burn-switch"
          />

          <button
            onClick={handleManualSave}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
            title="Save now (Ctrl+S)"
          >
            <Save size={16} />
          </button>

          {/* Export button — paywalled for free users */}
          {entryId && (
            <button
              onClick={async () => {
                if (!isElite) {
                  setShowExportPaywall(true);
                  return;
                }
                setIsExporting(true);
                try {
                  const res = await exportApi.exportPdf();
                  if (res.success) {
                    toast.success('PDF exported successfully');
                  } else {
                    toast.error('Failed to export PDF');
                  }
                } catch {
                  toast.error('Export failed');
                }
                setIsExporting(false);
              }}
              disabled={isExporting}
              className="p-2 rounded-lg transition-colors relative"
              style={{ color: 'var(--muted-foreground)' }}
              title={isElite ? 'Export as PDF' : 'Export (Elite)'}
            >
              <FileDown size={16} />
              {!isElite && (
                <Crown size={8} className="absolute -top-0.5 -right-0.5" style={{ color: '#C9A84C' }} />
              )}
            </button>
          )}

          <button
            onClick={onToggleAi}
            className="p-2 rounded-lg transition-colors"
            style={{ color: '#C9A84C', backgroundColor: 'rgba(201,168,76,0.06)' }}
            title="AI Companion"
          >
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
            className="w-full text-2xl lg:text-3xl font-light bg-transparent border-none outline-none placeholder:opacity-30 mb-4"
            style={{ color: 'var(--foreground)', fontFamily: FONT }}
          />

          {/* Date */}
          <p
            className="text-xs tracking-widest uppercase mb-8"
            style={{ color: 'var(--muted-foreground)', fontFamily: FONT, fontWeight: 600, letterSpacing: '0.18em' }}
          >
            {entry
              ? new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              : new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* TipTap Editor */}
          <EditorContent editor={editor} />
        </motion.div>
      </div>

      {/* Burn mode indicator — shows the actual scheduled burn time + a live
          countdown. Tapping the time opens BurnTimePicker to edit. */}
      {burnMode && (
        <div
          className="px-4 py-2 text-center text-xs flex items-center justify-center gap-3 tracking-wider uppercase"
          style={{
            background: 'rgba(232,93,74,0.06)',
            color: '#E85D4A',
            fontFamily: FONT,
            fontWeight: 600,
            letterSpacing: '0.1em',
          }}
        >
          <Flame size={12} />
          <span>Burn Mode</span>
          {burnDate ? (
            <>
              <span style={{ opacity: 0.55 }}>·</span>
              <BurnCountdown target={burnDate} />
              <button
                type="button"
                onClick={() => setShowBurnPicker(true)}
                className="underline-offset-2 hover:underline"
                style={{
                  color: '#E85D4A',
                  fontFamily: FONT,
                  letterSpacing: '0.1em',
                }}
                title="Change burn time"
              >
                Edit
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setShowBurnPicker(true)}
              className="underline-offset-2 hover:underline"
              style={{
                color: '#E85D4A',
                fontFamily: FONT,
                letterSpacing: '0.1em',
              }}
            >
              Set burn time
            </button>
          )}
        </div>
      )}

      {/* Burn time picker dialog */}
      <BurnTimePicker
        open={showBurnPicker}
        initialValue={burnDate ?? undefined}
        onConfirm={handleBurnTimeConfirm}
        onCancel={handleBurnPickerCancel}
      />

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <motion.div
            className="rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl"
            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3
              className="text-lg mb-2 font-medium"
              style={{ fontFamily: FONT, color: 'var(--foreground)' }}
            >
              Delete this entry?
            </h3>
            <p
              className="text-sm mb-6"
              style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
            >
              This action cannot be undone. Your words will be lost forever.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border text-sm font-semibold tracking-wide"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)', fontFamily: FONT }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold tracking-wide bg-destructive text-destructive-foreground"
                style={{ fontFamily: FONT }}
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* PaywallModal for Export */}
      <PaywallModal
        isOpen={showExportPaywall}
        onClose={() => setShowExportPaywall(false)}
        feature="export"
      />
    </div>
  );
}
