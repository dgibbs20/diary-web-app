/**
 * ChangeEmailSection — diAry Settings > Security
 * Two-step local state machine: request (password + new email) -> verify (OTP)
 */
import { useState } from 'react';
import { Mail, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api';
import { toast } from 'sonner';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';
const GOLD_DARK = '#A8863A';

type Step = 'request' | 'verify';

export default function ChangeEmailSection() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>('request');

  const [currentPw, setCurrentPw] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [requestError, setRequestError] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const [otp, setOtp] = useState('');
  const [verifyError, setVerifyError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

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

  const resetToRequestStep = () => {
    setStep('request');
    setCurrentPw('');
    setNewEmail('');
    setOtp('');
    setRequestError('');
    setVerifyError('');
  };

  const handleRequest = async () => {
    setRequestError('');
    if (!currentPw || !newEmail) { setRequestError('Current password and new email are required'); return; }

    setIsRequesting(true);
    try {
      const res = await userApi.requestChangeEmail(currentPw, newEmail);
      if (res.rate_limited) {
        setRequestError('Too many attempts, please wait before trying again');
      } else if (res.success) {
        toast.success(res.message || 'If this address is available, a verification code has been sent.');
        setCurrentPw('');
        setStep('verify');
      } else {
        setRequestError(res.error || 'Failed to request email change');
      }
    } catch {
      setRequestError('Failed to request email change');
    }
    setIsRequesting(false);
  };

  const handleVerify = async () => {
    setVerifyError('');
    if (!otp) { setVerifyError('OTP is required'); return; }

    setIsVerifying(true);
    try {
      const res = await userApi.verifyChangeEmail(otp);
      if (res.success) {
        await refreshUser();
        toast.success('Email changed successfully');
        resetToRequestStep();
      } else {
        const code = typeof res.error === 'object' ? res.error?.code : undefined;
        const message = typeof res.error === 'object' ? res.error?.message : res.error;

        if (code === 'OTP_EXPIRED' || code === 'TOO_MANY_ATTEMPTS') {
          toast.error(message || 'Please start the email change again');
          resetToRequestStep();
        } else if (message === 'No email change is in progress') {
          toast.error('That request expired — please start again');
          resetToRequestStep();
        } else {
          setVerifyError(message || 'Invalid OTP. Please try again.');
        }
      }
    } catch {
      setVerifyError('Failed to verify code');
    }
    setIsVerifying(false);
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const res = await userApi.resendChangeEmailOtp();
      if (res.rate_limited) {
        toast.error('Too many attempts, please wait before trying again');
      } else if (res.success) {
        toast.success(res.message || 'A new verification code has been sent to your new email address.');
      } else {
        toast.error(res.error || 'Failed to resend code');
      }
    } catch {
      toast.error('Failed to resend code');
    }
    setIsResending(false);
  };

  return (
    <div className="p-5 rounded-xl" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--card)' }}>
      <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: FONT, color: 'var(--foreground)' }}>
        {t('settings_security_changeEmail')}
      </h3>
      <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}>
        {t('settings_security_currentEmail')}: {user?.email}
      </p>

      {step === 'request' && (
        <div className="space-y-4">
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
            <label className="block text-xs uppercase mb-2" style={labelStyle}>{t('settings_security_newEmail')}</label>
            <input
              type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-background focus:outline-none transition-shadow"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {requestError && (
            <p className="text-xs" style={{ color: '#D14343', fontFamily: FONT }}>{requestError}</p>
          )}

          <button
            onClick={handleRequest} disabled={isRequesting}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wider transition-all flex items-center gap-2 disabled:opacity-60"
            style={{ background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: '#FFF9F0', fontFamily: FONT }}
          >
            {isRequesting ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
            {isRequesting ? t('settings_security_sendingCode') : t('settings_security_changeEmailBtn')}
          </button>
        </div>
      )}

      {step === 'verify' && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--foreground)', fontFamily: FONT }}>
            {t('settings_security_checkEmailMessage')}
          </p>

          <div>
            <label className="block text-xs uppercase mb-2" style={labelStyle}>{t('settings_security_otpLabel')}</label>
            <input
              type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg text-sm bg-background focus:outline-none transition-shadow"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.boxShadow = `0 0 0 2px rgba(201,168,76,0.2)`; }}
              onBlur={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {verifyError && (
            <p className="text-xs" style={{ color: '#D14343', fontFamily: FONT }}>{verifyError}</p>
          )}

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={handleVerify} disabled={isVerifying}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wider transition-all flex items-center gap-2 disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, color: '#FFF9F0', fontFamily: FONT }}
            >
              {isVerifying ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {isVerifying ? t('settings_security_verifying') : t('settings_security_verifyBtn')}
            </button>

            <button
              type="button" onClick={handleResend} disabled={isResending}
              className="text-xs font-semibold underline disabled:opacity-60"
              style={{ color: GOLD_DARK, fontFamily: FONT }}
            >
              {isResending ? t('settings_security_resending') : t('settings_security_resendCode')}
            </button>

            <button
              type="button" onClick={resetToRequestStep}
              className="text-xs underline"
              style={{ color: 'var(--muted-foreground)', fontFamily: FONT }}
            >
              {t('settings_security_useDifferentEmail')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
