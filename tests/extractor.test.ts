import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractPage, toClip } from '~/lib/extractor';
import { resolveSelectionHtml } from '~/lib/selection-workflow/resolve-selection-html';
import { CHAT_READY_PRESET, PRESETS } from '~/lib/presets';
import { stubChromeForSelectionExtract } from './helpers/chrome';

describe('toClip — Chat-ready preset (Slice 1)', () => {
  const html =
    '<p>Hello <a href="https://example.com">link</a> <img src="cat.png" alt="cat"/> world.</p>';
  const rawPage = {
    kind: 'page' as const,
    url: 'https://example.com',
    title: 'Example',
    content: html,
  };

  it('strips <img> tags from output', () => {
    const clip = toClip(rawPage, CHAT_READY_PRESET);
    expect(clip.markdown).not.toContain('cat.png');
    expect(clip.markdown).not.toContain('![');
    expect(clip.markdown).not.toContain('![cat]');
  });

  it('strips <a> tags but keeps anchor text', () => {
    const clip = toClip(rawPage, CHAT_READY_PRESET);
    expect(clip.markdown).not.toContain('https://example.com');
    expect(clip.markdown).not.toContain('](');
    expect(clip.markdown).toContain('link');
  });

  it('keeps surrounding paragraph text', () => {
    const clip = toClip(rawPage, CHAT_READY_PRESET);
    expect(clip.markdown).toContain('Hello');
    expect(clip.markdown).toContain('world');
  });

  it('returns empty string for empty input', () => {
    const rawEmpty = { ...rawPage, content: '' };
    expect(toClip(rawEmpty, CHAT_READY_PRESET).markdown).toBe('');
  });

  it('handles headings', () => {
    const rawHeadings = {
      ...rawPage,
      content: '<h2>Title</h2><p>Body.</p>',
    };
    const clip = toClip(rawHeadings, CHAT_READY_PRESET);
    expect(clip.markdown).toContain('## Title');
    expect(clip.markdown).toContain('Body.');
  });
});

describe('toClip — Preset policies (Slice 4)', () => {
  const html =
    '<p>A <a href="https://x">link</a> and <img src="y" alt="y"/>.</p>';
  const rawPage = {
    kind: 'page' as const,
    url: 'https://example.com',
    title: 'Example',
    content: html,
  };

  it('Reference preset keeps inline links, strips images', () => {
    const clip = toClip(rawPage, PRESETS.reference);
    expect(clip.markdown).not.toContain('![');
    expect(clip.markdown).toContain('[link](https://x)');
  });

  it('Archive preset keeps both image URLs and inline links', () => {
    const clip = toClip(rawPage, PRESETS.archive);
    expect(clip.markdown).toContain('![y](y)');
    expect(clip.markdown).toContain('[link](https://x)');
  });
});

describe('Selection Workflow — toClip (Slice 2)', () => {
  const rawSelection = {
    kind: 'selection' as const,
    url: 'https://example.com',
    title: 'Example',
    html: '',
  };

  it('converts <strong> and <em> inline formatting', () => {
    const raw = {
      ...rawSelection,
      html: '<p>This is <strong>bold</strong> and <em>italic</em>.</p>',
    };
    const clip = toClip(raw, PRESETS['chat-ready']);
    expect(clip.markdown).toContain('**bold**');
    expect(clip.markdown).toContain('_italic_');
  });

  it('preserves <code> inline', () => {
    const raw = {
      ...rawSelection,
      html: '<p>Use <code>npm install</code> to set up.</p>',
    };
    const clip = toClip(raw, PRESETS['chat-ready']);
    expect(clip.markdown).toContain('`npm install`');
  });

  it('preserves <a> as inline Markdown links under Reference preset', () => {
    const raw = {
      ...rawSelection,
      html: '<p>Read <a href="https://example.com">the docs</a>.</p>',
    };
    const clip = toClip(raw, PRESETS.reference);
    expect(clip.markdown).toContain('[the docs](https://example.com)');
  });

  it('strips <a> tags under Chat-ready preset', () => {
    const raw = {
      ...rawSelection,
      html: '<p>Read <a href="https://example.com">the docs</a>.</p>',
    };
    const clip = toClip(raw, PRESETS['chat-ready']);
    expect(clip.markdown).not.toContain('https://example.com');
    expect(clip.markdown).toContain('the docs');
  });

  it('handles nested lists', () => {
    const raw = {
      ...rawSelection,
      html: '<ul><li>One<ul><li>Nested</li></ul></li><li>Two</li></ul>',
    };
    const clip = toClip(raw, PRESETS['chat-ready']);
    expect(clip.markdown).toContain('One');
    expect(clip.markdown).toContain('Nested');
    expect(clip.markdown).toContain('Two');
  });

  it('handles tables via GFM', () => {
    const raw = {
      ...rawSelection,
      html: '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>',
    };
    const clip = toClip(raw, PRESETS['chat-ready']);
    expect(clip.markdown).toContain('| A');
    expect(clip.markdown).toContain('| B');
    expect(clip.markdown).toContain('| 1 |');
    expect(clip.markdown).toContain('| 2 |');
  });
});

describe('Extractor Chrome Integrations', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractPage', () => {
    it('throws error for unsupported URLs', async () => {
      vi.stubGlobal('chrome', {
        tabs: {
          get: vi
            .fn()
            .mockResolvedValue({ url: 'chrome://history', title: 'History' }),
        },
      });

      await expect(extractPage(1)).rejects.toThrow(
        "This page type isn't supported."
      );
    });

    it('throws error for direct PDF URLs', async () => {
      vi.stubGlobal('chrome', {
        tabs: {
          get: vi.fn().mockResolvedValue({
            url: 'https://example.com/file.pdf',
            title: 'PDF',
          }),
        },
      });

      await expect(extractPage(1)).rejects.toThrow(
        "This page type isn't supported."
      );
    });

    it('throws error when Readability returns text length < 100 characters', async () => {
      vi.stubGlobal('chrome', {
        tabs: {
          get: vi.fn().mockResolvedValue({
            url: 'https://example.com',
            title: 'Example',
          }),
        },
        scripting: {
          executeScript: vi.fn().mockResolvedValue([
            {
              result: {
                title: 'Short Page',
                content: '<p>Short</p>',
                textContent: 'Short',
              },
            },
          ]),
        },
      });

      await expect(extractPage(1)).rejects.toThrow(
        "Couldn't extract main content."
      );
    });

    it('successfully extracts raw article info on valid pages', async () => {
      vi.stubGlobal('chrome', {
        tabs: {
          get: vi.fn().mockResolvedValue({
            url: 'https://example.com',
            title: 'Tab Title',
          }),
        },
        scripting: {
          executeScript: vi.fn().mockResolvedValue([
            {
              result: {
                title: 'Article Title',
                content:
                  '<div><p>This is a long body of text that satisfies the 100 character threshold minimum constraint easily and passes successfully.</p></div>',
                textContent:
                  'This is a long body of text that satisfies the 100 character threshold minimum constraint easily and passes successfully.',
                byline: 'Author Name',
                siteName: 'Site Name',
                publishedTime: '2026-06-19T10:00:00Z',
              },
            },
          ]),
        },
      });

      const raw = await extractPage(1);
      expect(raw).toEqual({
        kind: 'page',
        url: 'https://example.com',
        title: 'Article Title',
        content:
          '<div><p>This is a long body of text that satisfies the 100 character threshold minimum constraint easily and passes successfully.</p></div>',
        author: 'Author Name',
        siteName: 'Site Name',
        publishedAt: '2026-06-19T10:00:00Z',
      });
    });
  });

  describe('resolveSelectionHtml', () => {
    it('returns null when no valid selection exists', async () => {
      vi.stubGlobal('chrome', {
        storage: {
          session: { get: vi.fn().mockResolvedValue({}), remove: vi.fn() },
        },
        scripting: {
          executeScript: vi.fn().mockResolvedValue([{ result: null }]),
        },
      });

      const res = await resolveSelectionHtml(1);
      expect(res).toBeNull();
    });

    it('falls back to selectionText when live HTML is gone', async () => {
      stubChromeForSelectionExtract(null);

      const res = await resolveSelectionHtml(1, {
        selectionText: 'hello\n\nworld',
      });

      expect(res).not.toBeNull();
      expect(res!.html).toContain('hello');
      expect(res!.html).toContain('world');
      expect(res!.kind).toBe('selection');
    });

    it('prefers cached HTML over plain-text fallback', async () => {
      const key = 'webtomd-selection-cache:1:0';
      vi.stubGlobal('chrome', {
        tabs: {
          get: vi.fn().mockResolvedValue({
            url: 'https://example.com',
            title: 'Example Tab',
          }),
        },
        storage: {
          session: {
            get: vi
              .fn()
              .mockResolvedValue({ [key]: '<strong>cached</strong>' }),
            remove: vi.fn().mockResolvedValue(undefined),
          },
        },
        scripting: {
          executeScript: vi.fn().mockResolvedValue([{ result: null }]),
        },
      });

      const res = await resolveSelectionHtml(1, {
        selectionText: 'plain only',
      });

      expect(res!.html).toBe('<strong>cached</strong>');
    });

    it('successfully resolves raw selection HTML', async () => {
      vi.stubGlobal('chrome', {
        tabs: {
          get: vi.fn().mockResolvedValue({
            url: 'https://example.com',
            title: 'Example Tab',
          }),
        },
        storage: {
          session: { get: vi.fn().mockResolvedValue({}), remove: vi.fn() },
        },
        scripting: {
          executeScript: vi
            .fn()
            .mockResolvedValue([
              { result: { html: '<strong>hello</strong>' } },
            ]),
        },
      });

      const res = await resolveSelectionHtml(1);
      expect(res).not.toBeNull();
      expect(res!.kind).toBe('selection');
      expect(res!.url).toBe('https://example.com');
      expect(res!.title).toBe('Example Tab');
      expect(res!.html).toBe('<strong>hello</strong>');
    });
  });
});
