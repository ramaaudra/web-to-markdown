import { describe, it, expect } from 'vitest';
import {
  serializeYamlValue,
  formatPublicationDate,
  serializeFrontmatter,
  formatClip,
} from '~/lib/frontmatter';
import type { WebClip } from '~/types/clip';
import type { Preset } from '~/types/preset';

describe('YAML serialization helpers', () => {
  describe('serializeYamlValue', () => {
    it('does not quote simple strings', () => {
      expect(serializeYamlValue('Hello World')).toBe('Hello World');
      expect(serializeYamlValue('https://example.com/page?id=123')).toBe(
        'https://example.com/page?id=123',
      );
    });

    it('quotes strings with colons followed by space', () => {
      expect(serializeYamlValue('My Title: Subtitle')).toBe('"My Title: Subtitle"');
    });

    it('quotes strings with leading or trailing whitespace', () => {
      expect(serializeYamlValue(' leading')).toBe('" leading"');
      expect(serializeYamlValue('trailing ')).toBe('"trailing "');
    });

    it('quotes empty strings', () => {
      expect(serializeYamlValue('')).toBe('""');
    });

    it('quotes special characters at the start of string', () => {
      expect(serializeYamlValue('@author')).toBe('"@author"');
      expect(serializeYamlValue('- item')).toBe('"- item"');
      expect(serializeYamlValue('#hashtag')).toBe('"#hashtag"');
      expect(serializeYamlValue('`code`')).toBe('"`code`"');
    });

    it('quotes strings that look like booleans, null, or numbers', () => {
      expect(serializeYamlValue('true')).toBe('"true"');
      expect(serializeYamlValue('false')).toBe('"false"');
      expect(serializeYamlValue('null')).toBe('"null"');
      expect(serializeYamlValue('12345')).toBe('"12345"');
      expect(serializeYamlValue('-12.34')).toBe('"-12.34"');
    });

    it('handles quotes and backslashes by JSON escaping', () => {
      expect(serializeYamlValue('Hello "World"')).toBe('"Hello \\"World\\""');
      expect(serializeYamlValue('path\\to\\file')).toBe('"path\\\\to\\\\file"');
    });

    it('handles newlines', () => {
      expect(serializeYamlValue('Line 1\nLine 2')).toBe('"Line 1\\nLine 2"');
    });
  });

  describe('formatPublicationDate', () => {
    it('returns YYYY-MM-DD for standard ISO timestamp', () => {
      expect(formatPublicationDate('2023-10-27T12:34:56Z')).toBe('2023-10-27');
      expect(formatPublicationDate('2023-10-27T00:00:00-05:00')).toBe('2023-10-27');
    });

    it('returns YYYY-MM-DD directly if matching regex', () => {
      expect(formatPublicationDate('2023-10-27')).toBe('2023-10-27');
      expect(formatPublicationDate('2023-10-27 12:00:00')).toBe('2023-10-27');
    });

    it('parses other date strings and returns UTC date', () => {
      // October 27, 2023 UTC
      expect(formatPublicationDate('October 27, 2023')).toBe('2023-10-27');
    });

    it('returns undefined for invalid or empty dates', () => {
      expect(formatPublicationDate('')).toBeUndefined();
      expect(formatPublicationDate('not a date')).toBeUndefined();
    });
  });
});

describe('serializeFrontmatter', () => {
  const requiredOnly = {
    url: 'https://example.com',
    title: 'Example Title',
    fetched_at: '2026-06-19T10:54:38.000Z',
  };

  it('renders correctly with only required fields (no optional fields)', () => {
    const yaml = serializeFrontmatter(requiredOnly);
    expect(yaml).toMatchInlineSnapshot(`
      "---
      url: https://example.com
      title: Example Title
      fetched_at: 2026-06-19T10:54:38.000Z
      ---"
    `);
  });

  it('renders correctly with all fields present', () => {
    const allFields = {
      ...requiredOnly,
      date: '2026-06-19T10:00:00Z',
      author: 'John Doe',
      site_name: 'Example Site',
    };
    const yaml = serializeFrontmatter(allFields);
    expect(yaml).toMatchInlineSnapshot(`
      "---
      url: https://example.com
      title: Example Title
      fetched_at: 2026-06-19T10:54:38.000Z
      date: 2026-06-19
      author: John Doe
      site_name: Example Site
      ---"
    `);
  });

  it('renders correctly with mixed required and optional fields', () => {
    const mixedFields = {
      ...requiredOnly,
      site_name: 'Example Site', // author and date are missing
    };
    const yaml = serializeFrontmatter(mixedFields);
    expect(yaml).toMatchInlineSnapshot(`
      "---
      url: https://example.com
      title: Example Title
      fetched_at: 2026-06-19T10:54:38.000Z
      site_name: Example Site
      ---"
    `);
  });

  it('escapes special characters correctly in frontmatter fields', () => {
    const specialFields = {
      url: 'https://example.com/search?q=a:b',
      title: 'Title: Subtitle with @character',
      fetched_at: '2026-06-19T10:54:38.000Z',
      author: 'Doe, John & Co.',
      site_name: 'Super "Site"',
    };
    const yaml = serializeFrontmatter(specialFields);
    expect(yaml).toMatchInlineSnapshot(`
      "---
      url: https://example.com/search?q=a:b
      title: "Title: Subtitle with @character"
      fetched_at: 2026-06-19T10:54:38.000Z
      author: Doe, John & Co.
      site_name: "Super \\"Site\\""
      ---"
    `);
  });
});

describe('formatClip', () => {
  const pageClip: WebClip = {
    kind: 'page',
    url: 'https://example.com/article',
    title: 'Great Article',
    siteName: 'News Site',
    author: 'Jane Smith',
    publishedAt: '2025-12-25T08:00:00Z',
    fetchedAt: '2026-06-19T10:54:38.000Z',
    markdown: '# Great Article\n\nContent goes here.',
  };

  const selectionClip: WebClip = {
    kind: 'selection',
    url: 'https://example.com/article',
    title: 'Great Article',
    fetchedAt: '2026-06-19T10:54:38.000Z',
    markdown: 'Selected text paragraph.',
  };

  const presetWithFrontmatter: Preset = {
    id: 'chat-ready',
    label: 'Chat-ready',
    description: 'test',
    imagePolicy: 'strip',
    linkPolicy: 'strip',
    frontmatter: true,
  };

  const presetWithoutFrontmatter: Preset = {
    id: 'chat-ready',
    label: 'Chat-ready',
    description: 'test',
    imagePolicy: 'strip',
    linkPolicy: 'strip',
    frontmatter: false,
  };

  it('returns raw markdown when frontmatter is disabled', () => {
    expect(formatClip(pageClip, presetWithoutFrontmatter)).toBe(pageClip.markdown);
    expect(formatClip(selectionClip, presetWithoutFrontmatter)).toBe(
      selectionClip.markdown,
    );
  });

  it('prepends frontmatter when frontmatter is enabled (Page Clip)', () => {
    const formatted = formatClip(pageClip, presetWithFrontmatter);
    expect(formatted).toMatchInlineSnapshot(`
      "---
      url: https://example.com/article
      title: Great Article
      fetched_at: 2026-06-19T10:54:38.000Z
      date: 2025-12-25
      author: Jane Smith
      site_name: News Site
      ---
      # Great Article

      Content goes here."
    `);
  });

  it('prepends frontmatter when frontmatter is enabled (Selection Clip - with no author/site/date)', () => {
    const formatted = formatClip(selectionClip, presetWithFrontmatter);
    expect(formatted).toMatchInlineSnapshot(`
      "---
      url: https://example.com/article
      title: Great Article
      fetched_at: 2026-06-19T10:54:38.000Z
      ---
      Selected text paragraph."
    `);
  });
});
