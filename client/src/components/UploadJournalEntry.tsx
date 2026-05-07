/**
 * UploadJournalEntry — Web / Desktop Camera & File Upload
 * Supports: JPG, PNG, WEBP, PDF, TXT (individual files)
 *           ZIP (batch import, Elite only)
 * Scanner/printer: user scans to file, uploads here — no direct device camera
 * Elite gate: multi-file / ZIP upload
 */
import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { mediaApi, journalApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Upload, FileText, ImageIcon, FileArchive,
  X, Loader2, Printer, ChevronLeft, Save,
  CheckCircle2, AlertCircle, Plus
} from 'lucide-react';
import type { JournalEntry } from '@/pages/Dashboard';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';
const GOLD_DARK = '#A8863A';
const BG = 'var(--background)';
const SURFACE = 'var(--card)';
const BORDER = 'var(--border)';
const TEXT = 'var(--foreground)';
const MUTED = 'var(--muted-foreground)';

const ACCEPTED_SINGLE = ['jpg', 'jpeg', 'png', 'webp', 'pdf', 'txt'];
const ACCEPTED_IMAGES = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILES = 20;

interface UploadedFile {
  file: File;
  id: string;
  name: string;
  ext: string;
  preview?: string; // object URL for images
}

interface Props {
  onSave: (entry: JournalEntry) => void;
  onBack: () => void;
  pendingMood?: string | null;
}

export default function UploadJournalEntry({ onSave, onBack, pendingMood }: Props) {
  const { isElite } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<'single' | 'multi'>('single');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeProgress, setTranscribeProgress] = useState({ current: 0, total: 0 });
  const [transcription, setTranscription] = useState('');
  const [reflection, setReflection] = useState('');
  const [isReflecting, setIsReflecting] = useState(false);
  const [rejectedFiles, setRejectedFiles] = useState<{ name: string; reason: string }[]>([]);
  const [title, setTitle] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [burnMode, setBurnMode] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // ── File validation ──
  const getExt = (name: string) => name.split('.').pop()?.toLowerCase() ?? '';

  const isAccepted = (name: string) => {
    const ext = getExt(name);
    return ACCEPTED_SINGLE.includes(ext);
  };

  const makeUploadedFile = (file: File): UploadedFile => {
    const ext = getExt(file.name);
    const preview = ACCEPTED_IMAGES.includes(ext)
      ? URL.createObjectURL(file)
      : undefined;
    return { file, id: `${Date.now()}-${Math.random()}`, name: file.name, ext, preview };
  };

  // ── File addition ──
  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(f => isAccepted(f.name));
    const invalid = incoming.filter(f => !isAccepted(f.name));

    if (invalid.length) {
      toast.warning(`${invalid.length} unsupported file(s) skipped. Accepted: JPG, PNG, WEBP, PDF, TXT`);
    }

    if (mode === 'single') {
      // Replace with first valid file
      const f = valid[0];
      if (!f) return;
      setFiles([makeUploadedFile(f)]);
      setTranscription('');
      setReflection('');
      setIsDone(false);
    } else {
      // Append up to MAX_FILES
      setFiles(prev => {
        const combined = [...prev, ...valid.map(makeUploadedFile)];
        if (combined.length > MAX_FILES) {
          toast.warning(`Maximum ${MAX_FILES} files. Extra files were not added.`);
          return combined.slice(0, MAX_FILES);
        }
        return combined;
      });
      setTranscription('');
      setReflection('');
      setIsDone(false);
    }
  }, [mode]);

  // ── Drag & drop ──
  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  // ── File input change ──
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleZipChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const f = e.target.files[0];
    if (getExt(f.name) !== 'zip') { toast.error('Only ZIP files accepted here.'); return; }
    // ZIP goes directly to batch-import
    transcribeZip(f);
    e.target.value = '';
  };

  // ── Remove file ──
  const removeFile = (id: string) => {
    setFiles(prev => {
      const f = prev.find(x => x.id === id);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter(x => x.id !== id);
    });
    if (files.length <= 1) { setTranscription(''); setIsDone(false); }
  };

  // ── Transcribe — single ──
  const transcribeSingle = async (uf: UploadedFile) => {
    if (uf.ext === 'txt') {
      const text = await uf.file.text();
      setTranscription(text);
      setIsDone(true);
      fetchReflection(text);
      return;
    }
    // image or PDF → backend OCR
    const formData = new FormData();
    if (ACCEPTED_IMAGES.includes(uf.ext)) {
      formData.append('image', uf.file, uf.name);
      const res = await mediaApi.ocrImage(formData);
      if (res.success) {
        setTranscription(res.text || '');
        setIsDone(true);
        fetchReflection(res.text || '');
      } else {
        throw new Error(res.error?.message || 'OCR failed');
      }
    } else if (uf.ext === 'pdf') {
      const fd = new FormData();
      fd.append('files[]', uf.file, uf.name);
      const res = await mediaApi.batchImport(fd);
      if (res.success && res.results?.length) {
        const text = res.results.map((r: { text: string }) => r.text).join('\n\n---\n\n');
        setTranscription(text);
        setIsDone(true);
        fetchReflection(text);
      } else {
        // PDF has no text layer (scanned PDF) — tell user to upload as images instead
        const reason = res.results?.length === 0 && res.rejected?.length
          ? res.rejected[0]?.reason
          : res.error?.message;
        const isScanned = reason?.toLowerCase().includes('readable text') ||
                          reason?.toLowerCase().includes('photos of each page');
        if (isScanned) {
          throw new Error(
            'This PDF appears to be a scanned document with no text layer. ' +
            'Please take photos of each page and upload them as JPG images instead.'
          );
        }
        throw new Error(reason || 'PDF extraction failed');
      }
    }
  };

  // ── Transcribe — multi (sequential) ──
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
        } else if (uf.ext === 'pdf') {
          const fd = new FormData();
          fd.append('files[]', uf.file, uf.name);
          const res = await mediaApi.batchImport(fd);
          if (res.success && res.results?.length) {
            pageTexts.push(`Page ${i + 1}\n\n${res.results[0].text || '[No text found]'}`);
          } else {
            const reason = res.rejected?.[0]?.reason || res.error?.message || 'PDF extraction failed';
            const isScanned = reason.toLowerCase().includes('readable text') ||
                              reason.toLowerCase().includes('photos of each page');
            rejected.push({
              name: uf.name,
              reason: isScanned
                ? 'Scanned PDF — no text layer. Upload photos of each page as JPG instead.'
                : reason,
            });
          }
        }

        // Update transcription live after each page
        setTranscription(pageTexts.join('\n\n---\n\n'));
      } catch (e: unknown) {
        rejected.push({ name: uf.name, reason: e instanceof Error ? e.message : 'Unknown error' });
      }
    }

    setRejectedFiles(rejected);
    const combined = pageTexts.join('\n\n---\n\n');
    setTranscription(combined);
    setIsDone(true);
    if (combined) fetchReflection(combined);
  };

  // ── Transcribe — ZIP ──
  const transcribeZip = async (zipFile: File) => {
    setIsTranscribing(true);
    try {
      const fd = new FormData();
      fd.append('zip_file', zipFile, zipFile.name);
      const res = await mediaApi.batchImport(fd);
      if (res.success && res.results?.length) {
        const texts = res.results.map((r: { text: string }, i: number) =>
          `Page ${i + 1}\n\n${r.text}`
        );
        const combined = texts.join('\n\n---\n\n');
        setTranscription(combined);
        setIsDone(true);
        fetchReflection(combined);
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

  // ── Main transcribe handler ──
  const handleTranscribe = async () => {
    if (!files.length) return;
    setIsTranscribing(true);
    setTranscription('');
    setReflection('');
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

  // ── AI Reflection ──
  const fetchReflection = async (text: string) => {
    if (!text || text.length < 20) return;
    setIsReflecting(true);
    try {
      const res = await fetch('https://api.diary.gmxquantum.com/api/ai/companion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('diary_access_token')}`,
        },
        body: JSON.stringify({
          message: 'Please provide a brief, compassionate reflection on this journal entry.',
          history: [],
          entry_context: text,
          mode: 'auto',
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.response) {
        setReflection(data.data.response);
      }
    } catch { /* silent */ }
    setIsReflecting(false);
  };

  // ── Save entry ──
  const handleSave = async () => {
    if (!transcription.trim()) { toast.error('Nothing to save — please transcribe first.'); return; }
    setIsSaving(true);
    try {
      const res = await journalApi.createEntry({
        title: title || 'Scanned Journal Entry',
        content: transcription,
        mood: pendingMood || undefined,
        burn_mode: burnMode,
        input_method: 'text',
        entry_date: entryDate,
      });
      if (res.success && res.entry) {
        toast.success('Entry saved.');
        onSave(res.entry);
      } else {
        toast.error(res.error?.message || 'Save failed.');
      }
    } catch {
      toast.error('Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const canTranscribe = files.length > 0 && !isTranscribing;
  const canSave = isDone && transcription.trim().length > 0 && !isSaving;

  return (
    <div
      className="flex flex-col h-full overflow-y-auto"
      style={{ background: BG, fontFamily: FONT }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: BORDER }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm transition-colors"
          style={{ color: MUTED, fontFamily: FONT }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = GOLD; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
        >
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="text-center">
          <h1 className="text-lg font-semibold tracking-wide" style={{ color: TEXT, fontFamily: FONT }}>
            Scan / Upload
          </h1>
          <p className="text-xs mt-0.5" style={{ color: MUTED }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={!canSave}
          className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: canSave ? `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})` : 'var(--muted)',
            color: canSave ? '#F5F0E8' : MUTED,
            cursor: canSave ? 'pointer' : 'not-allowed',
            fontFamily: FONT,
            letterSpacing: '0.06em',
          }}
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save
        </button>
      </div>

      <div className="flex-1 px-6 py-5 space-y-5 max-w-3xl mx-auto w-full">

        {/* ── Title ── */}
        <div>
          <label className="block text-xs tracking-widest uppercase mb-1.5" style={{ color: MUTED }}>Title</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Enter a title for this entry"
            className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
            style={{
              background: SURFACE,
              borderColor: BORDER,
              color: TEXT,
              fontFamily: FONT,
            }}
            onFocus={e => { e.currentTarget.style.borderColor = GOLD; }}
            onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
          />
        </div>

        {/* ── Single / Multi toggle ── */}
        <div>
          <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: MUTED }}>Mode</label>
          <div className="flex gap-2">
            {(['single', 'multi'] as const).map(m => (
              <button
                key={m}
                onClick={() => {
                  if (m === 'multi' && !isElite) {
                    toast.error('Multi-file upload is an Elite feature. Upgrade to unlock.');
                    return;
                  }
                  setMode(m);
                  setFiles([]);
                  setTranscription('');
                  setIsDone(false);
                }}
                className="px-4 py-1.5 rounded-lg text-sm font-semibold border transition-all"
                style={{
                  background: mode === m ? `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})` : SURFACE,
                  color: mode === m ? '#F5F0E8' : TEXT,
                  borderColor: mode === m ? GOLD : BORDER,
                  fontFamily: FONT,
                  letterSpacing: '0.06em',
                }}
              >
                {m === 'single' ? 'Single File' : `Multi File ${!isElite ? '🔒' : ''}`}
              </button>
            ))}
          </div>
        </div>

        {/* ── Drop zone ── */}
        <div>
          <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: MUTED }}>
            {mode === 'single' ? 'File' : `Files (${files.length}/${MAX_FILES})`}
          </label>

          {/* Drag & drop area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center py-10 cursor-pointer transition-all"
            style={{
              borderColor: isDragging ? GOLD : BORDER,
              background: isDragging ? `${GOLD}10` : SURFACE,
            }}
          >
            <Upload size={28} style={{ color: isDragging ? GOLD : MUTED }} />
            <p className="mt-3 text-sm font-semibold" style={{ color: TEXT, fontFamily: FONT }}>
              Drop files here or click to browse
            </p>
            <p className="mt-1 text-xs" style={{ color: MUTED }}>
              JPG, PNG, WEBP, PDF, TXT
              {mode === 'multi' ? ` · up to ${MAX_FILES} files` : ''}
            </p>

            {/* Scanner tip */}
            <div
              className="mt-4 flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}30` }}
            >
              <Printer size={13} style={{ color: GOLD }} />
              <span className="text-xs" style={{ color: GOLD, fontFamily: FONT }}>
                Using a scanner? Scan to file, then upload here
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple={mode === 'multi'}
            accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* ── ZIP upload (Elite, multi mode) ── */}
        {mode === 'multi' && isElite && (
          <div>
            <button
              onClick={() => zipInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold transition-all"
              style={{
                background: SURFACE,
                borderColor: BORDER,
                color: TEXT,
                fontFamily: FONT,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}
            >
              <FileArchive size={15} style={{ color: GOLD }} />
              Upload ZIP (batch)
            </button>
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip"
              onChange={handleZipChange}
              className="hidden"
            />
          </div>
        )}

        {/* ── File list ── */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: BORDER, background: SURFACE }}
            >
              {files.map((uf, i) => (
                <div
                  key={uf.id}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < files.length - 1 ? `1px solid ${BORDER}` : 'none' }}
                >
                  {/* Number badge */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: `${GOLD}20`, color: GOLD, fontFamily: FONT }}
                  >
                    {i + 1}
                  </div>

                  {/* Thumbnail or icon */}
                  {uf.preview ? (
                    <img src={uf.preview} alt={uf.name} className="w-10 h-10 object-cover rounded flex-shrink-0" />
                  ) : (
                    <div
                      className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
                      style={{ background: `${GOLD}15` }}
                    >
                      {uf.ext === 'pdf'
                        ? <FileText size={18} style={{ color: GOLD }} />
                        : <FileText size={18} style={{ color: GOLD }} />}
                    </div>
                  )}

                  <span className="flex-1 text-sm truncate" style={{ color: TEXT, fontFamily: FONT }}>
                    {uf.name}
                  </span>

                  <button
                    onClick={() => removeFile(uf.id)}
                    className="p-1 rounded transition-colors flex-shrink-0"
                    style={{ color: MUTED }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = MUTED; }}
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}

              {/* Add more button (multi mode) */}
              {mode === 'multi' && files.length < MAX_FILES && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 py-3 text-sm transition-colors"
                  style={{ color: GOLD, fontFamily: FONT, borderTop: `1px solid ${BORDER}` }}
                >
                  <Plus size={15} />
                  Add More Files ({files.length}/{MAX_FILES})
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Transcribe button ── */}
        {files.length > 0 && (
          <button
            onClick={handleTranscribe}
            disabled={!canTranscribe}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
            style={{
              background: canTranscribe
                ? `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`
                : 'var(--muted)',
              color: canTranscribe ? '#F5F0E8' : MUTED,
              cursor: canTranscribe ? 'pointer' : 'not-allowed',
              fontFamily: FONT,
              letterSpacing: '0.08em',
            }}
          >
            {isTranscribing ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                {transcribeProgress.total > 1
                  ? `Reading page ${transcribeProgress.current} of ${transcribeProgress.total}...`
                  : 'Transcribing...'}
              </>
            ) : (
              mode === 'multi' && files.length > 1 ? 'Transcribe All' : 'Transcribe'
            )}
          </button>
        )}

        {/* ── AI Transcription ── */}
        <AnimatePresence>
          {(transcription || isTranscribing) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: MUTED }}>
                AI Transcription
              </label>
              <textarea
                value={transcription}
                onChange={e => setTranscription(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm outline-none resize-none transition-colors"
                rows={10}
                style={{
                  background: SURFACE,
                  borderColor: BORDER,
                  color: TEXT,
                  fontFamily: FONT,
                  lineHeight: '1.7',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = GOLD; }}
                onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
                placeholder={isTranscribing ? 'Reading your handwriting...' : ''}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── diAry's Reflection ── */}
        <AnimatePresence>
          {(reflection || isReflecting) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: MUTED }}>
                diAry's Reflection
              </label>
              <div
                className="rounded-xl border px-4 py-4 text-sm"
                style={{
                  background: SURFACE,
                  borderColor: `${GOLD}40`,
                  color: TEXT,
                  fontFamily: FONT,
                  lineHeight: '1.75',
                  fontStyle: 'italic',
                }}
              >
                {isReflecting ? (
                  <div className="flex items-center gap-2" style={{ color: MUTED }}>
                    <Loader2 size={14} className="animate-spin" />
                    Reflecting...
                  </div>
                ) : reflection}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Entry Date ── */}
        <AnimatePresence>
          {isDone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <label className="block text-xs tracking-widest uppercase mb-2" style={{ color: MUTED }}>
                Entry Date
              </label>
              <input
                type="date"
                value={entryDate}
                onChange={e => setEntryDate(e.target.value)}
                className="px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                style={{
                  background: SURFACE,
                  borderColor: BORDER,
                  color: TEXT,
                  fontFamily: FONT,
                }}
                onFocus={e => { e.currentTarget.style.borderColor = GOLD; }}
                onBlur={e => { e.currentTarget.style.borderColor = BORDER; }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Rejected files ── */}
        <AnimatePresence>
          {rejectedFiles.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border px-4 py-3 space-y-2"
              style={{ borderColor: '#ef444440', background: '#ef444408' }}
            >
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#ef4444' }}>
                Files Not Processed
              </p>
              {rejectedFiles.map((r, i) => (
                <div key={i} className="flex items-start gap-2">
                  <AlertCircle size={13} style={{ color: '#ef4444', marginTop: 2, flexShrink: 0 }} />
                  <p className="text-xs" style={{ color: TEXT }}>
                    <span className="font-semibold">{r.name}</span> — {r.reason}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Save Entry ── */}
        {isDone && (
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 mb-6"
            style={{
              background: canSave ? `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})` : 'var(--muted)',
              color: canSave ? '#F5F0E8' : MUTED,
              cursor: canSave ? 'pointer' : 'not-allowed',
              fontFamily: FONT,
              letterSpacing: '0.08em',
            }}
          >
            {isSaving
              ? <><Loader2 size={15} className="animate-spin" />Saving...</>
              : <><CheckCircle2 size={15} />Save Entry</>}
          </button>
        )}
      </div>
    </div>
  );
}
