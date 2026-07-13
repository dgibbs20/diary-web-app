/**
 * 404 Not Found — Premium branded with diAry design system
 */
import { useLocation } from 'wouter';
import { useTranslation } from 'react-i18next';
import { getLogoSrc } from '@/utils/logoHelper';

const FONT = "'Cormorant Garamond', Georgia, serif";
const GOLD = '#C9A84C';
const GOLD_DARK = '#A8863A';

export default function NotFound() {
  const [, setLocation] = useLocation();
  const { t, i18n } = useTranslation();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ backgroundColor: '#F5F0E8', paddingTop: '70px' }}
    >
      <img
        src={getLogoSrc(i18n.language, false)}
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
        {t('notFound_title')}
      </h2>
      <p
        className="text-center mb-8 max-w-md leading-relaxed"
        style={{ color: '#7A6B5D', fontSize: '16px' }}
      >
        {t('notFound_body')}
      </p>
      <button
        onClick={() => setLocation('/')}
        className="px-8 py-3 rounded-full text-sm font-semibold tracking-wider transition-all hover:opacity-90 gold-cta-gradient"
        style={{
          background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`,
          color: '#FFF9F0',
          letterSpacing: '0.1em',
        }}
      >
        {t('notFound_returnHome')}
      </button>
    </div>
  );
}
