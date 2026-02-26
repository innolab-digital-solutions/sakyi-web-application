## Localization Library (`lib/localization`)

This document explains the lightweight localization system in `lib/localization` and how to use it in components and pages.

The goal of this module is to provide:

- A simple, **framework‑agnostic** translation core (no heavy i18n runtime).
- A clear way to manage **language dictionaries** in code.
- A small React integration via `LanguageContext` for convenient use in components.

All public localization utilities are exported from:

```ts
import {
  getTranslation,
  translate,
  getCurrentLanguage,
  getDictionaries,
  type SupportedLanguage,
  type TranslationReplacements,
} from '@/lib/localization';
```

---

## Module Layout

```text
lib/localization/
  core.ts              # translation engine (helpers + public API)
  types.ts             # shared localization types
  dictionaries/
    en/
      index.ts         # English dictionary export
      validation.json  # example namespace
    my/
      index.ts
      validation.json
  index.ts             # barrel exports
```

- **`core.ts`** – implements key resolution, placeholder interpolation, language selection, and helper functions (`getTranslation`, `translate`, etc.).
- **`types.ts`** – defines `SupportedLanguage`, `Translations`, `TranslationObject`, and `TranslationReplacements`.
- **`dictionaries/*`** – language‑specific trees of translation strings.
- **`index.ts`** – re‑exports `core` and `types` for simpler imports.

---

## Types and Shape of Dictionaries

### Supported languages

```ts
export type SupportedLanguage = 'en' | 'my';
```

To add another language, extend this union and provide a corresponding dictionary under `dictionaries/`.

### Translation object

```ts
export type TranslationObject = {
  [key: string]: string | TranslationObject;
};
```

This allows both flat and nested translation structures:

```ts
const en: TranslationObject = {
  greeting: 'Hello',
  validation: {
    required: 'This field is required.',
  },
};
```

### Translations map

```ts
export type Translations = Record<SupportedLanguage, TranslationObject>;
```

Internally, `getDictionaries()` returns this structure so the core engine can look up translations by language code.

### Replacements

```ts
export type TranslationReplacements = Record<string, string>;
```

Used for placeholder interpolation, e.g. `{ attribute: 'email' }` for `"The :attribute field is required."`.

---

## Core API (`core.ts`)

### `getDictionaries(): Translations`

Returns the full set of dictionaries:

```ts
const dictionaries = getDictionaries(); // { en: {...}, my: {...} }
```

You usually don’t need this directly unless you are writing tools, tests, or building additional localization helpers.

### `getCurrentLanguage(): SupportedLanguage`

Determines the active language:

- On the **server**, falls back to `'en'`.
- On the **client**, reads `language` from `localStorage`; if it’s not a supported code, falls back to `'en'`.

This function is used by `translate` to infer which dictionary to read from outside of React context.

### `getTranslation(language, key, replacements?)`

The main core function:

```ts
import { getTranslation } from '@/lib/localization';

const text = getTranslation('en', 'validation.required', {
  attribute: 'email',
});
```

Behavior:

- Tries `dictionaries[language]` first.
- Falls back to the English dictionary (`dictionaries.en`).
- If no translation is found, returns the key itself.
- Supports interpolation of `:placeholder` tokens when `replacements` are provided.

Keys use **dot notation** to traverse the nested `TranslationObject`:

```ts
getTranslation('en', 'validation.required');
getTranslation('en', 'errors.auth.unauthorized');
```

### `translate(key, replacements?)`

Convenience helper that:

- Reads the current language via `getCurrentLanguage()`.
- Delegates to `getTranslation(language, key, replacements)`:

```ts
import { translate } from '@/lib/localization';

const label = translate('validation.required', { attribute: 'password' });
```

Use this where you don’t already know the active language (e.g., outside React or in simple utility code).

---

## Placeholder Interpolation

The engine supports `:placeholder` tokens in translation strings, e.g.:

```json
{
  "validation": {
    "required": "The :attribute field is required."
  }
}
```

Usage:

```ts
const message = getTranslation('en', 'validation.required', {
  attribute: 'email',
}); // "The email field is required."
```

Any placeholder without a corresponding key in `TranslationReplacements` will be left unchanged, making it safe to omit values when appropriate.

---

## React Integration (`LanguageContext`)

While the core localization library is framework‑agnostic, the project includes a small React integration in `context/LanguageContext.tsx`.

### `LanguageProvider`

Responsibilities:

- Hydrates the initial `language` from `localStorage` on the client (`'en'` or `'my'`).
- Persists language changes back to `localStorage`.
- Exposes:
  - `language: SupportedLanguage`
  - `setLanguage(lang: SupportedLanguage)`
  - `translate(key, replacements?)` – wraps `getTranslation(language, key, replacements)`.

Typical usage in `app/layout.tsx` or a site layout:

```tsx
import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
```

### `useLanguage()`

Convenience hook for components:

```tsx
import { useLanguage } from '@/context/LanguageContext';

const Component = () => {
  const { language, setLanguage, translate } = useLanguage();

  return (
    <div>
      <p>{translate('validation.required', { attribute: 'email' })}</p>
      <button onClick={() => setLanguage('my')}>Switch to Burmese</button>
    </div>
  );
};
```

> `useLanguage` will throw if used outside of `LanguageProvider`, helping to catch misconfiguration early.

---

## Adding a New Language

1. **Extend `SupportedLanguage`** in `types.ts`:

   ```ts
   export type SupportedLanguage = 'en' | 'my' | 'es';
   ```

2. **Create a new dictionary file** under `dictionaries/es`:

   ```text
   lib/localization/dictionaries/es/index.ts
   lib/localization/dictionaries/es/validation.json
   ```

   `index.ts` should export a `TranslationObject` (often by loading JSON and merging namespaces).

3. **Update `getDictionaries`** in `core.ts`:

   ```ts
   import en from './dictionaries/en';
   import my from './dictionaries/my';
   import es from './dictionaries/es';

   export const getDictionaries = (): Translations => {
     return { en, my, es };
   };
   ```

4. **Update `LanguageProvider`** (if you want it to allow the new code):
   - Adjust the localStorage handling or UI that offers language choices.

From this point, all calls to `getTranslation`/`translate` will support the new language automatically, with English as the fallback.

---

## Best Practices

- **Use dot‑notation keys** (`"validation.required"`) instead of very long flat keys; this keeps dictionaries organized.
- **Keep placeholders explicit** and consistent (`:attribute`, `:name`, etc.).
- **Prefer `translate` or the `translate` function from `useLanguage`** in React components:
  - `useLanguage` → for reactive UI that should update when language changes.
  - `translate` → for non‑reactive environments (simple utilities, server‑side logs, etc.).
- **Treat English as a fallback**, not necessarily the default user choice:
  - `getTranslation` already falls back to the English dictionary if a key is missing in the active language.

By centralizing localization in `lib/localization` and using `LanguageContext` in the React tree, the project gets a small, predictable i18n layer that is easy to extend as new languages or sections are added. +
