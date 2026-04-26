/**
 * AI Companion — Right drawer panel with chat interface
 * Supports all modes: auto, vault, friend, mirror, insight
 * Sends chat history to backend for context continuity
 */
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Loader2, Bot, Sparkles } from 'lucide-react';
import { aiApi } from '@/lib/api';
import { AI_MODES } from '@/lib/constants';
import { Streamdown } from 'streamdown';
import { toast } from 'sonner';

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

export default function AiCompanion({ entryContext, userName, onClose }: AiCompanionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('auto');
  const [isLoading, setIsLoading] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Build history from existing messages for backend context
    const history = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

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
      } else {
        const errorMsg = res.error?.message || 'AI companion is unavailable right now.';
        toast.error(errorMsg);
        // Still show a message in chat so user knows what happened
        const aiMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `*${errorMsg}*`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMsg]);
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

  const currentMode = AI_MODES.find(m => m.id === mode) || AI_MODES[0];

  return (
    <div className="h-full flex flex-col bg-card" style={{ width: 380 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(168, 134, 58, 0.1)' }}>
            <Bot size={16} style={{ color: '#A8863A' }} />
          </div>
          <div>
            <h3 className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>AI Companion</h3>
            <button
              onClick={() => setShowModes(!showModes)}
              className="text-xs flex items-center gap-1 hover:underline"
              style={{ color: '#A8863A' }}
            >
              {currentMode.icon} {currentMode.label} Mode
            </button>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors" style={{ color: 'var(--muted-foreground)' }}>
          <X size={16} />
        </button>
      </div>

      {/* Mode selector */}
      {showModes && (
        <motion.div
          className="px-3 py-2 border-b space-y-1"
          style={{ borderColor: 'var(--border)' }}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
        >
          {AI_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => { setMode(m.id); setShowModes(false); }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
              style={{
                backgroundColor: mode === m.id ? 'var(--accent)' : 'transparent',
                color: mode === m.id ? '#A8863A' : 'var(--foreground)',
              }}
            >
              <span className="text-lg">{m.icon}</span>
              <div>
                <p className="text-sm font-medium">{m.label}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{m.description}</p>
              </div>
            </button>
          ))}
        </motion.div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto diary-scrollbar px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(168, 134, 58, 0.08)' }}>
              <Sparkles size={24} style={{ color: '#A8863A' }} />
            </div>
            <h4 className="font-serif text-lg mb-2" style={{ color: 'var(--foreground)' }}>Your AI Companion</h4>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              I can reflect on your entries, offer insights, or just be a friend. Try asking me anything about your journal.
            </p>
            {entryContext && (
              <p className="text-xs mt-4 px-3 py-2 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                I have context from your current entry
              </p>
            )}
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                style={msg.role === 'user' ? {
                  background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
                  color: '#F5F0E8',
                  borderBottomRightRadius: '4px',
                } : {
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  borderBottomLeftRadius: '4px',
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
                <Loader2 size={14} className="animate-spin" style={{ color: '#A8863A' }} />
                <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your companion..."
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-xl border text-sm bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)', maxHeight: '120px' }}
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
            style={{ background: 'linear-gradient(135deg, #A8863A, #C9A84C)', color: '#F5F0E8' }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
