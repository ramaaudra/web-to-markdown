// lib/extractor — wraps @mozilla/readability + turndown to produce Web Clips.
//
// Two entry points:
//   - extractPage(tabId)  → PageClip (Readability + Turndown for the whole page)
//   - extractSelection(tabId) → SelectionClip (Turndown on selection HTML only)
//
// The popup calls `extractPage`; the background service worker calls
// `extractSelection` from the context-menu click handler. Both use Turndown
// with a Preset policy applied (Slice 4 introduces the Preset registry; Slice
// 1 ships a hardcoded Chat-ready policy).
//
// `htmlToMarkdown(html, preset)` is the pure, testable core: it takes HTML
// and a Preset and returns Markdown. Slice 1's test seam.

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import type { PageClip, SelectionClip } from '~/types/clip';
import type { Preset } from '~/types/preset';

export type { PageClip, SelectionClip };

/**
 * Path to the runtime-registered MAIN-world content script that runs Readability
 * on the active tab. Bundled to `/content-scripts/extract-page.js` by WXT.
 * Typed as `ScriptPublicPath` so it satisfies `chrome.scripting.executeScript`.
 */
const EXTRACT_PAGE_SCRIPT = '/content-scripts/extract-page.js' as const;

interface RawArticle {
  title: string | null;
  content: string | null;
  byline: string | null;
  siteName: string | null;
  publishedTime: string | null;
}

/**
 * Extract the active tab's main content as a PageClip.
 *
 * Runs the MAIN-world Readability script, then converts the resulting HTML
 * to Markdown with the supplied Preset policy applied.
 */
export async function extractPage(
  tabId: number,
  preset: Preset,
): Promise<PageClip> {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    files: [EXTRACT_PAGE_SCRIPT],
    world: 'MAIN',
  });

  const article = results?.[0]?.result as RawArticle | null | undefined;
  if (!article || !article.content) {
    throw new Error('Readability returned no content');
  }

  const tab = await chrome.tabs.get(tabId);
  const url = tab.url ?? '';

  return {
    kind: 'page',
    url,
    title: article.title || tab.title || url,
    siteName: article.siteName ?? undefined,
    author: article.byline ?? undefined,
    publishedAt: article.publishedTime ?? undefined,
    markdown: htmlToMarkdown(article.content, preset),
    fetchedAt: new Date().toISOString(),
  };
}

interface SelectionResult {
  html: string;
}

/**
 * Extract the user's current text selection on the active tab as a SelectionClip.
 *
 * Reads the selection's HTML fragment directly (no Readability — the user has
 * already chosen the relevant content) and converts to Markdown with the
 * supplied Preset policy applied.
 */
export async function extractSelection(
  tabId: number,
  preset: Preset,
): Promise<SelectionClip | null> {
  const results = await chrome.scripting.executeScript<
    [],
    SelectionResult | null
  >({
    target: { tabId },
    func: () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;
      const range = selection.getRangeAt(0);
      if (range.collapsed) return null;
      const container = document.createElement('div');
      container.appendChild(range.cloneContents());
      return { html: container.innerHTML };
    },
    world: 'MAIN',
  });

  const result = results?.[0]?.result;
  if (!result || !result.html.trim()) return null;

  const tab = await chrome.tabs.get(tabId);
  const url = tab.url ?? '';

  return {
    kind: 'selection',
    url,
    title: tab.title ?? url,
    markdown: htmlToMarkdown(result.html, preset),
  };
}

/**
 * Convert HTML to Markdown with a Preset's image/link policy applied.
 *
 * Pure function — the primary test seam for Slice 1 and Slice 4.
 */
export function htmlToMarkdown(html: string, preset: Preset): string {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
  });
  td.use(gfm);

  if (preset.imagePolicy === 'strip') {
    td.addRule('strip-images', {
      filter: 'img',
      replacement: () => '',
    });
  }

  if (preset.linkPolicy === 'strip') {
    td.addRule('strip-links', {
      filter: 'a',
      replacement: (content) => content,
    });
  }

  return td.turndown(html);
}