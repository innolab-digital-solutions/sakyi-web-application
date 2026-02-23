export type SupportedLanguage = 'en' | 'my';

export type TranslationObject = {
  [key: string]: string | TranslationObject;
};

export type Translations = Record<SupportedLanguage, TranslationObject>;

export type TranslationReplacements = Record<string, string>;
