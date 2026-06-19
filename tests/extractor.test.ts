import { describe, it, expect } from 'vitest';
import { htmlToMarkdown } from '~/lib/extractor';
import { CHAT_READY_PRESET, PRESETS } from '~/lib/presets';

describe('htmlToMarkdown (Chat-ready preset — Slice 1)', () => {
  const html =
    '<p>Hello <a href="https://example.com">link</a> <img src="cat.png" alt="cat"/> world.</p>';

  it('strips <img> tags from output', () => {
    const md = htmlToMarkdown(html, CHAT_READY_PRESET);
    expect(md).not.toContain('cat.png');
    expect(md).not.toContain('![');
    expect(md).not.toContain('![cat]');
  });

  it('strips <a> tags but keeps anchor text', () => {
    const md = htmlToMarkdown(html, CHAT_READY_PRESET);
    expect(md).not.toContain('https://example.com');
    expect(md).not.toContain('](');
    expect(md).toContain('link');
  });

  it('keeps surrounding paragraph text', () => {
    const md = htmlToMarkdown(html, CHAT_READY_PRESET);
    expect(md).toContain('Hello');
    expect(md).toContain('world');
  });

  it('returns empty string for empty input', () => {
    expect(htmlToMarkdown('', CHAT_READY_PRESET)).toBe('');
  });

  it('handles headings', () => {
    const md = htmlToMarkdown('<h2>Title</h2><p>Body.</p>', CHAT_READY_PRESET);
    expect(md).toContain('## Title');
    expect(md).toContain('Body.');
  });
});

describe('htmlToMarkdown (Preset policies)', () => {
  const html = '<p>A <a href="https://x">link</a> and <img src="y" alt="y"/>.</p>';

  it('Reference preset keeps inline links, strips images', () => {
    const md = htmlToMarkdown(html, PRESETS.reference);
    expect(md).not.toContain('![');
    expect(md).toContain('[link](https://x)');
  });

  it('Archive preset keeps both image URLs and inline links', () => {
    const md = htmlToMarkdown(html, PRESETS.archive);
    expect(md).toContain('![y](y)');
    expect(md).toContain('[link](https://x)');
  });
});