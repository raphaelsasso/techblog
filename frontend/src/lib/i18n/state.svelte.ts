import en from './en.json';
import pt from './pt.json';

export type Locale = 'en' | 'pt';

const translations: Record<Locale, Record<string, unknown>> = { en, pt };

class I18nState {
  locale: Locale = $state('en');
}

const i18n = new I18nState();

export function getLocale(): Locale {
  return i18n.locale;
}

export function setLocale(newLocale: Locale): void {
  i18n.locale = newLocale;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('locale', newLocale);
  }
}

export function detectLocale(): Locale {
  if (typeof localStorage !== 'undefined') {
    const stored = localStorage.getItem('locale') as Locale | null;
    if (stored && (stored === 'en' || stored === 'pt')) return stored;
  }
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('pt')) return 'pt';
  }
  return 'en';
}

export function t(key: string): string {
  const current = i18n.locale;
  const keys = key.split('.');
  let value: unknown = translations[current];
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  return typeof value === 'string' ? value : key;
}
