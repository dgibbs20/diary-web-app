/**
 * Dashboard — Main app shell
 * Layout: Header (56px, global) + Sidebar Rail + Canvas + AI Drawer + Compact Footer (36px)
 * Premium branding throughout
 */
import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getLogoSrc } from '@/utils/logoHelper';
import Sidebar from '@/components/Sidebar';
import JournalList from '@/components/JournalList';
import JournalEditor from '@/components/JournalEditor';
import AiCompanion from '@/components/AiCompanion';
import SettingsPanel from '@/components/SettingsPanel';
import MoodPicker from '@/components/MoodPicker';
import LoginOnboardingFlow from '@/components/LoginOnboardingFlow';
import AnalyticsPanel from '@/components/AnalyticsPanel';
import UploadJournalEntry from '@/components/UploadJournalEntry';
import { journalApi, moodApi, subscriptionApi, userApi } from '@/lib/api';
import { analyzeRegisterProfile } from '@/utils/registerProfileService';
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

export type ViewMode = 'list' | 'editor' | 'upload' | 'settings' | 'analytics';

const FONT = "'Cormorant Garamond', Georgia, serif";
const MARKETING = 'https://diary.gmxquantum.com';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading, isElite, refreshUser } = useAuth();
  const { t } = useTranslation();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [currentEditorContent, setCurrentEditorContent] = useState<string>('');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [moodPickerForEntry, setMoodPickerForEntry] = useState(false); // true = creating entry, false = just changing mood
  const [todayMood, setTodayMood] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [pendingMoodForEntry, setPendingMoodForEntry] = useState<string | null>(null);
  // Login onboarding flow — fires once per session when no mood set today
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingShown, setOnboardingShown] = useState(false);

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
        const fetched: JournalEntry[] = res.entries || [];
        setEntries(fetched);
        if (fetched.length >= 3) {
          const texts = fetched.map((e: JournalEntry) => e.content || '').filter(Boolean);
          const profile = analyzeRegisterProfile(texts);
          if (profile && profile !== user?.preferences?.register_profile) {
            userApi.updatePreferences({ register_profile: profile }).catch(() => {});
          }
        }
      }
    } catch {
      toast.error('Failed to load entries');
    }
    setIsLoadingEntries(false);
  }, []);

  // Fetch today's mood — if none set, trigger onboarding flow once per day
  const fetchTodayMood = useCallback(async () => {
    try {
      const res = await moodApi.getTodayMood();
      if (res.success && res.mood_entry) {
        // Mood already set today — use it, no prompt needed
        setTodayMood(res.mood_entry.mood);
      } else {
        // No mood logged today — show onboarding once per calendar day
        const today = new Date().toISOString().split('T')[0];
        const lastShown = sessionStorage.getItem('diary_mood_prompt_date');
        if (lastShown !== today) {
          setShowOnboarding(true);
          sessionStorage.setItem('diary_mood_prompt_date', today);
        }
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEntries();
      fetchTodayMood();
    }
  }, [isAuthenticated, fetchEntries, fetchTodayMood]);
  // Clear live editor content when switching entries
  useEffect(() => {
    setCurrentEditorContent('');
  }, [selectedEntry?.id]);

  // Auto-refresh when burn-mode entries exist — removes them from the list when they expire
  useEffect(() => {
    const hasBurning = entries.some(e => e.burn_mode && e.burn_date);
    if (!hasBurning) return;
    const interval = setInterval(fetchEntries, 30_000);
    return () => clearInterval(interval);
  }, [entries, fetchEntries]);


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

  // Onboarding flow handlers
  const handleOnboardingJournal = (mood: string) => {
    setShowOnboarding(false);
    setOnboardingShown(true);
    if (mood) setTodayMood(mood);
    createNewEntry(mood || todayMood || '');
  };

  const handleOnboardingChat = (mood: string) => {
    setShowOnboarding(false);
    setOnboardingShown(true);
    if (mood) setTodayMood(mood);
    setShowAiPanel(true);
  };

  const handleOnboardingDismiss = () => {
    setShowOnboarding(false);
    setOnboardingShown(true);
  };

  // Create new entry (mood-first flow)
  const handleNewEntry = () => {
    if (!todayMood) {
      // Only show picker if not already shown today
      const today = new Date().toISOString().split('T')[0];
      const lastShown = sessionStorage.getItem('diary_mood_prompt_date');
      if (lastShown !== today) {
        sessionStorage.setItem('diary_mood_prompt_date', today);
        setMoodPickerForEntry(true);
        setShowMoodPicker(true);
      } else {
        // Already prompted today, user can proceed without mood
        createNewEntry('');
      }
    } else {
      createNewEntry(todayMood);
    }
  };

  const handleUploadEntry = () => {
    setSelectedEntry(null);
    // Pass today's mood to upload view
    setPendingMoodForEntry(todayMood);
    setViewMode('upload');
  };

  const handleMoodSelected = async (mood: string) => {
    setShowMoodPicker(false);
    const wasForEntry = moodPickerForEntry;
    setMoodPickerForEntry(false);
    setTodayMood(mood);
    const today = new Date().toISOString().split('T')[0];
    sessionStorage.setItem('diary_mood_prompt_date', today);
    try {
      await moodApi.saveMood(mood);
    } catch { /* silent */ }
    // Only navigate to new entry if picker was opened for that purpose
    if (wasForEntry) createNewEntry(mood);
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
            style={{ color: 'var(--muted-foreground)', letterSpacing: '0.15em' }}
          >
            {t('dashboard_loadingSpace')}
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
            onUploadEntry={handleUploadEntry}
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
                    onMoodClick={() => { setMoodPickerForEntry(false); setShowMoodPicker(true); }}
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
                    onToggleAi={(content?: string) => {
                      if (content) setCurrentEditorContent(content);
                      setShowAiPanel(prev => !prev);
                    }}
                  />
                </motion.div>
              )}

              {viewMode === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 overflow-hidden"
                >
                  <UploadJournalEntry
                    onSave={handleEntrySaved}
                    onDelete={handleEntryDeleted}
                    onBack={handleBackToList}
                    onToggleAi={(content?: string) => {
                      if (content) setCurrentEditorContent(content);
                      setShowAiPanel(prev => !prev);
                    }}
                    pendingMood={pendingMoodForEntry}
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
                  entryContext={currentEditorContent || selectedEntry?.content || ''}
                  userName={user?.fullname || user?.username}
                  entryId={selectedEntry?.id ?? null}
                  onClose={() => setShowAiPanel(false)}
                  onQuickChatSaved={fetchEntries}
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

      {/* Login Onboarding Flow — mood check-in + journal/chat intent */}
      <AnimatePresence>
        {showOnboarding && !showMoodPicker && (
          <LoginOnboardingFlow
            onJournal={handleOnboardingJournal}
            onChat={handleOnboardingChat}
            onDismiss={handleOnboardingDismiss}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Compact Dashboard Footer ─── */
function DashboardFooter() {
  const { isElite } = useAuth();
  const { t, i18n } = useTranslation();

  const FOOTER_LINKS = [
    { key: 'footer_features', href: `${MARKETING}/#features` },
    { key: 'footer_howItWorks', href: `${MARKETING}/#how-it-works` },
    { key: 'footer_screenshots', href: `${MARKETING}/#screenshots` },
    { key: 'footer_videos', href: `${MARKETING}/#videos` },
    { key: 'footer_pricing', href: `${MARKETING}/#pricing` },
    { key: 'header_download', href: `${MARKETING}/#download` },
    { key: 'footer_faq', href: `${MARKETING}/faq.html` },
    { key: 'footer_privacy', href: `${MARKETING}/#privacy` },
    { key: 'footer_contact', href: `${MARKETING}/#contact` },
  ];

  return (
    <footer
      className="flex-shrink-0"
      style={{
        background: '#2C1A0E',
        padding: '8px 3%',
        borderTop: '1px solid rgba(201,168,76,0.15)',
      }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Logo + tagline */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <img
            src={getLogoSrc(i18n.language, isElite)}
            alt="diAry"
            style={{ height: '29px', filter: 'brightness(0.85)' }}
          />
          <span
            className="hidden md:inline"
            style={{ fontFamily: FONT, fontSize: '0.7rem', fontStyle: 'italic', color: 'rgba(245,240,232,0.35)', whiteSpace: 'nowrap' }}
          >
            {t('footer_tagline')}
          </span>
        </div>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          {FOOTER_LINKS.map(link => (
            <a
              key={link.key}
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
              {t(link.key)}
            </a>
          ))}
        </div>

        {/* Copyright */}
        <p
          className="flex-shrink-0"
          style={{ fontSize: '0.58rem', color: 'rgba(245,240,232,0.25)', whiteSpace: 'nowrap' }}
        >
          {t('footer_copyright')}
        </p>
      </div>
    </footer>
  );
}
