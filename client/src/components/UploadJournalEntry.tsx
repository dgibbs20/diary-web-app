/**
 * UploadJournalEntry — Web / Desktop File & Scanner Upload
 * Supports: JPG, PNG, WEBP, PDF (text + scanned), TXT, DOCX, DOC
 * ZIP batch import (Elite only)
 * Full action bar: Burn, Export, Delete, AI
 * TipTap rich text editor for transcription (matches JournalEditor)
 */
import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { mediaApi, journalApi, exportApi } from '@/lib/api';
import { toast } from 'sonner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Typography } from '@tiptap/extension-typography';
import EditorToolbar from './EditorToolbar';
import BurnSwitch from './BurnSwitch';
import BurnTimePicker from './BurnTimePicker';
import BurnCountdown from './BurnCountdown';
import ExportDialog from './ExportDialog';
import PaywallModal from './PaywallModal';
import {
  Upload, FileText, X, Loader2, Printer,
  ArrowLeft, Bot, Trash2, FileDown, Crown,
  CheckCircle2, AlertCircle, Plus, FileArchive,
  Check, Clock,
} from 'lucide-react';
import type { JournalEntry } from '@/pages/Dashboard';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';
const GOLD_DARK = '#A8863A';

const ACCEPTED_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'txt', 'docx', 'doc'];
const ACCEPTED_IMAGES = ['jpg', 'jpeg', 'png', 'webp'];
const ACCEPTED_DOCS = ['pdf', 'txt', 'docx', 'doc'];
const MAX_FILES = 20;

interface UploadedFile {
  file: File;
  id: string;
  name: string;
  ext: string;
  preview?: string;
}

interface Props {
  onSave: (entry: JournalEntry) => void;
  onDelete: (id: number) => void;
  onBack: () => void;
  onToggleAi: () => void;
  pendingMood?: string | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function UploadJournalEntry({ onSave, onDelete, onBack, onToggleAi, pendingMood }: Props) {
  const { t } = useTranslation();
  const { isElite, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState({ current: 0, total: 0 });
  const [rejectedFiles, setRejectedFiles] = useState<{ name: string; reason: string }[]>([]);
  const [title, setTitle] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [savedEntryId, setSavedEntryId] = useState<number | null>(null);
  const [isDone, setIsDone] = useState(false);

  // Burn mode
  const [burnMode, setBurnMode] = useState(false);
  const [burnDate, setBurnDate] = useState<Date | null>(null);
  const [showBurnPicker, setShowBurnPicker] = useState(false);

  // Export / delete
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showExportPaywall, setShowExportPaywall] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({
        placeholder: t('upload_transcriptionLabel'),
        emptyEditorClass: 'is-editor-empty',
      }),
      Typography,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[40vh]',
        style: `color: var(--foreground); line-height: 1.85; font-size: 17px; font-family: ${FONT};`,
      },
    },
  });

  const getEditorText = () => editor?.getText() || '';
  const getEditorHTML = () => editor?.getHTML() || '';

  // File helpers
  const getExt = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';
  const isAccepted = (name: string) => ACCEPTED_EXTS.includes(getExt(name));

  const makeUploadedFile = (file: File): UploadedFile => {
    const ext = getExt(file.name);
    const preview = ACCEPTED_IMAGES.includes(ext) ? URL.createObjectURL(file) : undefined;
    return { file, id: `${Date.now()}-${Math.random()}`, name: file.name, ext, preview };
  };

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(f => isAccepted(f.name));
    const invalid = incoming.filter(f => !isAccepted(f.name));
    if (invalid.length) {
      toast.warning(`${invalid.length} unsupported file(s) skipped. Accepted: JPG, PNG, WEBP, PDF, TXT, DOCX`);
    }
    if (mode === 'single') {
      const f = valid[0];
      if (!f) return;
      setFiles([makeUploadedFile(f)]);
      editor?.commands.clearContent();
      setIsDone(false);
      setRejectedFiles([]);
    } else {
      setFiles(prev => {
        const combined = [...prev, ...valid.map(makeUploadedFile)];
        if (combined.length > MAX_FILES) {
          toast.warning(`Maximum ${MAX_FILES} files. Extra files were not added.`);
          return combined.slice(0, MAX_FILES);
        }
        return combined;
      });
      editor?.commands.clearContent();
      setIsDone(false);
      setRejectedFiles([]);
    }
  }, [mode, editor]);

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };
  const handleZipChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    if (getExt(f.name) !== 'zip') { toast.error('Only ZIP files accepted here.'); return; }
    transcribeZip(f);
    e.target.value = '';
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(x => x.id !== id);
    });
    if (files.length <= 1) { editor?.commands.clearContent(); setIsDone(false); }
  };

  const setEditorText = (text: string) => {
    editor?.commands.setContent(`<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`);
  };

  // Transcribe single
  const transcribeSingle = async (uf: UploadedFile) => {
    if (uf.ext === 'txt') {
      const text = await uf.file.text();
      setEditorText(text);
      setIsDone(true);
      return;
    }
    if (ACCEPTED_IMAGES.includes(uf.ext)) {
      const fd = new FormData();
      fd.append('image', uf.file, uf.name);
      const res = await mediaApi.ocrImage(fd);
      if (res.success) {
        setEditorText(res.text || '');
        setIsDone(true);
      } else {
        throw new Error(res.error?.message || 'OCR failed');
      }
      return;
    }
    if (ACCEPTED_DOCS.includes(uf.ext)) {
      const fd = new FormData();
      fd.append('files[]', uf.file, uf.name);
      const res = await mediaApi.batchImport(fd);
      if (res.success && res.results?.length) {
        const text = res.results.map((r: { text: string }) => r.text).join('\n\n---\n\n');
        setEditorText(text);
        setIsDone(true);
      } else {
        const reason = res.rejected?.[0]?.reason || res.error?.message || 'Extraction failed';
        throw new Error(reason);
      }
    }
  };

  // Transcribe multi (sequential)
  const transcribeMulti = async (fileList: UploadedFile[]) => {
    const pageTexts: string[] = [];
    const rejected: { name: string; reason: string }[] = [];
    setTranscribeProgress({ current: 0, total: fileList.length });

    for (let i = 0; i < fileList.length; i++) {
      const uf = fileList[i];
      setTranscribeProgress({ current: i + 1, total: fileList.length });
      try {
        if (uf.ext === 'txt') {
          pageTexts.push(`Page ${i + 1}\n\n${await uf.file.text()}`);
        } else if (ACCEPTED_IMAGES.includes(uf.ext)) {
          const fd = new FormData();
          fd.append('image', uf.file, uf.name);
          const res = await mediaApi.ocrImage(fd);
          if (res.success) {
            pageTexts.push(`Page ${i + 1}\n\n${res.text || '[No text found]'}`);
          } else {
            rejected.push({ name: uf.name, reason: res.error?.message || 'OCR failed' });
          }
        } else if (ACCEPTED_DOCS.includes(uf.ext)) {
          const fd = new FormData();
          fd.append('files[]', uf.file, uf.name);
          const res = await mediaApi.batchImport(fd);
          if (res.success && res.results?.length) {
            pageTexts.push(`Page ${i + 1}\n\n${res.results[0].text || '[No text found]'}`);
          } else {
            const reason = res.rejected?.[0]?.reason || res.error?.message || 'Extraction failed';
            rejected.push({ name: uf.name, reason });
          }
        }
        if (pageTexts.length) setEditorText(pageTexts.join('\n\n---\n\n'));
      } catch (e: unknown) {
        rejected.push({ name: uf.name, reason: e instanceof Error ? e.message : 'Unknown error' });
      }
    }
    setRejectedFiles(rejected);
    setIsDone(true);
  };

  // Transcribe ZIP
  const transcribeZip = async (zipFile: File) => {
    setIsTranscribing(true);
    try {
      const fd = new FormData();
      fd.append('zip_file', zipFile, zipFile.name);
      const res = await mediaApi.batchImport(fd);
      if (res.success && res.results?.length) {
        const texts = res.results.map((r: { text: string }, i: number) => `Page ${i + 1}\n\n${r.text}`);
        setEditorText(texts.join('\n\n---\n\n'));
        setIsDone(true);
        if (res.rejected?.length) {
          setRejectedFiles(res.rejected.map((r: { filename: string; reason: string }) =>
            ({ name: r.filename, reason: r.reason })
          ));
        }
      } else {
        toast.error(res.error?.message || 'ZIP import failed');
      }
    } catch {
      toast.error('ZIP import failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleTranscribe = async () => {
    if (!files.length) return;
    setIsTranscribing(true);
    editor?.commands.clearContent();
    setRejectedFiles([]);
    setIsDone(false);
    try {
      if (mode === 'single' || files.length === 1) {
        await transcribeSingle(files[0]);
      } else {
        await transcribeMulti(files);
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Transcription failed. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  // Save
  const handleSave = async () => {
    const content = getEditorHTML();
    const text = getEditorText();
    if (!text.trim()) { toast.error('Nothing to save — please transcribe first.'); return; }
    setSaveStatus('saving');
    try {
      if (savedEntryId) {
        const res = await journalApi.updateEntry(savedEntryId, {
          title: title || 'Scanned Journal Entry',
          content,
          burn_mode: burnMode,
          end_time: burnDate ? burnDate.toISOString() : null,
        });
        if (res.success && res.entry) { setSaveStatus('saved'); onSave(res.entry); }
        else { setSaveStatus('error'); toast.error(res.error?.message || 'Save failed.'); }
      } else {
        const res = await journalApi.createEntry({
          title: title || 'Scanned Journal Entry',
          content,
          mood: pendingMood || undefined,
          burn_mode: burnMode,
          end_time: burnDate ? burnDate.toISOString() : undefined,
          input_method: 'text',
          entry_date: entryDate,
        });
        if (res.success && res.entry) {
          setSaveStatus('saved');
          setSavedEntryId(res.entry.id);
          onSave(res.entry);
          toast.success('Entry saved.');
        } else {
          setSaveStatus('error');
          toast.error(res.error?.message || 'Save failed.');
        }
      }
    } catch {
      setSaveStatus('error');
      toast.error('Save failed. Please try again.');
    }
  };

  // Burn
  const handleBurnToggle = (next: boolean) => {
    if (next) { setBurnMode(true); setShowBurnPicker(true); }
    else { setBurnMode(false); setBurnDate(null); }
  };
  const handleBurnTimeConfirm = (date: Date) => { setBurnDate(date); setShowBurnPicker(false); };
  const handleBurnPickerCancel = () => {
    setShowBurnPicker(false);
    if (burnMode && !burnDate) setBurnMode(false);
  };

  // Delete
  const handleDelete = async () => {
    if (!savedEntryId) { onBack(); return; }
    try {
      const res = await journalApi.deleteEntry(savedEntryId);
      if (res.success) { toast.success('Entry deleted.'); onDelete(savedEntryId); }
      else toast.error('Failed to delete entry.');
    } catch { toast.error('Failed to delete entry.'); }
  };

  const saveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving': return <Clock size={13} className="animate-pulse" />;
      case 'saved': return <Check size={13} />;
      default: return null;
    }
  };
  const saveStatusText = () => {
    switch (saveStatus) {
      case 'saving': return t('upload_savingStatus');
      case 'saved': return t('upload_savedStatus');
      case 'error': return t('upload_saveError');
      default: return '';
    }
  };

  const canTranscribe = files.length > 0 && !isTranscribing;
  const canSave = isDone && getEditorText().trim().length > 0;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--background)', fontFamily: FONT }}>

      {/* Action bar */}
      <header
        className="flex items-center justify-between px-4 lg:px-6 py-2.5 flex-shrink-0"
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
          <h1 className="text-base font-semibold tracking-wide" style={{ color: 'var(--foreground)', fontFamily: FONT }}>
            {t('upload_title')}
          </h1>
          {saveStatus !== 'idle' && (
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: saveStatus === 'saved' ? GOLD : 'var(--muted-foreground)', fontFamily: FONT, fontWeight: 600 }}
            >
              {saveStatusIcon()}
              <span>{saveStatusText()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <BurnSwitch value={burnMode} onChange={handleBurnToggle} disabled={saveStatus === 'saving'} id="upload-burn-switch" />

          <button
            onClick={handleSave}
            disabled={!canSave}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            style={{ color: canSave ? GOLD : 'var(--muted-foreground)' }}
            title="Save entry"
          >
            <CheckCircle2 size={16} />
          </button>

          {savedEntryId && (
            <button
              onClick={() => { if (!isElite) { setShowExportPaywall(true); return; } setShowExportDialog(true); }}
              className="p-2 rounded-lg transition-colors relative"
              style={{ color: 'var(--muted-foreground)' }}
              title={isElite ? t('journalEditor_exportPdf') : t('journalEditor_exportElite')}
            >
              <FileDown size={16} />
              {!isElite && <Crown size={8} className="absolute -top-0.5 -right-0.5" style={{ color: GOLD }} />}
            </button>
          )}

          <button
            onClick={onToggleAi}
            className="p-2 rounded-lg transition-colors"
            style={{ color: GOLD, backgroundColor: 'rgba(201,168,76,0.06)' }}
            title={t('journalEditor_aiCompanion')}
          >
            <Bot size={16} />
          </button>

          {savedEntryId && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
              title={t('journalEditor_deleteEntry')}
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Burn countdown */}
      {burnMode && burnDate && (
        <div className="px-6 pt-3 flex-shrink-0">
          <BurnCountdown target={burnDate} />
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto diary-scrollbar">
        <div className="max-w-2xl mx-auto px-6 lg:px-12 py-6 space-y-5">

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t('upload_titlePlaceholder')}
            className="w-full bg-transparent border-0 border-b text-2xl font-semibold outline-none pb-2 transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)', fontFamily: FONT }}
            onFocus={e => { e.currentTarget.style.borderColor = GOLD; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          />

          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>Mode</span>
            {(['single', 'multi'] as const).map(m => (
              <button
                key={m}
                onClick={() => {
                  if (m === 'multi' && !isElite) { toast.error('Multi-file upload is an Elite feature.'); return; }
                  setMode(m);
                  setFiles([]);
                  editor?.commands.clearContent();
                  setIsDone(false);
                }}
                className="px-3 py-1 rounded-lg text-xs font-semibold border transition-all"
                style={{
                  background: mode === m ? `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})` : 'transparent',
                  color: mode === m ? '#F5F0E8' : 'var(--foreground)',
                  borderColor: mode === m ? GOLD : 'var(--border)',
                  fontFamily: FONT,
                }}
              >
                {m === 'single' ? t('upload_modeSingle') : `${t('upload_modeMulti')} ${!isElite ? '🔒' : ''}`}
              </button>
            ))}
          </div>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-8 cursor-pointer transition-all"
            style={{
              borderColor: isDragging ? GOLD : 'var(--border)',
              background: isDragging ? `${GOLD}10` : 'var(--card)',
            }}
          >
            <Upload size={26} style={{ color: isDragging ? GOLD : 'var(--muted-foreground)' }} />
            <p className="mt-2.5 text-sm font-semibold" style={{ color: 'var(--foreground)', fontFamily: FONT }}>
              {t('upload_dropZoneTitle')}
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {mode === 'multi' ? t('upload_dropZoneMultiNote', { max: MAX_FILES }) : t('upload_dropZoneNote')}
            </p>
            <div
              className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}
            >
              <Printer size={12} style={{ color: GOLD }} />
              <span className="text-xs" style={{ color: GOLD, fontFamily: FONT }}>
                {t('upload_scannerHint')}
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple={mode === 'multi'}
            accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.docx,.doc"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* ZIP upload */}
          {mode === 'multi' && isElite && (
            <button
              onClick={() => zipInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all"
              style={{ background: 'transparent', borderColor: 'var(--border)', color: 'var(--foreground)', fontFamily: FONT }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <FileArchive size={13} style={{ color: GOLD }} />
              {t('upload_zipUpload')}
            </button>
          )}
          <input ref={zipInputRef} type="file" accept=".zip" onChange={handleZipChange} className="hidden" />

          {/* File list */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
              >
                {files.map((uf, i) => (
                  <div
                    key={uf.id}
                    className="flex items-center gap-3 px-4 py-2.5"
                    style={{ borderBottom: i < files.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: `${GOLD}20`, color: GOLD, fontFamily: FONT }}
                    >
                      {i + 1}
                    </div>
                    {uf.preview
                      ? <img src={uf.preview} alt={uf.name} className="w-9 h-9 object-cover rounded flex-shrink-0" />
                      : (
                        <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0" style={{ background: `${GOLD}15` }}>
                          <FileText size={16} style={{ color: GOLD }} />
                        </div>
                      )
                    }
                    <span className="flex-1 text-sm truncate" style={{ color: 'var(--foreground)', fontFamily: FONT }}>
                      {uf.name}
                    </span>
                    <button
                      onClick={() => removeFile(uf.id)}
                      className="p-1 rounded transition-colors flex-shrink-0"
                      style={{ color: 'var(--muted-foreground)' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'; }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                {mode === 'multi' && files.length < MAX_FILES && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs transition-colors"
                    style={{ color: GOLD, fontFamily: FONT, borderTop: '1px solid var(--border)' }}
                  >
                    <Plus size={13} />
                    {t('upload_addMore', { current: files.length, max: MAX_FILES })}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Transcribe button */}
          {files.length > 0 && (
            <button
              onClick={handleTranscribe}
              disabled={!canTranscribe}
              className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: canTranscribe ? `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})` : 'var(--muted)',
                color: canTranscribe ? '#F5F0E8' : 'var(--muted-foreground)',
                cursor: canTranscribe ? 'pointer' : 'not-allowed',
                fontFamily: FONT,
                letterSpacing: '0.08em',
              }}
            >
              {isTranscribing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {transcribeProgress.total > 1
                    ? t('upload_readingPage', { current: transcribeProgress.current, total: transcribeProgress.total })
                    : t('upload_transcribing')}
                </>
              ) : (
                mode === 'multi' && files.length > 1 ? t('upload_transcribeAll') : t('upload_transcribe')
              )}
            </button>
          )}

          {/* Rich text editor */}
          <AnimatePresence>
            {(isDone || isTranscribing) && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border overflow-hidden"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="px-3 py-1.5 border-b"
                  style={{ borderColor: 'var(--border)', background: 'var(--card)' }}
                >
                  <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>
                    {t('upload_transcriptionLabel')}
                  </span>
                </div>
                <EditorToolbar editor={editor} />
                <div className="px-6 py-5" style={{ background: 'var(--background)' }}>
                  {isTranscribing && !isDone ? (
                    <div className="flex items-center gap-2 py-4" style={{ color: 'var(--muted-foreground)' }}>
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-sm" style={{ fontFamily: FONT }}>{t('upload_readingHandwriting')}</span>
                    </div>
                  ) : (
                    <EditorContent editor={editor} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Entry date */}
          <AnimatePresence>
            {isDone && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <label className="text-xs tracking-widest uppercase" style={{ color: 'var(--muted-foreground)' }}>
                  {t('upload_entryDateLabel')}
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={e => setEntryDate(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border text-sm outline-none transition-colors"
                  style={{ background: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)', fontFamily: FONT }}
                  onFocus={e => { e.currentTarget.style.borderColor = GOLD; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rejected files */}
          <AnimatePresence>
            {rejectedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl border px-4 py-3 space-y-2"
                style={{ borderColor: '#ef444440', background: '#ef444408' }}
              >
                <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#ef4444' }}>
                  {t('upload_failedFiles')}
                </p>
                {rejectedFiles.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertCircle size={12} style={{ color: '#ef4444', marginTop: 2, flexShrink: 0 }} />
                    <p className="text-xs" style={{ color: 'var(--foreground)' }}>
                      <span className="font-semibold">{r.name}</span> — {r.reason}
                    </p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save button */}
          {isDone && (
            <button
              onClick={handleSave}
              disabled={!canSave || saveStatus === 'saving'}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mb-8"
              style={{
                background: canSave ? `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})` : 'var(--muted)',
                color: canSave ? '#F5F0E8' : 'var(--muted-foreground)',
                cursor: canSave ? 'pointer' : 'not-allowed',
                fontFamily: FONT,
                letterSpacing: '0.08em',
              }}
            >
              {saveStatus === 'saving'
                ? <><Loader2 size={14} className="animate-spin" />{t('upload_savingEntry')}</>
                : <><CheckCircle2 size={14} />{t('upload_saveEntry')}</>}
            </button>
          )}
        </div>
      </div>

      {/* Burn time picker */}
      <BurnTimePicker
        open={showBurnPicker}
        onConfirm={handleBurnTimeConfirm}
        onCancel={handleBurnPickerCancel}
      />

      {/* Export dialog */}
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={async (delivery) => {
          if (!savedEntryId) return;
          setIsExporting(true);
          try {
            const res = await exportApi.exportEntry(savedEntryId, delivery);
            if (res.success) {
              toast.success(delivery === 'email' ? t('journalEditor_exportSentEmail') : t('journalEditor_exportDownloaded'));
            } else {
              toast.error('Export failed');
            }
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Export failed');
          }
          setIsExporting(false);
          setShowExportDialog(false);
        }}
        isExporting={isExporting}
        userEmail={user?.email ?? ''}
        mode="entry"
      />

      {/* Export paywall */}
      <PaywallModal
        isOpen={showExportPaywall}
        onClose={() => setShowExportPaywall(false)}
        feature="export"
      />

      {/* Delete confirm */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="rounded-2xl p-6 max-w-sm w-full"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: FONT, color: 'var(--foreground)' }}>
                {t('upload_deleteTitle')}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>
                {t('upload_deleteBody')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-lg border text-sm font-semibold"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)', fontFamily: FONT }}
                >
                  {t('common_cancel')}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: '#ef4444', color: '#fff', fontFamily: FONT }}
                >
                  {t('common_delete')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
