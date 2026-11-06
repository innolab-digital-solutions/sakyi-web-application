# Localization guide

How translation dictionaries and `getTranslation` work under `lib/localization`, and how `LanguageProvider` / `useLanguage` fit in. Wider app context: [project-architecture.md](./project-architecture.md).

## Purpose

`@/lib/localization` provides a lightweight, explicit localization system for this project:

- Dot-path translation keys into nested dictionaries
- A stable fallback strategy (active language → fallback language → the key itself)
- Placeholder interpolation with replacements
- A React integration (`LanguageProvider` / `useLanguage`) for client-side reactivity

## Supported languages

Source of truth is `config/languages.ts`: `SupportedLanguage`, `SUPPORTED_LANGUAGE_CODES`, `DEFAULT_LANGUAGE`, `FALLBACK_LANGUAGE`, and `LANGUAGES` for UI labels. `lib/localization/types.ts` re-exports `SupportedLanguage` from there.

`getTranslation` in `core.ts` loads `en` and `my` from `getDictionaries()`. Lookup order: active language, then `FALLBACK_LANGUAGE` (`en`), then the key string itself if still missing.

## Public imports

From `@/lib/localization`:

```ts
import { getDictionaries, getTranslation } from '@/lib/localization';
import type {
  SupportedLanguage,
  TranslationReplacements,
} from '@/lib/localization';
```

`interpolate` and `resolveKey` live in `utils.ts` and are used internally by `getTranslation`; do not duplicate that logic in features unless you have a one-off need and accept drift.

## Cookbook: common usage

### Scenario A: Get a translation (non-React usage)

```ts
import { getTranslation } from '@/lib/localization';

const title = getTranslation('en', 'marketing.pages.home.hero.title');
```

**Expected result**:

- If the key exists in the selected language → returns the translated string.
- If missing in that language but exists in fallback (`en`) → returns fallback string.
- If missing everywhere → returns the key string itself.

### Scenario B: Placeholders / replacements

If the dictionary value contains `:name` tokens:

```ts
import { getTranslation } from '@/lib/localization';

getTranslation('en', 'shared.validation.min', { min: 3 });
```

**Expected result**:

- `:min` is replaced with `3`.\n+- Missing replacements leave the token untouched (intentional; makes missing data visible).

### Scenario C: React usage with `useLanguage()`

Use this in Client Components that must re-render when the user changes language.

```ts
'use client';

import { useLanguage } from '@/context/LanguageContext';

export const Greeting = () => {
  const { translate } = useLanguage();
  return <p>{translate('marketing.pages.home.hero.title')}</p>;
};
```

### Scenario D: Server Components (no localStorage)

Server Components cannot read localStorage. If you need server-side translations:

```ts
import { DEFAULT_LANGUAGE } from '@/config/languages';
import { getTranslation } from '@/lib/localization';

const title = getTranslation(
  DEFAULT_LANGUAGE,
  'marketing.pages.home.hero.title',
);
```

## Keys and placeholders

Keys are dot paths into nested objects, for example `marketing.pages.contact.contact-form.title.black`.

Placeholders in strings use `:word` tokens. Pass replacements as `{ word: 'value' }`. Missing keys leave the `:token` in the string (`utils.interpolate`).

## Dictionaries

Each language has `lib/localization/dictionaries/<code>/index.ts` merging JSON (and TS objects) into one `TranslationObject` tree. English and Myanmar mirror the same shape so keys resolve consistently.

Adding strings: extend the right JSON under `dictionaries/<lang>/` and ensure the other language file gets the same key paths. Keep marketing copy under `marketing/`, shared messages under `shared/`.

## Common pitfalls

- **Using `useLanguage` outside the provider**: it throws by design.\n+- **Key drift between languages**: keep `en` and `my` structural shape aligned.\n+- **Translating on the server with localStorage assumptions**: always pass an explicit language on the server.\n+

## Adding a language

1. Extend `SupportedLanguage` and `SUPPORTED_LANGUAGE_CODES` in `config/languages.ts`, and add an entry to `LANGUAGES`.
2. Add `lib/localization/dictionaries/<code>/` with an `index.ts` that exports the same structural shape as `en` (at minimum stub keys you have not translated yet, or reuse English until translated).
3. Import that dictionary in `lib/localization/core.ts` and include it in the object returned by `getDictionaries()`.
4. Any UI that lists languages (for example `LanguageDropdown`) should use `LANGUAGES` or `SUPPORTED_LANGUAGE_CODES` so new codes stay valid.

## React usage

`LanguageProvider` in `context/LanguageContext.tsx` wraps the app from `app/layout.tsx`. It:

- Initializes from `DEFAULT_LANGUAGE`, then on mount syncs from `localStorage` key `language` if the value is a supported code.
- Persists `language` to `localStorage` and sets `document.documentElement.lang` when language changes.

`useLanguage()` returns `language`, `setLanguage`, and `translate(key, replacements?)`, where `translate` calls `getTranslation(language, key, replacements)`. Use this in Client Components that must re-render when the user switches language.

Calling `useLanguage` outside `LanguageProvider` throws by design.

Server Components have no access to `localStorage`; they should pass an explicit language or default (for example `DEFAULT_LANGUAGE`) into `getTranslation` if you translate on the server.

## Files

`core.ts` defines `getDictionaries` and `getTranslation`. `types.ts` defines `TranslationObject`, `Translations`, `TranslationReplacements`. `utils.ts` implements `resolveKey` and `interpolate`. `index.ts` re-exports `core` and the main types. `dictionaries/` holds per-locale trees.

## Checklist

Use dot keys. Keep `en` and `my` trees aligned. Prefer `useLanguage().translate` in interactive Client Components; use `getTranslation(lang, key)` when you already know `lang` (server or tests). After adding keys, verify both dictionaries resolve or fall back predictably.
