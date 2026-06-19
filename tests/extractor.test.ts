import { describe, it, expect } from 'vitest';
import { htmlToMarkdown } from '~/lib/extractor';
import { CHAT_READY_PRESET, PRESETS } from '~/lib/presets';

describe('htmlToMarkdown — Chat-ready preset (Slice 1)', () => {
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

describe('htmlToMarkdown — Preset policies (Slice 4)', () => {
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

describe('Selection Workflow — HTML to Markdown (Slice 2)', () => {
  it('converts <strong> and <em> inline formatting', () => {
    const html = '<p>This is <strong>bold</strong> and <em>italic</em>.</p>';
    const md = htmlToMarkdown(html, PRESETS['chat-ready']);
    expect(md).toContain('**bold**');
    expect(md).toContain('_italic_');
  });

  it('preserves <code> inline', () => {
    const html = '<p>Use <code>npm install</code> to set up.</p>';
    const md = htmlToMarkdown(html, PRESETS['chat-ready']);
    expect(md).toContain('`npm install`');
  });

  it('preserves <a> as inline Markdown links under Reference preset', () => {
    const html = '<p>Read <a href="https://example.com">the docs</a>.</p>';
    const md = htmlToMarkdown(html, PRESETS.reference);
    expect(md).toContain('[the docs](https://example.com)');
  });

  it('strips <a> tags under Chat-ready preset', () => {
    const html = '<p>Read <a href="https://example.com">the docs</a>.</p>';
    const md = htmlToMarkdown(html, PRESETS['chat-ready']);
    expect(md).not.toContain('https://example.com');
    expect(md).toContain('the docs');
  });

  it('handles nested lists', () => {
    const html = '<ul><li>One<ul><li>Nested</li></ul></li><li>Two</li></ul>';
    const md = htmlToMarkdown(html, PRESETS['chat-ready']);
    expect(md).toContain('One');
    expect(md).toContain('Nested');
    expect(md).toContain('Two');
  });

  it('handles tables via GFM', () => {
    const html =
      '<table><thead><tr><th>A</th><th>B</th></tr></thead><tbody><tr><td>1</td><td>2</td></tr></tbody></table>';
    const md = htmlToMarkdown(html, PRESETS['chat-ready']);
    expect(md).toContain('| A');
    expect(md).toContain('| B');
    expect(md).toContain('| 1 |');
    expect(md).toContain('| 2 |');
  });
});