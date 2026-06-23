import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all locale files
import en from './locales/en.json';
import ar from './locales/ar.json';
import cs from './locales/cs.json';
import da from './locales/da.json';
import de from './locales/de.json';
import el from './locales/el.json';
import es from './locales/es.json';
import es_419 from './locales/es_419.json';
import fi from './locales/fi.json';
import fr from './locales/fr.json';
import he from './locales/he.json';
import hi from './locales/hi.json';
import hu from './locales/hu.json';
import id from './locales/id.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import nl from './locales/nl.json';
import no from './locales/no.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ro from './locales/ro.json';
import ru from './locales/ru.json';
import sv from './locales/sv.json';
import th from './locales/th.json';
import tr from './locales/tr.json';
import vi from './locales/vi.json';
import zh from './locales/zh.json';
import zh_TW from './locales/zh_TW.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      cs: { translation: cs },
      da: { translation: da },
      de: { translation: de },
      el: { translation: el },
      es: { translation: es },
      es_419: { translation: es_419 },
      fi: { translation: fi },
      fr: { translation: fr },
      he: { translation: he },
      hi: { translation: hi },
      hu: { translation: hu },
      id: { translation: id },
      it: { translation: it },
      ja: { translation: ja },
      ko: { translation: ko },
      nl: { translation: nl },
      no: { translation: no },
      pl: { translation: pl },
      pt: { translation: pt },
      ro: { translation: ro },
      ru: { translation: ru },
      sv: { translation: sv },
      th: { translation: th },
      tr: { translation: tr },
      vi: { translation: vi },
      zh: { translation: zh },
      zh_TW: { translation: zh_TW },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'diary_language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

// All 29 language options for the picker — names in their native script
export const LANGUAGE_OPTIONS = [
  { code: 'en',     name: 'English' },
  { code: 'ar',     name: 'العربية' },
  { code: 'cs',     name: 'Čeština' },
  { code: 'da',     name: 'Dansk' },
  { code: 'de',     name: 'Deutsch' },
  { code: 'el',     name: 'Ελληνικά' },
  { code: 'es',     name: 'Español' },
  { code: 'es_419', name: 'Español (Latinoamérica)' },
  { code: 'fi',     name: 'Suomi' },
  { code: 'fr',     name: 'Français' },
  { code: 'he',     name: 'עברית' },
  { code: 'hi',     name: 'हिन्दी' },
  { code: 'hu',     name: 'Magyar' },
  { code: 'id',     name: 'Bahasa Indonesia' },
  { code: 'it',     name: 'Italiano' },
  { code: 'ja',     name: '日本語' },
  { code: 'ko',     name: '한국어' },
  { code: 'nl',     name: 'Nederlands' },
  { code: 'no',     name: 'Norsk' },
  { code: 'pl',     name: 'Polski' },
  { code: 'pt',     name: 'Português' },
  { code: 'ro',     name: 'Română' },
  { code: 'ru',     name: 'Русский' },
  { code: 'sv',     name: 'Svenska' },
  { code: 'th',     name: 'ไทย' },
  { code: 'tr',     name: 'Türkçe' },
  { code: 'vi',     name: 'Tiếng Việt' },
  { code: 'zh',     name: '简体中文' },
  { code: 'zh_TW',  name: '繁體中文' },
];
