/**
 * Journal List — Premium branded entry list
 * Consistent Cormorant Garamond typography, gold accents, refined card design
 */
import { motion } from 'framer-motion';
import { Search, Plus, Flame, Ghost, BookOpen, Sparkles } from 'lucide-react';
import type { JournalEntry } from '@/pages/Dashboard';
import type { User } from '@/contexts/AuthContext';
import { MOOD_CONFIG } from '@/lib/constants';
import BurnCountdown from './BurnCountdown';

interface JournalListProps {
  entries: JournalEntry[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterType: string;
  onFilterChange: (f: string) => void;
  onEntrySelect: (entry: JournalEntry) => void;
  onNewEntry: () => void;
  user: User | null;
  todayMood: string | null;
  onMoodClick: () => void;
  ghostModeEnabled?: boolean;
}

const FONT = "'Cormorant Garamond', Georgia, serif";

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'long' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined });
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function JournalList({
  entries, isLoading, searchQuery, onSearchChange,
  filterType, onFilterChange, onEntrySelect, onNewEntry,
  user, todayMood, onMoodClick, ghostModeEnabled,
}: JournalListProps) {
  const stats = user?.stats;

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header area */}
      <header
        className="px-6 lg:px-8 py-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-3xl mx-auto">
          {/* Greeting + Mood */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className="text-2xl font-light"
                style={{ fontFamily: FONT, color: 'var(--foreground)' }}
              >
                {getGreeting()},{' '}
                <span style={{ color: '#C9A84C', fontWeight: 500 }}>
                  {user?.first_name || 'there'}
                </span>
              </h1>
              <p
                className="text-sm mt-1 tracking-wide"
                style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
              >
                {stats?.current_streak
                  ? `${stats.current_streak} day streak`
                  : 'Start your journey today'}
                {stats?.total_entries ? ` · ${stats.total_entries} entries` : ''}
              </p>
            </div>

            {/* Today's mood */}
            <button
              onClick={onMoodClick}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all hover:bg-accent"
              title="Today's mood"
            >
              {todayMood ? (
                <>
                  <img src={MOOD_CONFIG[todayMood]?.icon} alt={todayMood} className="w-7 h-7" />
                  <span
                    className="text-xs font-semibold capitalize hidden sm:inline tracking-wide"
                    style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
                  >
                    {todayMood}
                  </span>
                </>
              ) : (
                <span
                  className="text-xs font-semibold px-4 py-1.5 rounded-full tracking-wider uppercase"
                  style={{
                    background: 'linear-gradient(135deg, rgba(168,134,58,0.12), rgba(201,168,76,0.08))',
                    color: '#C9A84C',
                    fontFamily: FONT,
                    border: '1px solid rgba(201,168,76,0.15)',
                  }}
                >
                  How are you?
                </span>
              )}
            </button>
          </div>

          {/* Search + Filter */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search entries..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm focus:outline-none transition-all"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--foreground)',
                  backgroundColor: 'var(--card)',
                  fontFamily: FONT,
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => onFilterChange(e.target.value)}
              className="px-3 py-2.5 rounded-lg border text-sm focus:outline-none"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--foreground)',
                backgroundColor: 'var(--card)',
                fontFamily: FONT,
                fontSize: '0.9rem',
              }}
            >
              <option value="all">All Entries</option>
              <option value="text">Text</option>
              <option value="voice">Voice</option>
            </select>
          </div>
        </div>
      </header>

      {/* Entry List */}
      <div className="flex-1 overflow-y-auto diary-scrollbar px-6 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-lg animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
              ))}
            </div>
          ) : entries.length === 0 ? (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img
                src="/assets/images/logo.png"
                alt=""
                className="w-32 mx-auto mb-6"
                style={{ opacity: 0.5, filter: 'grayscale(20%)' }}
              />
              <h3
                className="text-xl mb-2 font-light"
                style={{ fontFamily: FONT, color: 'var(--foreground)' }}
              >
                {searchQuery ? 'No entries found' : 'Your story begins here'}
              </h3>
              <p
                className="text-sm mb-8"
                style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
              >
                {searchQuery ? 'Try a different search term' : 'Every great story starts with a single word'}
              </p>
              {!searchQuery && (
                <button
                  onClick={onNewEntry}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
                    color: '#F5F0E8',
                    fontFamily: FONT,
                    letterSpacing: '0.12em',
                    boxShadow: '0 4px 16px rgba(168,134,58,0.25)',
                  }}
                >
                  <Plus size={16} /> Write Your First Entry
                </button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-2">
              {entries.map((entry, idx) => (
                <motion.button
                  key={entry.id}
                  onClick={() => onEntrySelect(entry)}
                  className="w-full text-left p-4 rounded-lg border transition-all duration-200 group"
                  style={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{
                    y: -2,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Mood indicator */}
                    <div className="flex-shrink-0 mt-0.5">
                      {entry.mood && MOOD_CONFIG[entry.mood] ? (
                        <img src={MOOD_CONFIG[entry.mood].icon} alt={entry.mood} className="w-6 h-6" />
                      ) : (
                        <BookOpen size={18} style={{ color: 'var(--muted-foreground)' }} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className="text-base font-medium truncate"
                          style={{ fontFamily: FONT, color: 'var(--foreground)' }}
                        >
                          {entry.title || 'Untitled Entry'}
                        </h3>
                        {entry.burn_mode && (
                          entry.burn_date ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full shrink-0"
                              style={{
                                background: 'rgba(232,93,74,0.10)',
                                border: '1px solid rgba(232,93,74,0.28)',
                                color: '#E85D4A',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                letterSpacing: '0.04em',
                              }}
                              title={`Burns on ${new Date(entry.burn_date).toLocaleString()}`}
                            >
                              <Flame size={11} aria-hidden />
                              <BurnCountdown
                                target={new Date(entry.burn_date)}
                                compact
                              />
                            </span>
                          ) : (
                            // Legacy entries with burn_mode but no burn_date —
                            // fall back to the bare flame icon.
                            <Flame
                              size={14}
                              style={{ color: '#E85D4A' }}
                              aria-label="Burn Mode"
                            />
                          )
                        )}
                        {entry.ghost_mode && <Ghost size={14} style={{ color: 'var(--muted-foreground)' }} />}
                      </div>
                      {ghostModeEnabled ? (
                        <p
                          className="text-sm truncate mb-1.5 flex items-center gap-1.5"
                          style={{ color: 'var(--muted-foreground)', fontFamily: FONT, fontStyle: 'italic' }}
                        >
                          <Ghost size={12} style={{ opacity: 0.5 }} />
                          Content hidden — Ghost Mode active
                        </p>
                      ) : (
                        <p
                          className="text-sm truncate mb-1.5"
                          style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
                        >
                          {entry.preview || 'No content'}
                        </p>
                      )}
                      <div
                        className="flex items-center gap-3 text-xs tracking-wide"
                        style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
                      >
                        <span>{formatDate(entry.created_at)}</span>
                        <span style={{ opacity: 0.4 }}>·</span>
                        {!ghostModeEnabled && <span>{entry.word_count} words</span>}
                        {entry.ai_response && (
                          <>
                            <span style={{ opacity: 0.4 }}>·</span>
                            <span className="flex items-center gap-1" style={{ color: '#C9A84C' }}>
                              <Sparkles size={11} /> AI insight
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating New Entry Button (mobile) */}
      <div className="lg:hidden fixed bottom-6 right-6 z-30">
        <button
          onClick={onNewEntry}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
            color: '#F5F0E8',
            boxShadow: '0 4px 20px rgba(168,134,58,0.3)',
          }}
        >
          <Plus size={24} />
        </button>
      </div>
    </div>
  );
}
