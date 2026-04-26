/**
 * 404 Not Found — Premium branded with diAry design system
 */
import { useLocation } from 'wouter';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';
const GOLD_DARK = '#A8863A';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#F5F0E8', paddingTop: '70px' }}
    >
      <img
        src="/assets/images/logo.png"
        alt="diAry"
        className="w-24 h-24 object-contain mb-6 opacity-40"
      />
      <h1
        className="text-7xl font-bold mb-2"
        style={{ fontFamily: FONT, color: GOLD, letterSpacing: '0.05em' }}
      >
        404
      </h1>
      <h2
        className="text-2xl mb-4 font-semibold"
        style={{ fontFamily: FONT, color: '#3E2B1E' }}
      >
        Page Not Found
      </h2>
      <p
        className="text-center mb-8 max-w-md leading-relaxed"
        style={{ fontFamily: FONT, color: '#7A6B5D', fontSize: '16px' }}
      >
        The page you're looking for doesn't exist. It may have been moved or deleted.
      </p>
      <button
        onClick={() => setLocation('/')}
        className="px-8 py-3 rounded-lg text-sm font-semibold tracking-wider transition-all hover:opacity-90"
        style={{
          background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`,
          color: '#FFF9F0',
          fontFamily: FONT,
          letterSpacing: '0.1em',
        }}
      >
        Return Home
      </button>
    </div>
  );
}
