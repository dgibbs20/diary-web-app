/**
 * AI Companion — Right drawer panel with chat interface
 * Premium branded: Cormorant Garamond, gold accents, refined layout
 * Supports all modes: auto, vault, friend, mirror, insight
 * Sends chat history to backend for context continuity
 *
 * QUICK CHAT ACTION BAR (when messages exist):
 * - Save as Journal Entry (name it inline, POST with type: chat, input_method: ai_quick_chat)
 * - Export as plain text (browser download)
 * - Burn (clear chat, no save)
 * - Delete / Discard (same as burn with confirmation)
 *
 * PAYWALL GATING:
 * - Free users: 5 AI responses/day, only Auto + Vault modes
 * - Elite users: Unlimited responses, all 5 modes
 * - When limit hit or restricted mode selected → PaywallModal
 */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Send, Loader2, Bot, Sparkles, Crown, Lock,
  Save, Download, Flame, Trash2, Check, ChevronDown,
} from 'lucide-react';
import { aiApi, journalApi } from '@/lib/api';
import { AI_MODES } from '@/lib/constants';
import { useAuth } from '@/contexts/AuthContext';
import { Streamdown } from 'streamdown';
import { toast } from 'sonner';
import PaywallModal from './PaywallModal';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';
const GOLD_DARK = '#A8863A';

const FREE_MODES = ['auto', 'vault'];
const FREE_DAILY_LIMIT = 5;

interface AiCompanionProps {
  entryContext?: string;
  userName?: string;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ── Utility: build transcript string from messages ──
function buildTranscript(messages: ChatMessage[]): string {
  return messages
    .map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.content}`)
    .join('\n\n');
}

// ── Utility: download plain text file in browser ──
function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function AiCompanion({ entryContext, userName, onClose }: AiCompanionProps) {
  const { isElite } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [dailyUsage, setDailyUsage] = useState(0);
  const [paywallFeature, setPaywallFeature] = useState<'ai_modes' | 'ai_limit' | null>(null);

  // ── Quick Chat action bar state ──
  const [entryTitle, setEntryTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBurnConfirm, setShowBurnConfirm] = useState(false);
  const [savedEntryId, setSavedEntryId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Default title based on current date
  const defaultTitle = `Quick Chat — ${new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })}`;

  // Fetch AI usage on mount for free users
  useEffect(() => {
    if (!isElite) {
      aiApi.getUsage().then(res => {
        if (res.success && res.usage) {
          const used = res.usage.ai_responses?.used ?? res.usage.ai_responses_today ?? 0;
          setDailyUsage(used);
        }
      }).catch(() => {});
    }
  }, [isElite]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const handleModeSelect = (modeId: string) => {
    if (!isElite && !FREE_MODES.includes(modeId)) {
      setPaywallFeature('ai_modes');
      setShowModes(false);
      return;
    }
    setMode(modeId);
    setShowModes(false);
  };

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isLoading) return;

    if (!isElite && dailyUsage >= FREE_DAILY_LIMIT) {
      setPaywallFeature('ai_limit');
      return;
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await aiApi.sendMessage(msg, mode, entryContext, history, userName);
      if (res.success && res.response) {
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: res.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMsg]);
        if (!isElite) setDailyUsage(prev => prev + 1);
      } else {
        const errorCode = res.error?.code;
        if (errorCode === 'AI_LIMIT_REACHED' || errorCode === 'DAILY_LIMIT_EXCEEDED') {
          setPaywallFeature('ai_limit');
        } else if (errorCode === 'ELITE_ONLY' || errorCode === 'MODE_RESTRICTED') {
          setPaywallFeature('ai_modes');
        } else {
          const errorMsg = res.error?.message || 'AI companion is unavailable right now.';
          toast.error(errorMsg);
          const aiMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `*${errorMsg}*`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMsg]);
        }
      }
    } catch {
      toast.error('Failed to reach AI companion');
    }
    setIsLoading(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Save chat as journal entry ──
  const handleSave = async () => {
    if (messages.length === 0) return;
    setIsSaving(true);
    const title = entryTitle.trim() || defaultTitle;
    const content = buildTranscript(messages);
    try {
      const res = await journalApi.createEntry({
        title,
        content,
        input_method: 'ai_quick_chat',
        // type is passed as extra field — backend now accepts it
        ...(({ type: 'chat' } as unknown) as object),
      } as Parameters<typeof journalApi.createEntry>[0]);

      if (res && (res.success || res.id || res.entry)) {
        const id = res.id ?? res.entry?.id ?? null;
        setSavedEntryId(id);
        toast.success(`Saved: "${title}"`);
        setEntryTitle('');
        setEditingTitle(false);
      } else {
        toast.error(res?.error?.message || 'Failed to save entry');
      }
    } catch {
      toast.error('Failed to save entry');
    }
    setIsSaving(false);
  };

  // ── Export transcript as .txt download ──
  const handleExport = () => {
    if (messages.length === 0) return;
    const title = entryTitle.trim() || defaultTitle;
    const transcript = `${title}\n${'─'.repeat(title.length)}\n\n${buildTranscript(messages)}`;
    const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    downloadTextFile(filename, transcript);
    toast.success('Exported to file');
  };

  // ── Burn / clear chat ──
  const handleBurn = () => {
    setMessages([]);
    setSavedEntryId(null);
    setEntryTitle('');
    setShowBurnConfirm(false);
    toast.success('Chat cleared');
  };

  const currentMode = AI_MODES.find(m => m.id === mode) || AI_MODES[0];
  const remainingResponses = FREE_DAILY_LIMIT - dailyUsage;
  const hasMessages = messages.length > 0;

  return (
    <>
      <div className="h-full flex flex-col" style={{ width: 380, backgroundColor: 'var(--card)' }}>

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: `rgba(201,168,76,0.1)` }}
            >
              <Bot size={16} style={{ color: GOLD_DARK }} />
            </div>
            <div>
              <h3
                className="text-sm font-semibold tracking-wide"
                style={{ color: 'var(--foreground)', fontFamily: FONT }}
              >
                AI Companion
              </h3>
              <button
                onClick={() => setShowModes(!showModes)}
                className="text-xs flex items-center gap-1 hover:underline"
                style={{ color: GOLD_DARK, fontFamily: FONT, fontWeight: 600 }}
              >
                {currentMode.icon} {currentMode.label} Mode
                <ChevronDown size={10} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isElite && (
              <div
                className="px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  fontFamily: FONT,
                  backgroundColor: remainingResponses <= 1 ? 'rgba(220, 50, 50, 0.1)' : 'rgba(201,168,76,0.1)',
                  color: remainingResponses <= 1 ? '#DC3232' : GOLD_DARK,
                }}
              >
                {remainingResponses > 0 ? `${remainingResponses} left` : 'Limit reached'}
              </div>
            )}
            {isElite && (
              <div
                className="px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                style={{ backgroundColor: 'rgba(201,168,76,0.1)', color: GOLD_DARK, fontFamily: FONT }}
              >
                <Crown size={10} /> Unlimited
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-accent transition-colors"
              style={{ color: 'var(--muted-foreground)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Mode selector ── */}
        {showModes && (
          <motion.div
            className="px-3 py-2 space-y-1"
            style={{ borderBottom: '1px solid var(--border)' }}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {AI_MODES.map(m => {
              const isRestricted = !isElite && !FREE_MODES.includes(m.id);
              return (
                <button
                  key={m.id}
                  onClick={() => handleModeSelect(m.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors relative"
                  style={{
                    backgroundColor: mode === m.id ? 'rgba(201,168,76,0.08)' : 'transparent',
                    color: mode === m.id ? GOLD_DARK : 'var(--foreground)',
                    opacity: isRestricted ? 0.7 : 1,
                  }}
                >
                  <span className="text-lg">{m.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium" style={{ fontFamily: FONT }}>{m.label}</p>
                      {isRestricted && (
                        <span
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                          style={{ backgroundColor: 'rgba(201,168,76,0.15)', color: GOLD_DARK }}
                        >
                          <Lock size={8} /> ELITE
                        </span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>{m.description}</p>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* ── Quick Chat Action Bar (visible when messages exist) ── */}
        <AnimatePresence>
          {hasMessages && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ borderBottom: '1px solid var(--border)', overflow: 'hidden' }}
            >
              <div className="px-3 py-2">
                {/* Title row */}
                <div className="flex items-center gap-2 mb-2">
                  {editingTitle ? (
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={entryTitle}
                      onChange={e => setEntryTitle(e.target.value)}
                      onBlur={() => setEditingTitle(false)}
                      onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false); }}
                      placeholder={defaultTitle}
                      className="flex-1 text-xs px-2 py-1 rounded-md focus:outline-none"
                      style={{
                        border: `1px solid ${GOLD}`,
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                        fontFamily: FONT,
                      }}
                    />
                  ) : (
                    <button
                      onClick={() => setEditingTitle(true)}
                      className="flex-1 text-left text-xs px-2 py-1 rounded-md transition-colors hover:bg-accent truncate"
                      style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
                    >
                      {entryTitle || defaultTitle}
                    </button>
                  )}
                  {savedEntryId && (
                    <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a', fontFamily: FONT }}>
                      <Check size={9} /> Saved
                    </span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-1.5">
                  {/* Save */}
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    title="Save as journal entry"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{
                      fontFamily: FONT,
                      backgroundColor: 'rgba(201,168,76,0.12)',
                      color: GOLD_DARK,
                      border: `1px solid rgba(201,168,76,0.25)`,
                    }}
                  >
                    {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    Save
                  </button>

                  {/* Export */}
                  <button
                    onClick={handleExport}
                    title="Export as text file"
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                    style={{
                      fontFamily: FONT,
                      backgroundColor: 'var(--muted)',
                      color: 'var(--foreground)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <Download size={12} />
                    Export
                  </button>

                  {/* Burn */}
                  <button
                    onClick={() => setShowBurnConfirm(true)}
                    title="Burn this chat"
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-[1.02]"
                    style={{
                      fontFamily: FONT,
                      backgroundColor: 'rgba(239,68,68,0.08)',
                      color: '#ef4444',
                      border: '1px solid rgba(239,68,68,0.2)',
                    }}
                  >
                    <Flame size={12} />
                    Burn
                  </button>
                </div>
              </div>

              {/* Burn confirmation */}
              <AnimatePresence>
                {showBurnConfirm && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="mx-3 mb-2 px-3 py-2 rounded-lg"
                    style={{ backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <p className="text-xs mb-2" style={{ color: 'var(--foreground)', fontFamily: FONT }}>
                      This cannot be undone. Permanently delete this conversation?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleBurn}
                        className="flex-1 py-1 rounded-md text-xs font-semibold transition-colors"
                        style={{ backgroundColor: '#ef4444', color: '#fff', fontFamily: FONT }}
                      >
                        Yes, burn it
                      </button>
                      <button
                        onClick={() => setShowBurnConfirm(false)}
                        className="flex-1 py-1 rounded-md text-xs transition-colors"
                        style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)', fontFamily: FONT }}
                      >
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Messages ── */}
        <div className="flex-1 overflow-y-auto diary-scrollbar px-4 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(201,168,76,0.06)' }}
              >
                <Sparkles size={24} style={{ color: GOLD }} />
              </div>
              <h4
                className="text-lg mb-2 font-semibold"
                style={{ fontFamily: FONT, color: 'var(--foreground)' }}
              >
                Your AI Companion
              </h4>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
              >
                I can reflect on your entries, offer insights, or just be a friend. Try asking me anything about your journal.
              </p>
              {entryContext && (
                <p
                  className="text-xs mt-4 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontFamily: FONT }}
                >
                  I have context from your current entry
                </p>
              )}
              {!isElite && (
                <p
                  className="text-xs mt-3"
                  style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
                >
                  {remainingResponses} of {FREE_DAILY_LIMIT} free responses remaining today
                </p>
              )}
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'user' ? {
                    background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`,
                    color: '#FFF9F0',
                    borderBottomRightRadius: '4px',
                    fontFamily: FONT,
                  } : {
                    background: 'var(--muted)',
                    color: 'var(--foreground)',
                    borderBottomLeftRadius: '4px',
                    fontFamily: FONT,
                  }}
                >
                  {msg.role === 'assistant' ? (
                    <Streamdown>{msg.content}</Streamdown>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl" style={{ background: 'var(--muted)' }}>
                <div className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" style={{ color: GOLD }} />
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ── Input ── */}
        <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          {!isElite && dailyUsage >= FREE_DAILY_LIMIT ? (
            <button
              onClick={() => setPaywallFeature('ai_limit')}
              className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
              style={{
                fontFamily: FONT,
                backgroundColor: 'rgba(201,168,76,0.1)',
                color: GOLD_DARK,
                border: '1px solid rgba(201,168,76,0.3)',
              }}
            >
              <Crown size={14} />
              Upgrade for Unlimited Responses
            </button>
          ) : (
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your companion..."
                rows={1}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm resize-none focus:outline-none transition-shadow"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                  fontFamily: FONT,
                  maxHeight: '120px',
                }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="p-2.5 rounded-xl transition-all disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: '#FFF9F0' }}
              >
                <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Paywall Modal */}
      <PaywallModal
        isOpen={!!paywallFeature}
        onClose={() => setPaywallFeature(null)}
        feature={paywallFeature || 'general'}
      />
    </>
  );
}
