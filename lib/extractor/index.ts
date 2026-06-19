// lib/extractor — wraps @mozilla/readability + turndown to produce Web Clips.
//
// Chrome integration (impure):
//   - extractPage(tabId)       → RawPageData (Readability on the active tab)
//   - extractSelection(tabId)  → RawSelectionData | null (selection HTML)
//
// Pure formatting:
//   - toClip(data, preset)     → WebClip (Turndown + metadata envelope)
//
// The popup calls `extractPage` then `toClip`; the background service worker
// calls `extractSelection` then `toClip` from the context-menu click handler.

import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import type { PageClip, SelectionClip, WebClip } from '~/types/clip';
import type { Preset } from '~/types/preset';

export type { PageClip, SelectionClip, WebClip };

/**
 * Path to the runtime-registered MAIN-world content script that runs Readability
 * on the active tab. Bundled to `/content-scripts/extract-page.js` by WXT.
 * Typed as `ScriptPublicPath` so it satisfies `chrome.scripting.executeScript`.
 */
const EXTRACT_PAGE_SCRIPT = '/content-scripts/extract-page.js' as const;

interface RawArticle {
  title: string | null;
  content: string | null;
  textContent: string | null;
  byline: string | null;
  siteName: string | null;
  publishedTime: string | null;
}

export interface RawPageData {
  readonly kind: 'page';
  readonly url: string;
  readonly title: string;
  readonly content: string;
  readonly siteName?: string;
  readonly author?: string;
  readonly publishedAt?: string;
}

export interface RawSelectionData {
  readonly kind: 'selection';
  readonly url: string;
  readonly title: string;
  readonly html: string;
}

/**
 * Extract raw page data from the active tab.
 * Validates the URL first, runs the extraction script, and enforces text length requirements.
 */
export async function extractPage(tabId: number): Promise<RawPageData> {
  const tab = await chrome.tabs.get(tabId);
  const url = tab.url ?? '';

  if (isUnsupportedUrl(url)) {
    throw new Error("This page type isn't supported.");
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId },
    files: [EXTRACT_PAGE_SCRIPT],
    world: 'ISOLATED',
  });

  const article = results?.[0]?.result as RawArticle | null | undefined;
  if (
    !article ||
    !article.content ||
    !article.textContent ||
    article.textContent.trim().length < 100
  ) {
    throw new Error(
      "Couldn't extract main content. The page might use heavy JavaScript rendering. Try the selection option instead."
    );
  }

  return {
    kind: 'page',
    url,
    title: article.title || tab.title || url,
    siteName: article.siteName ?? undefined,
    author: article.byline ?? undefined,
    publishedAt: article.publishedTime ?? undefined,
    content: article.content,
  };
}

interface SelectionResult {
  html: string;
}

/**
 * Extract raw text selection HTML from the active tab.
 * Returns null if no valid selection is found.
 */
export async function extractSelection(
  tabId: number
): Promise<RawSelectionData | null> {
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
    world: 'ISOLATED',
  });

  const result = results?.[0]?.result;
  if (!result || !result.html.trim()) return null;

  const tab = await chrome.tabs.get(tabId);
  const url = tab.url ?? '';

  return {
    kind: 'selection',
    url,
    title: tab.title ?? url,
    html: result.html,
  };
}

/**
 * Pure function to format raw page or selection data into a standardized WebClip.
 */
export function toClip(
  data: RawPageData | RawSelectionData,
  preset: Preset
): WebClip {
  const markdown = htmlToMarkdown(
    data.kind === 'page' ? data.content : data.html,
    preset
  );

  const fetchedAt = new Date().toISOString();

  return data.kind === 'page'
    ? {
        kind: 'page',
        url: data.url,
        title: data.title,
        siteName: data.siteName,
        author: data.author,
        publishedAt: data.publishedAt,
        markdown,
        fetchedAt,
      }
    : {
        kind: 'selection',
        url: data.url,
        title: data.title,
        markdown,
        fetchedAt,
      };
}

/**
 * Convert HTML to Markdown with a Preset's image/link policy applied.
 * Pure internal function.
 */
function htmlToMarkdown(html: string, preset: Preset): string {
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

/**
 * Detects if a URL is unsupported for extraction (chrome:, edge:, file:, about:, or PDFs).
 * Pure internal function.
 */
function isUnsupportedUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase().trim();

  const unsupportedSchemes = ['chrome:', 'edge:', 'file:', 'about:'];
  if (unsupportedSchemes.some((scheme) => lowerUrl.startsWith(scheme))) {
    return true;
  }

  // Detect direct PDF URLs or chrome extension PDF viewer
  if (
    /\.pdf(\?|#|$)/i.test(lowerUrl) ||
    (lowerUrl.startsWith('chrome-extension://') && lowerUrl.includes('pdf'))
  ) {
    return true;
  }

  return false;
}
