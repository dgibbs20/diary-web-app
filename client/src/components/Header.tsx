/**
 * Header — Shows on EVERY page with consistent branding
 * On auth/splash pages: full marketing-style nav with all 8 links
 * On dashboard pages: branded top bar with logo, key links, user avatar, Sign Out
 * Matches marketing site: diary.gmxquantum.com
 */
import { useLocation, Link } from 'wouter';
import { useState } from 'react';
import { Menu, X, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MARKETING = 'https://diary.gmxquantum.com';

const NAV_LINKS = [
  { label: 'Features', href: `${MARKETING}/#features` },
  { label: 'How It Works', href: `${MARKETING}/#how-it-works` },
  { label: 'Screenshots', href: `${MARKETING}/#screenshots` },
  { label: 'Videos', href: `${MARKETING}/#videos` },
  { label: 'Pricing', href: `${MARKETING}/#pricing` },
  { label: 'FAQ', href: `${MARKETING}/faq.html` },
  { label: 'Privacy', href: `${MARKETING}/#privacy` },
  { label: 'Contact', href: `${MARKETING}/#contact` },
];

export default function Header() {
  const [location] = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isDashboard = location.startsWith('/dashboard');

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
  };

  /* ─── Shared style tokens ─── */
  const linkStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: isDashboard ? 'var(--muted-foreground)' : '#5C3D2A',
    textDecoration: 'none',
    transition: 'color 0.25s',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
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
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 12px rgba(168,134,58,0.18)',
    cursor: 'pointer',
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[999] flex items-center justify-between"
      style={{
        background: isDashboard
          ? 'var(--card)'
          : 'rgba(245,240,232,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
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
          src={user?.subscription_tier === 'diary_elite' ? '/assets/images/logo_elite.png' : '/assets/images/logo.png'}
          alt="diAry"
          style={{ height: '36px' }}
        />
        {isDashboard && user?.subscription_tier === 'diary_elite' && (
          <span
            className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}
          >
            <Crown size={10} /> ELITE
          </span>
        )}
      </Link>

      {/* Desktop Nav Links */}
      <ul className="hidden lg:flex items-center" style={{ gap: '24px', listStyle: 'none' }}>
        {NAV_LINKS.map(link => (
          <li key={link.label}>
            
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={linkStyle}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#C9A84C'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = isDashboard ? 'var(--muted-foreground)' : '#5C3D2A'; }}
            >
              {link.label}
            </a>
          </li>
        ))}

        {/* Auth CTA */}
        <li>
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isDashboard && user && (
                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--foreground)', fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                >
                  {user.first_name || user.fullname || 'User'}
                </span>
              )}
              <button
                onClick={handleLogout}
                style={ctaBtnStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(168,134,58,0.28)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 12px rgba(168,134,58,0.18)';
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              style={{ ...ctaBtnStyle, textDecoration: 'none', display: 'inline-block' }}
            >
              Sign In
            </Link>
          )}
        </li>
      </ul>

      {/* Mobile menu toggle */}
      <button
        className="lg:hidden p-2"
        style={{ color: isDashboard ? 'var(--foreground)' : '#5C3D2A', background: 'none', border: 'none' }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed top-[56px] left-0 right-0"
          style={{
            background: isDashboard ? 'var(--card)' : 'rgba(245,240,232,0.98)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(201,168,76,0.2)',
            padding: '12px 5%',
            maxHeight: 'calc(100vh - 56px)',
            overflowY: 'auto',
          }}
        >
          {NAV_LINKS.map(link => (
            
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3"
              style={{
                fontSize: '0.82rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: isDashboard ? 'var(--foreground)' : '#5C3D2A',
                textDecoration: 'none',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                borderBottom: '1px solid rgba(201,168,76,0.08)',
              }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 mt-1">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-center py-3"
                style={{
                  ...ctaBtnStyle,
                  width: '100%',
                }}
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="block w-full text-center py-3"
                style={{
                  ...ctaBtnStyle,
                  textDecoration: 'none',
                  width: '100%',
                }}
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
