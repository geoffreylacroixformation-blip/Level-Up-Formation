import fr from '../i18n/fr.json';
import en from '../i18n/en.json';

const translations = { fr, en };

export const languages = {
  fr: 'Français',
  en: 'English',
};

export const defaultLang = 'fr';

export function getLangFromUrl(url: URL): string {
  const [, lang] = url.pathname.split('/');
  if (lang in translations) return lang;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof translations) {
  return translations[lang];
}

export function getRouteFromUrl(url: URL, lang: string): string {
  const pathname = url.pathname;
  const parts = pathname.split('/').filter(Boolean);

  if (parts[0] === lang) {
    parts.shift();
  }

  return '/' + parts.join('/');
}

export function getLocalizedPath(path: string, lang: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return lang === defaultLang ? `/${cleanPath}` : `/${lang}/${cleanPath}`;
}

export type TranslationKey = typeof fr;
