/**
 * Footer — Matches marketing site footer exactly
 * Reference: marketing site lines 824-838
 * bg: var(--brown) = #2C1A0E
 * Logo: logo.png, height 220px
 * Tagline: 2rem italic, rgba(245,240,232,0.5)
 * Links: 0.78rem, 0.15em letter-spacing, uppercase, rgba(245,240,232,0.5), hover: gold
 * Copyright: 0.78rem, rgba(245,240,232,0.3)
 */
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

const MARKETING = 'https://diary.gmxquantum.com';

const FOOTER_LINKS = [
  { label: 'Features', href: `${MARKETING}/#features` },
  { label: 'How It Works', href: `${MARKETING}/#how-it-works` },
  { label: 'Screenshots', href: `${MARKETING}/#screenshots` },
  { label: 'Videos', href: `${MARKETING}/#videos` },
  { label: 'Pricing', href: `${MARKETING}/#pricing` },
  { label: 'FAQ', href: `${MARKETING}/faq.html` },
  { label: 'Privacy Policy', href: `${MARKETING}/#privacy` },
  { label: 'Contact', href: `${MARKETING}/#contact` },
];

export default function Footer() {
  const [location] = useLocation();
  const { isAuthenticated, logout } = useAuth();

  // Show on splash + auth pages only (dashboard has its own layout)
  const showPages = ['/', '/login', '/register', '/forgot-password', '/verify'];
  const shouldShow = showPages.some(p => location === p || (p !== '/' && location.startsWith(p)));
  if (!shouldShow) return null;

  return (
    <footer
      style={{
        background: '#2C1A0E',
        color: 'rgba(245,240,232,0.6)',
        padding: '36px 5%',
        textAlign: 'center',
        fontFamily: "'Cormorant Garamond', Georgia, serif",
      }}
    >
      {/* Logo — matching marketing site: height 220px */}
      <img
        src="/assets/images/logo.png"
        alt="diAry"
        style={{
          height: '220px',
          display: 'block',
          margin: '0 auto 16px',
          filter: 'brightness(0.9)',
        }}
      />

      {/* Tagline — matching marketing site: 2rem italic */}
      <p
        style={{
          fontSize: '2rem',
          fontStyle: 'italic',
          color: 'rgba(245,240,232,0.5)',
          marginBottom: '32px',
        }}
      >
        "I'll never tell..."
      </p>

      {/* Nav links — matching marketing site footer-links */}
      <div
        style={{
          display: 'flex',
          gap: '32px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          marginBottom: '24px',
        }}
      >
        {FOOTER_LINKS.map(link => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.78rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'rgba(245,240,232,0.5)',
              textDecoration: 'none',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#C9A84C'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(245,240,232,0.5)'; }}
          >
            {link.label}
          </a>
        ))}
      </div>

      {/* Login/Logout button */}
      <div style={{ marginBottom: '28px' }}>
        {isAuthenticated ? (
          <button
            onClick={() => logout()}
            style={{
              background: 'transparent',
              border: '1px solid rgba(201,168,76,0.4)',
              color: '#C9A84C',
              padding: '10px 28px',
              borderRadius: '40px',
              fontSize: '0.78rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              transition: 'all 0.25s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(201,168,76,0.1)';
              e.currentTarget.style.borderColor = '#C9A84C';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)';
            }}
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            style={{
              background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
              color: '#F5F0E8',
              padding: '10px 28px',
              borderRadius: '40px',
              fontSize: '0.78rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 500,
              transition: 'transform 0.2s, box-shadow 0.2s',
              boxShadow: '0 4px 20px rgba(168,134,58,0.3)',
              display: 'inline-block',
            }}
          >
            Sign In
          </Link>
        )}
      </div>

      {/* Copyright — exact text as specified */}
      <p
        style={{
          fontSize: '0.78rem',
          color: 'rgba(245,240,232,0.3)',
        }}
      >
        &copy; 2026 GMX Quantum LLC. All rights reserved. A GMCG Holdings Inc. company.
      </p>
    </footer>
  );
}
