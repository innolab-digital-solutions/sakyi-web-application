import {
  DEFAULT_LANGUAGE,
  FALLBACK_LANGUAGE,
  SUPPORTED_LANGUAGE_CODES,
} from '@/config/languages';

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
 * Determines the current language preference for the user.
 *
 * On the client side, attempts to retrieve the user's selected language from localStorage.
 * If no language is stored or the value is not among the supported language codes,
 * returns the default language. On the server side (when `window` is undefined),
 * always returns the default language.
 *
 * @returns {SupportedLanguage} The language code for the current session or the default language.
 *
 * @remarks
 * - Ensures clients cannot select unsupported languages via storage tampering.
 * - Does not perform any side effects outside reading from storage.
 */
export const getCurrentLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const stored = window.localStorage.getItem(
    'language',
  ) as SupportedLanguage | null;

  return stored && SUPPORTED_LANGUAGE_CODES.includes(stored)
    ? stored
    : DEFAULT_LANGUAGE;
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

export const translate = (
  key: string,
  replacements?: TranslationReplacements,
): string => {
  return getTranslation(getCurrentLanguage(), key, replacements);
};
