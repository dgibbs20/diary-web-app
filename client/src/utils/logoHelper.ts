const SUPPORTED_LOGO_LANGUAGES = [
  'ar', 'cs', 'da', 'de', 'el', 'es', 'es_419', 'fi', 'fr', 'he', 'hi', 'hu', 'id',
  'it', 'ja', 'ko', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'sv', 'th', 'tr', 'vi', 'zh', 'zh_TW',
];

export function getEliteLogoSrc(language: string): string {
  if (SUPPORTED_LOGO_LANGUAGES.includes(language)) {
    return `/assets/images/trans_logos/${language}_logo_elite.png`;
  }
  return '/assets/images/logo_elite.png';
}

export function getLogoSrc(language: string, isElite: boolean): string {
  if (isElite) {
    return getEliteLogoSrc(language);
  }
  return '/assets/images/logo.png';
}
