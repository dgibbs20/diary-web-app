/**
 * Header — Shows on EVERY page with consistent branding
 */
import React, { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { Menu, X, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getLogoSrc } from '@/utils/logoHelper';

const MARKETING = 'https://diary.gmxquantum.com';
const DOWNLOAD_URL = `${MARKETING}/#download`;

const NAV_LINKS = [
  { key: 'footer_features', href: `${MARKETING}/#features` },
  { key: 'footer_howItWorks', href: `${MARKETING}/#how-it-works` },
  { key: 'footer_screenshots', href: `${MARKETING}/#screenshots` },
  { key: 'footer_videos', href: `${MARKETING}/#videos` },
  { key: 'footer_pricing', href: `${MARKETING}/#pricing` },
  { key: 'footer_faq', href: `${MARKETING}/faq.html` },
  { key: 'footer_privacy', href: `${MARKETING}/#privacy` },
  { key: 'footer_contact', href: `${MARKETING}/#contact` },
];

export default function Header() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDashboard = location.startsWith('/dashboard');

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
  };

  const linkStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: isDashboard ? 'var(--muted-foreground)' : '#5C3D2A',
    textDecoration: 'none',
  };

  const ctaBtnStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
    color: '#F5F0E8',
    padding: '7px 22px',
    borderRadius: '40px',
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    border: 'none',
    cursor: 'pointer',
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[999] flex items-center justify-between chrome-gold-wash"
      style={{
        background: isDashboard ? 'var(--card)' : 'rgba(245,240,232,0.96)',
        backdropFilter: 'blur(12px)',
        borderBottom: isDashboard
          ? '1px solid var(--border)'
          : '1px solid rgba(201,168,76,0.2)',
        padding: '0 3% 0 2%',
        height: '56px',
      }}
    >
      {/* Logo */}
      <Link href={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
        <img
          src={getLogoSrc(i18n.language, user?.subscription_tier === 'diary_elite')}
          alt="diAry"
          style={{ height: '36px' }}
        />
      </Link>

      {/* Desktop Nav */}
      <ul className="hidden lg:flex items-center" style={{ gap: '24px', listStyle: 'none' }}>
        {NAV_LINKS.map((link) => (
          <li key={link.key}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#C9A84C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isDashboard
                  ? 'var(--muted-foreground)'
                  : '#5C3D2A';
              }}
            >
              {t(link.key)}
            </a>
          </li>
        ))}

        <li>
          <a
            href={DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={linkStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#C9A84C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = isDashboard
                ? 'var(--muted-foreground)'
                : '#5C3D2A';
            }}
          >
            {t('header_download')}
          </a>
        </li>

        <li>
          {isAuthenticated ? (
            <button onClick={handleLogout} className="gold-cta-gradient" style={ctaBtnStyle}>
              {t('header_signOut')}
            </button>
          ) : (
            <Link href="/login" className="gold-cta-gradient" style={{ ...ctaBtnStyle, textDecoration: 'none' }}>
              {t('header_signIn')}
            </Link>
          )}
        </li>
      </ul>

      {/* Mobile toggle */}
      <button
        className="lg:hidden p-2"
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ background: 'none', border: 'none' }}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed top-[56px] left-0 right-0"
          style={{
            background: isDashboard ? 'var(--card)' : 'rgba(245,240,232,0.98)',
            padding: '12px 5%',
          }}
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                padding: '12px 0',
                textTransform: 'uppercase',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#5C3D2A',
                textDecoration: 'none',
                borderBottom: '1px solid rgba(201,168,76,0.1)',
              }}
            >
              {t(link.key)}
            </a>
          ))}

          <a
            href={DOWNLOAD_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'block',
              padding: '12px 0',
              textTransform: 'uppercase',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#5C3D2A',
              textDecoration: 'none',
              borderBottom: '1px solid rgba(201,168,76,0.1)',
            }}
          >
            {t('header_download')}
          </a>

          <div style={{ marginTop: 12 }}>
            {isAuthenticated ? (
              <button onClick={handleLogout} className="gold-cta-gradient" style={{ ...ctaBtnStyle, width: '100%' }}>
                {t('header_signOut')}
              </button>
            ) : (
              <Link
                href="/login"
                className="gold-cta-gradient"
                style={{ ...ctaBtnStyle, display: 'block', textAlign: 'center' }}
                onClick={() => setMobileOpen(false)}
              >
                {t('header_signIn')}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
