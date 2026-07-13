/**
 * Footer — Shows on auth/splash pages with full marketing-style branding
 * Dashboard has its own integrated compact footer (DashboardFooter in Dashboard.tsx)
 * Matches marketing site: diary.gmxquantum.com
 */
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { getLogoSrc } from '@/utils/logoHelper';

const MARKETING = 'https://diary.gmxquantum.com';

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

export default function Footer() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const isDashboard = location.startsWith('/dashboard');

  // Dashboard has its own footer
  if (isDashboard) return null;

  return (
    <footer
      style={{
        background: '#2C1A0E',
        color: 'rgba(245,240,232,0.6)',
        padding: '48px 5% 32px',
        textAlign: 'center',
      }}
    >
      {/* Logo */}
      <img
        src={getLogoSrc(i18n.language, user?.subscription_tier === 'diary_elite')}
        alt="diAry"
        style={{
          height: '180px',
          display: 'block',
          margin: '0 auto 20px',
          filter: 'brightness(0.9)',
        }}
      />

      {/* Tagline */}
      <p
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: '1.8rem',
          fontStyle: 'italic',
          color: 'rgba(245,240,232,0.45)',
          marginBottom: '36px',
          fontWeight: 300,
        }}
      >
        {t('footer_tagline')}
      </p>

      {/* Footer Links */}
      <ul
        style={{
          display: 'flex',
          gap: '28px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '28px',
          listStyle: 'none',
          padding: 0,
        }}
      >
        {FOOTER_LINKS.map((link) => (
          <li key={link.key}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.72rem',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,232,0.45)',
                textDecoration: 'none',
                transition: 'color 0.2s',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#C9A84C';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(245,240,232,0.45)';
              }}
            >
              {t(link.key)}
            </a>
          </li>
        ))}
      </ul>

      {/* Auth Button */}
      <div style={{ marginBottom: '32px' }}>
        {isAuthenticated ? (
          <button
            onClick={() => logout()}
            style={{
              background: 'transparent',
              border: '1px solid rgba(201,168,76,0.35)',
              color: '#C9A84C',
              padding: '10px 32px',
              borderRadius: '40px',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
              e.currentTarget.style.borderColor = '#C9A84C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.35)';
            }}
          >
            {t('header_signOut')}
          </button>
        ) : (
          <button
            onClick={() => {
              if (location === '/login') {
                window.dispatchEvent(new Event('scrollToLogin'));
              } else {
                window.location.href = '/login';
              }
            }}
            className="gold-cta-gradient"
            style={{
              background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
              color: '#F5F0E8',
              padding: '10px 32px',
              borderRadius: '40px',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 20px rgba(168,134,58,0.25)',
            }}
          >
            {t('header_signIn')}
          </button>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          width: '60px',
          height: '1px',
          background: 'rgba(201,168,76,0.2)',
          margin: '0 auto 20px',
        }}
      />

      {/* Copyright */}
      <p style={{ fontSize: '0.72rem', color: 'rgba(245,240,232,0.3)' }}>
        {t('footer_copyright')}
      </p>
    </footer>
  );
}
