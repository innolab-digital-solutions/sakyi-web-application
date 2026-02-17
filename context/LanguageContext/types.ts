export type SupportedLanguage = 'en' | 'my';

export type TranslationObject = {
  [key: string]: string | TranslationObject;
};

export type Translations = Record<SupportedLanguage, TranslationObject>;

export interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translate: (key: string) => string;
}
