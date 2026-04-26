/**
 * Header — Matches marketing site nav exactly
 * Logo image left, 8 nav links, Login/Logout CTA right
 * Reference: marketing site lines 333-345
 * Nav: height 70px, bg rgba(245,240,232,0.96), backdrop-filter blur(12px)
 * Border-bottom: 1px solid rgba(201,168,76,0.2)
 * Links: 0.75rem, 500 weight, 0.16em letter-spacing, uppercase, brown-mid
 */
import { useLocation, Link } from 'wouter';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
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
  const { isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Show on splash + auth pages only (dashboard has its own sidebar)
  const showPages = ['/', '/login', '/register', '/forgot-password', '/verify'];
  const shouldShow = showPages.some(p => location === p || (p !== '/' && location.startsWith(p)));
  if (!shouldShow) return null;

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[999] flex items-center justify-between"
      style={{
        background: 'rgba(245,240,232,0.96)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
        padding: '0 5%',
        height: '70px',
      }}
    >
      {/* Logo — matching marketing site: logo image, height 145px, margin-top 40px */}
      <Link href="/" className="flex items-center">
        <img
          src="/assets/images/logo.png"
          alt="diAry"
          style={{
            height: '50px',
          }}
        />
      </Link>

      {/* Desktop Nav Links — matching marketing site exactly */}
      <ul className="hidden lg:flex items-center" style={{ gap: '28px', listStyle: 'none' }}>
        {NAV_LINKS.map(link => (
          <li key={link.label}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#5C3D2A',
                textDecoration: 'none',
                transition: 'color 0.25s',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#C9A84C'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#5C3D2A'; }}
            >
              {link.label}
            </a>
          </li>
        ))}
        {/* Login/Logout CTA — matching nav-cta style */}
        <li>
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              style={{
                background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
                color: '#F5F0E8',
                padding: '8px 20px',
                borderRadius: '40px',
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                border: 'none',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 12px rgba(168,134,58,0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(168,134,58,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(168,134,58,0.2)';
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
                padding: '8px 20px',
                borderRadius: '40px',
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 2px 12px rgba(168,134,58,0.2)',
              }}
            >
              Sign In
            </Link>
          )}
        </li>
      </ul>

      {/* Mobile menu toggle */}
      <button
        className="lg:hidden p-2"
        style={{ color: '#5C3D2A', background: 'none', border: 'none' }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed top-[70px] left-0 right-0"
          style={{
            background: 'rgba(245,240,232,0.98)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(201,168,76,0.2)',
            padding: '16px 5%',
          }}
        >
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3"
              style={{
                fontSize: '0.85rem',
                fontWeight: 500,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#5C3D2A',
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
                  background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
                  color: '#F5F0E8',
                  borderRadius: '40px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  border: 'none',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                }}
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="block w-full text-center py-3"
                style={{
                  background: 'linear-gradient(135deg, #A8863A, #C9A84C)',
                  color: '#F5F0E8',
                  borderRadius: '40px',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
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
