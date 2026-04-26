/**
 * Settings Panel — Premium branded: Profile, preferences, password, export, dark mode
 * Consistent Cormorant Garamond typography, gold accents throughout
 * 
 * PAYWALL GATING:
 * - Ghost Mode: Elite-only, free users see PaywallModal
 * - Export PDF: Elite-only, free users see PaywallModal
 */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, Download, Moon, Sun, Crown, Eye, EyeOff, Loader2, Check, Smartphone, Ghost, Shield, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { userApi, exportApi } from '@/lib/api';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import PaywallModal from './PaywallModal';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';
const GOLD_DARK = '#A8863A';

type SettingsTab = 'profile' | 'preferences' | 'security' | 'export';

export default function SettingsPanel() {
  const { user, isElite, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as SettingsTab, icon: User, label: 'Profile' },
    { id: 'preferences' as SettingsTab, icon: Moon, label: 'Preferences' },
    { id: 'security' as SettingsTab, icon: Lock, label: 'Security' },
    { id: 'export' as SettingsTab, icon: Download, label: 'Export' },
  ];

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <header className="px-6 lg:px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: FONT, color: 'var(--foreground)', letterSpacing: '0.02em' }}
        >
          Settings
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto diary-scrollbar">
        <div className="max-w-2xl mx-auto px-6 lg:px-8 py-6">
          {/* Tab navigation */}
          <div className="flex gap-1 p-1 rounded-lg mb-8" style={{ background: 'var(--muted)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm transition-all"
                style={{
                  backgroundColor: activeTab === tab.id ? 'var(--card)' : 'transparent',
                  color: activeTab === tab.id ? GOLD_DARK : 'var(--muted-foreground)',
                  boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  fontFamily: FONT,
                  fontWeight: activeTab === tab.id ? 700 : 600,
                  letterSpacing: '0.03em',
                }}
              >
                <tab.icon size={14} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'profile' && <ProfileSection />}
          {activeTab === 'preferences' && <PreferencesSection theme={theme} toggleTheme={toggleTheme} />}
          {activeTab === 'security' && <SecuritySection />}
          {activeTab === 'export' && <ExportSection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  const { user, isElite, refreshUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await userApi.updateProfile({ first_name: firstName, last_name: lastName, username, bio });
      if (res.success) {
        toast.success('Profile updated');
        refreshUser();
      } else {
        toast.error(res.error?.message || 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    }
    setIsSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
    fontFamily: FONT,
    fontSize: '15px',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--muted-foreground)',
    fontFamily: FONT,
    fontWeight: 700,
    letterSpacing: '0.12em',
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Subscription badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold"
          style={{ background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: '#FFF9F0', fontFamily: FONT }}
        >
          {user?.first_name?.[0] || 'U'}
        </div>
        <div className="flex-1">
          <p className="font-semibold" style={{ color: 'var(--foreground)', fontFamily: FONT }}>{user?.fullname}</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>{user?.email}</p>
        </div>
        <span
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold tracking-wider"
          style={{ background: 'rgba(201,168,76,0.12)', color: GOLD, fontFamily: FONT }}
        >
          <Crown size={12} /> {user?.subscription_tier === 'diary_elite' ? 'Elite' : 'Free'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase mb-2" style={labelStyle}>First Name</label>
          <input
            type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm bg-background focus:outline-none transition-shadow"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
        <div>
          <label className="block text-xs uppercase mb-2" style={labelStyle}>Last Name</label>
          <input
            type="text" value={lastName} onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm bg-background focus:outline-none transition-shadow"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase mb-2" style={labelStyle}>Username</label>
        <input
          type="text" value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm bg-background focus:outline-none transition-shadow"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>

      <div>
        <label className="block text-xs uppercase mb-2" style={labelStyle}>Bio</label>
        <textarea
          value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
          className="w-full px-4 py-2.5 rounded-lg text-sm bg-background resize-none focus:outline-none transition-shadow"
          style={inputStyle}
          placeholder="Tell us about yourself..."
          onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>

      <button
        onClick={handleSave} disabled={isSaving}
        className="px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wider transition-all flex items-center gap-2 disabled:opacity-60"
        style={{ background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: '#FFF9F0', fontFamily: FONT }}
      >
        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
        {isSaving ? 'Saving...' : 'Save Changes'}
      </button>

      {/* Manage Subscription */}
      <div
        className="p-4 rounded-xl cursor-pointer transition-all duration-200 group"
        style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}
        onClick={() => {
          // Navigate to subscription page
          window.location.href = '/subscription';
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(201,168,76,0.15)' }}
            >
              <Crown size={18} style={{ color: GOLD }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)', fontFamily: FONT }}>
                {isElite ? 'Manage Subscription' : 'Upgrade to Elite'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>
                {isElite ? 'View your plan details and billing' : 'Unlock unlimited AI, export, ghost mode & more'}
              </p>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: GOLD }} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        {[
          { value: user?.stats?.total_entries || 0, label: 'Entries' },
          { value: user?.stats?.current_streak || 0, label: 'Day Streak' },
          { value: user?.stats?.total_words || 0, label: 'Words' },
        ].map(s => (
          <div key={s.label} className="text-center p-3 rounded-lg" style={{ background: 'var(--muted)' }}>
            <p className="text-xl font-semibold" style={{ color: GOLD, fontFamily: FONT }}>{s.value}</p>
            <p className="text-xs tracking-wider uppercase" style={{ color: 'var(--muted-foreground)', fontFamily: FONT, fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function PreferencesSection({ theme, toggleTheme }: { theme: string; toggleTheme?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Theme toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
        <div className="flex items-center gap-3">
          {theme === 'dark' ? <Moon size={18} style={{ color: GOLD }} /> : <Sun size={18} style={{ color: GOLD }} />}
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)', fontFamily: FONT }}>Dark Mode</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>Switch between light and dark themes</p>
          </div>
        </div>
        <button
          onClick={() => toggleTheme?.()}
          className="w-12 h-7 rounded-full relative transition-colors duration-300"
          style={{ backgroundColor: theme === 'dark' ? GOLD : 'var(--border)' }}
        >
          <div
            className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
            style={{ transform: theme === 'dark' ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </button>
      </div>

      {/* Mobile-only features */}
      <div className="p-4 rounded-xl" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={16} style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)', fontFamily: FONT }}>Mobile-Only Features</p>
        </div>
        <div className="space-y-2">
          {['Voice Transcription', 'Handwriting Input', 'Biometric Lock', 'Page Flip Sound'].map(f => (
            <div key={f} className="flex items-center justify-between py-1.5">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>{f}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold tracking-wider"
                style={{ background: 'rgba(201,168,76,0.1)', color: GOLD, fontFamily: FONT }}
              >
                Mobile
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SecuritySection() {
  const { user, isElite, refreshUser } = useAuth();
  const [ghostMode, setGhostMode] = useState(user?.preferences?.privacy_mode ?? false);
  const [isTogglingGhost, setIsTogglingGhost] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleGhostToggle = async () => {
    if (!isElite) {
      setShowPaywall(true);
      return;
    }
    setIsTogglingGhost(true);
    try {
      const newVal = !ghostMode;
      const res = await userApi.updatePreferences({ privacy_mode: newVal });
      if (res.success) {
        setGhostMode(newVal);
        toast.success(newVal ? 'Ghost Mode enabled — your activity is now hidden' : 'Ghost Mode disabled');
        refreshUser();
      } else {
        toast.error(res.error?.message || 'Failed to update Ghost Mode');
      }
    } catch {
      toast.error('Failed to update Ghost Mode');
    }
    setIsTogglingGhost(false);
  };

  const handleChangePw = async () => {
    if (!currentPw || !newPw) { toast.error('Please fill in all fields'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    if (newPw.length < 8) { toast.error('Password must be at least 8 characters'); return; }

    setIsSaving(true);
    try {
      const res = await userApi.changePassword(currentPw, newPw);
      if (res.success) {
        toast.success('Password changed successfully');
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
      } else {
        toast.error(res.error?.message || 'Failed to change password');
      }
    } catch {
      toast.error('Failed to change password');
    }
    setIsSaving(false);
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--border)',
    color: 'var(--foreground)',
    fontFamily: FONT,
    fontSize: '15px',
  };

  const labelStyle: React.CSSProperties = {
    color: 'var(--muted-foreground)',
    fontFamily: FONT,
    fontWeight: 700,
    letterSpacing: '0.12em',
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Ghost Mode */}
        <div className="p-5 rounded-xl" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ background: ghostMode ? 'rgba(201,168,76,0.15)' : 'var(--muted)' }}
              >
                <Ghost size={18} style={{ color: ghostMode ? GOLD : 'var(--muted-foreground)' }} />
              </div>
              <div>
                <p className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--foreground)', fontFamily: FONT }}>
                  Ghost Mode
                  {!isElite && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold tracking-wider"
                      style={{ background: 'rgba(201,168,76,0.1)', color: GOLD, fontFamily: FONT }}
                    >
                      <Crown size={10} className="inline mr-1" />Elite
                    </span>
                  )}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>
                  Hide your activity from analytics and streak tracking
                </p>
              </div>
            </div>
            <button
              onClick={handleGhostToggle}
              disabled={isTogglingGhost}
              className="w-12 h-7 rounded-full relative transition-colors duration-300"
              style={{ backgroundColor: ghostMode ? GOLD : 'var(--border)', opacity: isTogglingGhost ? 0.6 : 1 }}
            >
              <div
                className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300"
                style={{ transform: ghostMode ? 'translateX(22px)' : 'translateX(2px)' }}
              />
            </button>
          </div>
          {ghostMode && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(201,168,76,0.06)' }}>
              <Shield size={14} style={{ color: GOLD_DARK }} />
              <p className="text-xs" style={{ color: GOLD_DARK, fontFamily: FONT, fontWeight: 600 }}>
                Ghost Mode is active — your entries are hidden from analytics
              </p>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="p-5 rounded-xl" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: FONT, color: 'var(--foreground)' }}>Change Password</h3>

        <div>
          <label className="block text-xs uppercase mb-2" style={labelStyle}>Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-background pr-10 focus:outline-none transition-shadow"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase mb-2" style={labelStyle}>New Password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'} value={newPw} onChange={(e) => setNewPw(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-background pr-10 focus:outline-none transition-shadow"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase mb-2" style={labelStyle}>Confirm New Password</label>
          <input
            type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm bg-background focus:outline-none transition-shadow"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>

        <button
          onClick={handleChangePw} disabled={isSaving}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wider transition-all flex items-center gap-2 disabled:opacity-60"
          style={{ background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: '#FFF9F0', fontFamily: FONT }}
        >
          {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
          {isSaving ? 'Changing...' : 'Change Password'}
        </button>
        </div>
      </motion.div>

      {/* PaywallModal for Ghost Mode */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="ghost_mode"
      />
    </>
  );
}

function ExportSection() {
  const { isElite } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const handleExport = async () => {
    if (!isElite) {
      setShowPaywall(true);
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
  };

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="p-6 rounded-xl text-center" style={{ border: '1px solid var(--border)' }}>
          <Download size={32} className="mx-auto mb-3" style={{ color: GOLD }} />
          <h3
            className="text-lg mb-2 font-semibold"
            style={{ fontFamily: FONT, color: 'var(--foreground)' }}
          >
            Export Your Journal
          </h3>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
          >
            Download all your entries as a beautifully formatted PDF
          </p>

          {!isElite && (
            <div
              className="flex items-center justify-center gap-2 mb-4 text-xs font-semibold tracking-wider"
              style={{ color: GOLD, fontFamily: FONT }}
            >
              <Crown size={14} />
              <span>Elite Feature</span>
            </div>
          )}

          <button
            onClick={handleExport} disabled={isExporting}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wider transition-all flex items-center gap-2 mx-auto disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: '#FFF9F0', fontFamily: FONT }}
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isExporting ? 'Exporting...' : isElite ? 'Export as PDF' : 'Upgrade to Export'}
          </button>
        </div>
      </motion.div>

      {/* PaywallModal for Export */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="export"
      />
    </>
  );
}
