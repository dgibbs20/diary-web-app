/**
 * Dashboard — Main app shell
 * Layout: Header (56px, global) + Sidebar Rail + Canvas + AI Drawer + Compact Footer (36px)
 * Premium branding throughout
 */
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import JournalList from '@/components/JournalList';
import JournalEditor from '@/components/JournalEditor';
import AiCompanion from '@/components/AiCompanion';
import SettingsPanel from '@/components/SettingsPanel';
import MoodPicker from '@/components/MoodPicker';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import { journalApi, moodApi, subscriptionApi } from '@/lib/api';
import { toast } from 'sonner';

export interface JournalEntry {
  id: number;
  title: string;
  content: string;
  preview: string;
  word_count: number;
  mood: string | null;
  emotions: Record<string, number>;
  sentiment_score: number | null;
  ai_mode: string;
  ai_response: string | null;
  input_method: string;
  page_style: string;
  burn_mode: boolean;
  ghost_mode: boolean;
  burn_date?: string;
  has_audio: boolean;
  has_images: boolean;
  has_handwriting: boolean;
  created_at: string;
  updated_at: string;
}

export type ViewMode = 'list' | 'editor' | 'settings' | 'analytics';

const FONT = "'Cormorant Garamond', Georgia, serif";
const MARKETING = 'https://diary.gmxquantum.com';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading, isElite, refreshUser } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [pendingMoodForEntry, setPendingMoodForEntry] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    try {
      const res = await journalApi.getEntries();
      if (res.success) {
        setEntries(res.entries || []);
      }
    } catch {
      toast.error('Failed to load entries');
    }
    setIsLoadingEntries(false);
  }, []);

  // Fetch today's mood
  const fetchTodayMood = useCallback(async () => {
    try {
      const res = await moodApi.getTodayMood();
      if (res.success && res.mood_entry) {
        setTodayMood(res.mood_entry.mood);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
      fetchTodayMood();
    }
  }, [isAuthenticated, fetchEntries, fetchTodayMood]);

  // Sync subscription status ONLY after user attempted an upgrade
  useEffect(() => {
    const handleWindowFocus = async () => {
      if (!isAuthenticated) return;

      const pendingUpgrade = sessionStorage.getItem('pending_upgrade');
      if (!pendingUpgrade) return;

      try {
        const result = await subscriptionApi.verify();
        if (result.success && result.subscription) {
          if (result.subscription.is_elite && !isElite) {
            await refreshUser();
            toast.success('🎉 Welcome to diAry Elite! All features unlocked.', {
              duration: 5000,
            });
          }
        }
      } catch (error) {
        console.error('[Subscription] Sync failed on window focus:', error);
      } finally {
        sessionStorage.removeItem('pending_upgrade');
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isAuthenticated, isElite, refreshUser]);

  // Create new entry (mood-first flow)
  const handleNewEntry = () => {
    if (!todayMood) {
      setShowMoodPicker(true);
    } else {
      createNewEntry(todayMood);
    }
  };

  const handleMoodSelected = async (mood: string) => {
    setShowMoodPicker(false);
    setTodayMood(mood);
    try {
      await moodApi.saveMood(mood);
    } catch { /* silent */ }
    createNewEntry(mood);
  };

  const createNewEntry = (mood: string) => {
    setPendingMoodForEntry(mood);
    setSelectedEntry(null);
    setViewMode('editor');
  };

  const handleEntrySelect = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setViewMode('editor');
  };

  const handleEntrySaved = (entry: JournalEntry) => {
    setEntries(prev => {
      const idx = prev.findIndex(e => e.id === entry.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = entry;
        return updated;
      }
      return [entry, ...prev];
    });
    setSelectedEntry(entry);
    setPendingMoodForEntry(null);
  };

  const handleEntryDeleted = (id: number) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setSelectedEntry(null);
    setViewMode('list');
  };

  const handleBackToList = () => {
    setSelectedEntry(null);
    setViewMode('list');
    setPendingMoodForEntry(null);
  };

  // Filter entries
  const filteredEntries = entries.filter(entry => {
    const matchesSearch = !searchQuery ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.preview?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || entry.input_method === filterType;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ backgroundColor: 'var(--background)', minHeight: 'calc(100vh - 56px)', paddingTop: '56px' }}
      >
        <div className="text-center">
          <img src="/assets/images/logo.png" alt="diAry" className="h-16 w-auto mx-auto mb-4 animate-pulse" />
          <p
            className="text-sm tracking-widest uppercase"
            style={{ color: 'var(--muted-foreground)', fontFamily: FONT, letterSpacing: '0.15em' }}
          >
            Loading your space...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="flex flex-col"
        style={{ marginTop: '56px', height: 'calc(100vh - 56px)' }}
      >
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Rail */}
          <Sidebar
            viewMode={viewMode}
            onViewChange={setViewMode}
            onNewEntry={handleNewEntry}
            onToggleAi={() => setShowAiPanel(!showAiPanel)}
            showAiPanel={showAiPanel}
          />

          {/* Main Canvas */}
          <main className="flex-1 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              {viewMode === 'list' && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-hidden"
                >
                  <JournalList
                    entries={filteredEntries}
                    isLoading={isLoadingEntries}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filterType={filterType}
                    onFilterChange={setFilterType}
                    onEntrySelect={handleEntrySelect}
                    onNewEntry={handleNewEntry}
                    user={user}
                    todayMood={todayMood}
                    onMoodClick={() => setShowMoodPicker(true)}
                    ghostModeEnabled={user?.preferences?.privacy_mode ?? false}
                  />
                </motion.div>
              )}

              {viewMode === 'editor' && (
                <motion.div
                  key="editor"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-hidden"
                >
                  <JournalEditor
                    entry={selectedEntry}
                    pendingMood={pendingMoodForEntry}
                    onSave={handleEntrySaved}
                    onDelete={handleEntryDeleted}
                    onBack={handleBackToList}
                    onToggleAi={() => setShowAiPanel(!showAiPanel)}
                  />
                </motion.div>
              )}

              {viewMode === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-hidden"
                >
                  <SettingsPanel />
                </motion.div>
              )}

              {viewMode === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-hidden"
                >
                  <AnalyticsPanel />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* AI Companion Drawer */}
          <AnimatePresence>
            {showAiPanel && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 380, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="h-full overflow-hidden"
                style={{ borderLeft: '1px solid var(--border)' }}
              >
                <AiCompanion
                  entryContext={selectedEntry?.content}
                  userName={user?.fullname || user?.username}
                  onClose={() => setShowAiPanel(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Compact Dashboard Footer — always visible */}
        <DashboardFooter />
      </div>

      {/* Mood Picker Modal */}
      <AnimatePresence>
        {showMoodPicker && (
          <MoodPicker
            onSelect={handleMoodSelected}
            onClose={() => setShowMoodPicker(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Compact Dashboard Footer ─── */
function DashboardFooter() {
  const { isElite } = useAuth();

  const FOOTER_LINKS = [
    { label: 'Features', href: `${MARKETING}/#features` },
    { label: 'How It Works', href: `${MARKETING}/#how-it-works` },
    { label: 'Screenshots', href: `${MARKETING}/#screenshots` },
    { label: 'Videos', href: `${MARKETING}/#videos` },
    { label: 'Pricing', href: `${MARKETING}/#pricing` },
    { label: 'FAQ', href: `${MARKETING}/faq.html` },
    { label: 'Privacy', href: `${MARKETING}/#privacy` },
    { label: 'Contact', href: `${MARKETING}/#contact` },
  ];

  return (
    <footer
      className="flex-shrink-0"
      style={{
        background: '#2C1A0E',
        padding: '8px 3%',
        fontFamily: FONT,
        borderTop: '1px solid rgba(201,168,76,0.15)',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Logo + tagline */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img
            src={isElite ? '/assets/images/logo_elite.png' : '/assets/images/logo.png'}
            alt="diAry"
            style={{ height: '20px', filter: 'brightness(0.85)' }}
          />
          <span
            className="hidden md:inline"
            style={{ fontSize: '0.7rem', fontStyle: 'italic', color: 'rgba(245,240,232,0.35)', whiteSpace: 'nowrap' }}
          >
            "I'll never tell..."
          </span>
        </div>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          {FOOTER_LINKS.map(link => (
            
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.58rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,232,0.35)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#C9A84C'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,240,232,0.35)'; }}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p
          className="flex-shrink-0"
          style={{ fontSize: '0.58rem', color: 'rgba(245,240,232,0.25)', whiteSpace: 'nowrap' }}
        >
          &copy; 2026 GMX Quantum LLC. A GMCG Holdings Inc. company.
        </p>
      </div>
    </footer>
  );
}
