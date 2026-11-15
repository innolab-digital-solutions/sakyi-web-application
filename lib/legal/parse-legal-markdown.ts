/**
 * Parses Sa Kyi legal markdown documents into a structured tree for rendering.
 *
 * Supports the subset used by Terms, Privacy Policy, and Disclaimer:
 * headings, bold meta lines, paragraphs, ordered/unordered lists, inline
 * bold/links, horizontal rules, and a trailing copyright line.
 */

export type InlineSegment =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'link'; href: string; value: string };

export type LegalBlock =
  | { type: 'paragraph'; segments: InlineSegment[] }
  | { type: 'list'; ordered: boolean; items: InlineSegment[][] }
  | { type: 'subheading'; number: string | null; title: string }
  | { type: 'hr' };

export type LegalSection = {
  number: string | null;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocumentModel = {
  title: string;
  brand: string | null;
  effectiveDate: string | null;
  lastUpdated: string | null;
  sections: LegalSection[];
  copyright: string | null;
};

const HEADING_RE = /^(#{1,3})\s+(.+)$/;
const SECTION_TITLE_WITH_DOT_RE = /^(\d+(?:\.\d+)*)\.\s+(.+)$/;
const SECTION_TITLE_SUBSECTION_RE = /^(\d+\.\d+)\s+(.+)$/;
const UNORDERED_LIST_RE = /^[-*]\s+(.+)$/;
const ORDERED_LIST_RE = /^(\d+)\.\s+(.+)$/;
const META_BOLD_RE = /^\*\*(.+?)\*\*$/;
const EFFECTIVE_DATE_RE = /^(?:\*\*)?Effective Date:(?:\*\*)?\s*(.+)$/i;
const LAST_UPDATED_RE = /^(?:\*\*)?Last Updated:(?:\*\*)?\s*(.+)$/i;
const COPYRIGHT_RE = /^©\s*(.+)$/;
const INLINE_TOKEN_RE =
  /(\*\*[^*]+\*\*|https?:\/\/[^\s)<]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;

/**
 * Converts a legal markdown string into a document model.
 *
 * @param markdown - Full markdown source for a legal page
 * @returns Structured document ready for presentation components
 * @throws Error when the document has no title heading
 */
export function parseLegalMarkdown(markdown: string): LegalDocumentModel {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');

  let title: string | null = null;
  let brand: string | null = null;
  let effectiveDate: string | null = null;
  let lastUpdated: string | null = null;
  let copyright: string | null = null;
  const sections: LegalSection[] = [];

  let currentSection: LegalSection | null = null;
  let paragraphBuffer: string[] = [];
  let listBuffer: { ordered: boolean; items: string[] } | null = null;
  let collectingMeta = true;

  const flushParagraph = () => {
    if (!currentSection || paragraphBuffer.length === 0) {
      paragraphBuffer = [];
      return;
    }

    const text = paragraphBuffer.join(' ').trim();
    paragraphBuffer = [];
    if (!text) return;

    currentSection.blocks.push({
      type: 'paragraph',
      segments: parseInlineSegments(text),
    });
  };

  const flushList = () => {
    if (!currentSection || !listBuffer || listBuffer.items.length === 0) {
      listBuffer = null;
      return;
    }

    currentSection.blocks.push({
      type: 'list',
      ordered: listBuffer.ordered,
      items: listBuffer.items.map((item) => parseInlineSegments(item)),
    });
    listBuffer = null;
  };

  const flushBlocks = () => {
    flushParagraph();
    flushList();
  };

  const ensureSection = () => {
    if (currentSection) return;
    currentSection = { number: null, title: 'Overview', blocks: [] };
    sections.push(currentSection);
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushBlocks();
      continue;
    }

    if (trimmed === '---') {
      flushBlocks();
      collectingMeta = false;
      continue;
    }

    const copyrightMatch = trimmed.match(COPYRIGHT_RE);
    if (copyrightMatch) {
      flushBlocks();
      copyright = trimmed;
      continue;
    }

    const headingMatch = trimmed.match(HEADING_RE);
    if (headingMatch) {
      flushBlocks();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();

      if (level === 1) {
        title = headingText;
        collectingMeta = true;
        continue;
      }

      collectingMeta = false;

      if (level === 2) {
        const parsed = parseNumberedTitle(headingText);
        currentSection = {
          number: parsed.number,
          title: parsed.title,
          blocks: [],
        };
        sections.push(currentSection);
        continue;
      }

      ensureSection();
      const parsed = parseNumberedTitle(headingText);
      currentSection!.blocks.push({
        type: 'subheading',
        number: parsed.number,
        title: parsed.title,
      });
      continue;
    }

    if (collectingMeta && !currentSection) {
      const effectiveLoose = trimmed.match(EFFECTIVE_DATE_RE);
      if (effectiveLoose) {
        effectiveDate = stripOuterBold(effectiveLoose[1].trim());
        continue;
      }

      const updatedLoose = trimmed.match(LAST_UPDATED_RE);
      if (updatedLoose) {
        lastUpdated = stripOuterBold(updatedLoose[1].trim());
        continue;
      }

      const metaBold = trimmed.match(META_BOLD_RE);
      if (metaBold && !brand) {
        brand = metaBold[1].trim();
        continue;
      }
    }

    collectingMeta = false;
    ensureSection();

    const unordered = trimmed.match(UNORDERED_LIST_RE);
    if (unordered) {
      flushParagraph();
      if (!listBuffer || listBuffer.ordered) {
        flushList();
        listBuffer = { ordered: false, items: [] };
      }
      listBuffer.items.push(unordered[1].trim());
      continue;
    }

    const ordered = trimmed.match(ORDERED_LIST_RE);
    if (ordered && !trimmed.match(HEADING_RE)) {
      // Avoid treating "1. Title" style prose as lists when it is a heading;
      // headings are already handled above. Ordered list items are plain lines.
      flushParagraph();
      if (!listBuffer || !listBuffer.ordered) {
        flushList();
        listBuffer = { ordered: true, items: [] };
      }
      listBuffer.items.push(ordered[2].trim());
      continue;
    }

    flushList();
    paragraphBuffer.push(trimmed);
  }

  flushBlocks();

  if (!title) {
    throw new Error('Legal markdown must start with a level-1 title heading.');
  }

  return {
    title,
    brand,
    effectiveDate,
    lastUpdated,
    sections,
    copyright,
  };
}

function parseNumberedTitle(text: string): {
  number: string | null;
  title: string;
} {
  // Matches "1. Introduction" and "3.1. Title"
  const withDot = text.match(SECTION_TITLE_WITH_DOT_RE);
  if (withDot) {
    return { number: withDot[1], title: withDot[2].trim() };
  }

  // Matches subsection headings like "3.1 Guest Users"
  const subsection = text.match(SECTION_TITLE_SUBSECTION_RE);
  if (subsection) {
    return { number: subsection[1], title: subsection[2].trim() };
  }

  return { number: null, title: text };
}

function stripOuterBold(value: string): string {
  return value.replace(/^\*\*/, '').replace(/\*\*$/, '').trim();
}

/**
 * Splits a line into text, bold, and link segments for safe React rendering.
 *
 * @param text - Plain markdown inline string
 * @returns Ordered inline segments
 */
export function parseInlineSegments(text: string): InlineSegment[] {
  const segments: InlineSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_TOKEN_RE)) {
    const value = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, index) });
    }

    if (value.startsWith('**') && value.endsWith('**')) {
      segments.push({ type: 'bold', value: value.slice(2, -2) });
    } else if (value.includes('@') && !value.startsWith('http')) {
      segments.push({ type: 'link', href: `mailto:${value}`, value });
    } else {
      const href = value.replace(/[.,;:!?)]+$/, '');
      const trailing = value.slice(href.length);
      segments.push({ type: 'link', href, value: href });
      if (trailing) {
        segments.push({ type: 'text', value: trailing });
      }
    }

    lastIndex = index + value.length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: 'text', value: text }];
}
