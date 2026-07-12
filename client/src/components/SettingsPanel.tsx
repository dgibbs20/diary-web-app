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
import { User, Lock, Download, Moon, Sun, Crown, Eye, EyeOff, Loader2, Check, Smartphone, Ghost, Shield, ArrowRight, Globe, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { userApi, exportApi } from '@/lib/api';
import { LANGUAGE_OPTIONS } from '@/i18n';
import { toast } from 'sonner';
import { useLocation } from 'wouter';
import PaywallModal from './PaywallModal';
import ExportDialog from './ExportDialog';
import ChangeEmailSection from './ChangeEmailSection';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';
const GOLD_DARK = '#A8863A';

type SettingsTab = 'profile' | 'preferences' | 'security' | 'export';

export default function SettingsPanel() {
  const { t } = useTranslation();
  const { user, isElite, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  const tabs = [
    { id: 'profile' as SettingsTab, icon: User, key: 'settings_tabProfile' },
    { id: 'preferences' as SettingsTab, icon: Moon, key: 'settings_tabPreferences' },
    { id: 'security' as SettingsTab, icon: Lock, key: 'settings_tabSecurity' },
    { id: 'export' as SettingsTab, icon: Download, key: 'settings_tabExport' },
  ];

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <header className="px-6 lg:px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <h1
          className="text-2xl font-semibold"
          style={{ fontFamily: FONT, color: 'var(--foreground)', letterSpacing: '0.02em' }}
        >
          {t('settings_title')}
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
                <span className="hidden sm:inline">{t(tab.key)}</span>
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
  const { t } = useTranslation();
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
          <Crown size={12} /> {user?.subscription_tier === 'diary_elite' ? 'Elite' : t('settings_profile_free')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs uppercase mb-2" style={labelStyle}>{t('settings_profile_firstName')}</label>
          <input
            type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg text-sm bg-background focus:outline-none transition-shadow"
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
        <div>
          <label className="block text-xs uppercase mb-2" style={labelStyle}>{t('settings_profile_lastName')}</label>
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
        <label className="block text-xs uppercase mb-2" style={labelStyle}>{t('settings_profile_username')}</label>
        <input
          type="text" value={username} onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg text-sm bg-background focus:outline-none transition-shadow"
          style={inputStyle}
          onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        />
      </div>

      <div>
        <label className="block text-xs uppercase mb-2" style={labelStyle}>{t('settings_profile_bio')}</label>
        <textarea
          value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
          className="w-full px-4 py-2.5 rounded-lg text-sm bg-background resize-none focus:outline-none transition-shadow"
          style={inputStyle}
          placeholder={t('settings_profile_bioPlaceholder')}
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
        {isSaving ? t('settings_profile_saving') : t('settings_profile_saveChanges')}
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
                {isElite ? t('settings_profile_manageSubscription') : t('settings_profile_upgradeElite')}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>
                {isElite ? t('settings_profile_manageDesc') : t('settings_profile_upgradeDesc')}
              </p>
            </div>
          </div>
          <ArrowRight size={16} style={{ color: GOLD }} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
        {[
          { value: user?.stats?.total_entries || 0, label: t('settings_profile_entries') },
          { value: user?.stats?.current_streak || 0, label: t('settings_profile_dayStreak') },
          { value: user?.stats?.total_words || 0, label: t('settings_profile_words') },
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
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [companionName, setCompanionName] = useState<string>(
    user?.preferences?.companion_name ?? ''
  );
  const [isSavingName, setIsSavingName] = useState(false);

  const handleSaveCompanionName = async (nameOverride?: string | null) => {
    setIsSavingName(true);
    try {
      const value = nameOverride === undefined
        ? companionName.trim()
        : nameOverride;
      await userApi.updatePreferences({ companion_name: value || null });
      if (value) {
        toast.success(t('settings_companion_nameSaved', { name: value }));
      } else {
        setCompanionName('');
        toast.success(t('settings_companion_nameCleared'));
      }
    } catch {
      toast.error('Failed to save companion name');
    }
    setIsSavingName(false);
  };

  const mobileFeatures = [
    { id: 'voice', key: 'settings_pref_voiceTranscription' },
    { id: 'handwriting', key: 'settings_pref_handwriting' },
    { id: 'biometric', key: 'settings_pref_biometric' },
    { id: 'pageFlip', key: 'settings_pref_pageFlip' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {/* Theme toggle */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
        <div className="flex items-center gap-3">
          {theme === 'dark' ? <Moon size={18} style={{ color: GOLD }} /> : <Sun size={18} style={{ color: GOLD }} />}
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)', fontFamily: FONT }}>{t('settings_pref_darkMode')}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>{t('settings_pref_darkModeDesc')}</p>
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

      {/* Language selector */}
      <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--muted)' }}>
        <div className="flex items-center gap-3">
          <Globe size={18} style={{ color: GOLD }} />
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)', fontFamily: FONT }}>{t('settings_pref_language')}</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>{t('settings_pref_languageDesc')}</p>
          </div>
        </div>
        <select
          value={i18n.language}
          onChange={(e) => {
            const newLang = e.target.value;
            i18n.changeLanguage(newLang);
            localStorage.setItem('diary_language', newLang);
            userApi.updatePreferences({ preferred_language: newLang }).catch(() => {});
          }}
          style={{
            fontFamily: FONT,
            fontSize: '0.85rem',
            background: 'var(--card)',
            color: 'var(--foreground)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          {LANGUAGE_OPTIONS.map(({ code, name }) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </div>

      {/* Companion name */}
      <div className="p-4 rounded-xl space-y-3" style={{ background: 'var(--muted)' }}>
        <div>
          <p style={{ fontFamily: FONT, fontSize: '0.875rem', fontWeight: 600, color: 'var(--foreground)' }}>
            {t('settings_companion_nameTitle')}
          </p>
          <p style={{ fontFamily: FONT, fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: 2 }}>
            {t('settings_companion_nameSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            maxLength={20}
            value={companionName}
            onChange={(e) => setCompanionName(e.target.value)}
            placeholder={t('settings_companion_namePlaceholder')}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCompanionName(); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--card)',
              color: 'var(--foreground)',
              fontFamily: FONT,
              fontSize: '0.875rem',
              outline: 'none',
            }}
            onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 2px rgba(201,168,76,0.2)'; }}
            onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
          />

          {companionName && (
            <button
              onClick={() => handleSaveCompanionName(null)}
              disabled={isSavingName}
              style={{
                padding: '8px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'transparent',
                color: 'var(--muted-foreground)',
                cursor: 'pointer',
              }}
              title="Clear name"
            >
              <X size={14} />
            </button>
          )}

          <button
            onClick={() => handleSaveCompanionName()}
            disabled={isSavingName}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`,
              color: '#FFF9F0',
              fontFamily: FONT,
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: isSavingName ? 'not-allowed' : 'pointer',
              opacity: isSavingName ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              border: 'none',
            }}
          >
            {isSavingName
              ? <Loader2 size={13} className="animate-spin" />
              : <Check size={13} />}
            {t('settings_companion_nameSaveBtn')}
          </button>
        </div>

        <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textAlign: 'right', fontFamily: FONT }}>
          {companionName.length} / 20
        </p>
      </div>

      {/* Mobile-only features */}
      <div className="p-4 rounded-xl" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Smartphone size={16} style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)', fontFamily: FONT }}>{t('settings_pref_mobileOnly')}</p>
        </div>
        <div className="space-y-2">
          {mobileFeatures.map(f => (
            <div key={f.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>{t(f.key)}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold tracking-wider"
                style={{ background: 'rgba(201,168,76,0.1)', color: GOLD, fontFamily: FONT }}
              >
                {t('settings_pref_mobile')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function SecuritySection() {
  const { t } = useTranslation();
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
                  {t('settings_security_ghostMode')}
                  {!isElite && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold tracking-wider"
                      style={{ background: 'rgba(201,168,76,0.1)', color: GOLD, fontFamily: FONT }}
                    >
                      <Crown size={10} className="inline mr-1" />{t('common_elite')}
                    </span>
                  )}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>
                  {t('settings_security_ghostModeDesc')}
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
                {t('settings_security_ghostActive')}
              </p>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="p-5 rounded-xl" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ fontFamily: FONT, color: 'var(--foreground)' }}>{t('settings_security_changePassword')}</h3>

        <div>
          <label className="block text-xs uppercase mb-2" style={labelStyle}>{t('settings_security_currentPw')}</label>
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
          <label className="block text-xs uppercase mb-2" style={labelStyle}>{t('settings_security_newPw')}</label>
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
          <label className="block text-xs uppercase mb-2" style={labelStyle}>{t('settings_security_confirmPw')}</label>
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
          {isSaving ? t('settings_security_changingPw') : t('settings_security_changePwBtn')}
        </button>
        </div>

        {/* Change Email */}
        <ChangeEmailSection />
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
  const { t } = useTranslation();
  const { isElite, user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleExport = () => {
    if (!isElite) {
      setShowPaywall(true);
      return;
    }
    setShowExportDialog(true);
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
            {t('settings_export_title')}
          </h3>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
          >
            {t('settings_export_desc')}
          </p>

          {!isElite && (
            <div
              className="flex items-center justify-center gap-2 mb-4 text-xs font-semibold tracking-wider"
              style={{ color: GOLD, fontFamily: FONT }}
            >
              <Crown size={14} />
              <span>{t('settings_export_eliteFeature')}</span>
            </div>
          )}

          <button
            onClick={handleExport} disabled={isExporting}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wider transition-all flex items-center gap-2 mx-auto disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: '#FFF9F0', fontFamily: FONT }}
          >
            {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {isExporting ? t('settings_export_exporting') : isElite ? t('settings_export_exportBtn') : t('settings_export_upgradeBtn')}
          </button>
        </div>
      </motion.div>

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onConfirm={async (delivery) => {
          setIsExporting(true);
          try {
            const res = await exportApi.exportAll(delivery);
            if (res.success) {
              toast.success(
                delivery === 'email'
                  ? 'Export sent to your email'
                  : 'PDF downloaded successfully'
              );
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
        mode="all"
      />

      {/* PaywallModal for Export */}
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        feature="export"
      />
    </>
  );
}
