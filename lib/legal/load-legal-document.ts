import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  parseLegalMarkdown,
  type LegalDocumentModel,
} from '@/lib/legal/parse-legal-markdown';

export const LEGAL_MARKDOWN_FILES = {
  termsOfService: 'terms-of-services.md',
  privacyPolicy: 'privacy-policy.md',
  disclaimer: 'disclaimer.md',
} as const;

export type LegalDocumentKey = keyof typeof LEGAL_MARKDOWN_FILES;

/**
 * Loads and parses a root-level legal markdown file for a marketing page.
 *
 * @param key - Document key mapped to a project-root markdown filename
 * @returns Parsed legal document model
 */
export async function loadLegalDocument(
  key: LegalDocumentKey,
): Promise<LegalDocumentModel> {
  const filename = LEGAL_MARKDOWN_FILES[key];
  const filePath = path.join(process.cwd(), filename);
  const markdown = await readFile(filePath, 'utf8');
  return parseLegalMarkdown(markdown);
}
