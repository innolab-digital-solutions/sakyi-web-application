import { FALLBACK_LANGUAGE } from '@/config/languages';

import en from './dictionaries/en';
import my from './dictionaries/my';
import type {
  SupportedLanguage,
  TranslationReplacements,
  Translations,
} from './types';
import { interpolate, resolveKey } from './utils';

export const getDictionaries = (): Translations => {
  return { en, my };
};

/**
 * Retrieves the translation string for a given key and language, with optional replacements for interpolation.
 *
 * Looks up the translation for the specified `key` in the dictionary for the provided `language`. If the key does not exist
 * in that language, falls back to the fallback language. If the key is missing from both, returns the key itself.
 * Supports interpolating placeholders with the given `replacements`.
 *
 * @param {SupportedLanguage} language - The language code to retrieve the translation from.
 * @param {string} key - The translation key (dot-separated for nested paths).
 * @param {TranslationReplacements} [replacements] - Optional placeholder replacements for interpolation.
 * @returns {string} The translated and interpolated string, or the key if translation is not found.
 */
export const getTranslation = (
  language: SupportedLanguage,
  key: string,
  replacements?: TranslationReplacements,
): string => {
  const dictionaries = getDictionaries();

  let raw =
    resolveKey(dictionaries[language], key) ??
    resolveKey(dictionaries[FALLBACK_LANGUAGE], key) ??
    key;

  if (replacements && Object.keys(replacements).length > 0) {
    raw = interpolate(raw, replacements);
  }

  return raw;
};
