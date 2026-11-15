import { describe, expect, it } from 'vitest';

import {
  parseInlineSegments,
  parseLegalMarkdown,
} from '@/lib/legal/parse-legal-markdown';

describe('parseLegalMarkdown', () => {
  it('parses title, brand, dates, numbered sections, lists, and copyright', () => {
    const document = parseLegalMarkdown(`# Terms of Service

**Sa Kyi Health & Wellness**

**Effective Date:** November 15, 2026
**Last Updated:** November 15, 2026

## 1. Introduction

Welcome to Sa Kyi.

We offer:

- Nutrition guidance.
- Exercise support.

## 2. Enrollment

The process may include:

1. Submit a request.
2. Complete consultation.

### 2.1 Guest Users

Guest users can browse programs.

---

© 2026 Sa Kyi Health & Wellness. All rights reserved.
`);

    expect(document.title).toBe('Terms of Service');
    expect(document.brand).toBe('Sa Kyi Health & Wellness');
    expect(document.effectiveDate).toBe('November 15, 2026');
    expect(document.lastUpdated).toBe('November 15, 2026');
    expect(document.copyright).toContain('© 2026');
    expect(document.sections).toHaveLength(2);

    expect(document.sections[0]).toMatchObject({
      number: '1',
      title: 'Introduction',
    });
    expect(document.sections[0].blocks[0]).toEqual({
      type: 'paragraph',
      segments: [{ type: 'text', value: 'Welcome to Sa Kyi.' }],
    });
    expect(document.sections[0].blocks[2]).toMatchObject({
      type: 'list',
      ordered: false,
    });

    expect(document.sections[1].blocks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'list', ordered: true }),
        expect.objectContaining({
          type: 'subheading',
          number: '2.1',
          title: 'Guest Users',
        }),
      ]),
    );
  });

  it('parses subsection headings without a trailing period after the number', () => {
    const document = parseLegalMarkdown(`# Privacy Policy

## 3. Information We Collect

### 3.1 Personal and Account Information

We may collect your name.
`);

    expect(document.sections[0].blocks[0]).toEqual({
      type: 'subheading',
      number: '3.1',
      title: 'Personal and Account Information',
    });
  });

  it('parses fully bold disclaimer date lines', () => {
    const document = parseLegalMarkdown(`# Health & Wellness Disclaimer

**Sa Kyi Health & Wellness**
**Effective Date: November 15, 2026**
**Last Updated: November 15, 2026**

## 1. General Information

Sa Kyi provides wellness programs.
`);

    expect(document.effectiveDate).toBe('November 15, 2026');
    expect(document.lastUpdated).toBe('November 15, 2026');
    expect(document.sections[0].title).toBe('General Information');
  });

  it('throws when the document has no level-1 title', () => {
    expect(() =>
      parseLegalMarkdown(`## 1. Missing Title

Content only.
`),
    ).toThrow('Legal markdown must start with a level-1 title heading.');
  });

  it('keeps empty documents with only a title valid and sectionless', () => {
    const document = parseLegalMarkdown('# Privacy Policy\n');

    expect(document.title).toBe('Privacy Policy');
    expect(document.sections).toEqual([]);
    expect(document.effectiveDate).toBeNull();
  });
});

describe('parseInlineSegments', () => {
  it('splits bold text, emails, and urls', () => {
    expect(
      parseInlineSegments(
        'Contact **Sa Kyi** at team@example.com or https://example.com/path.',
      ),
    ).toEqual([
      { type: 'text', value: 'Contact ' },
      { type: 'bold', value: 'Sa Kyi' },
      { type: 'text', value: ' at ' },
      {
        type: 'link',
        href: 'mailto:team@example.com',
        value: 'team@example.com',
      },
      { type: 'text', value: ' or ' },
      {
        type: 'link',
        href: 'https://example.com/path',
        value: 'https://example.com/path',
      },
      { type: 'text', value: '.' },
    ]);
  });

  it('returns a single text segment when no tokens exist', () => {
    expect(parseInlineSegments('Plain text only')).toEqual([
      { type: 'text', value: 'Plain text only' },
    ]);
  });

  it('handles empty input as a text segment', () => {
    expect(parseInlineSegments('')).toEqual([{ type: 'text', value: '' }]);
  });
});
