// lib/extractor — wraps @mozilla/readability + turndown to produce Web Clips.
//
// Chrome integration (impure):
//   - extractPage(tabId)  → RawPageData (Readability on the active tab)
//
// Pure formatting:
//   - toClip(data, preset) → WebClip (Turndown + metadata envelope)
//   - buildClip(data, preset, markdown) → WebClip (envelope only)
//
// The popup calls `extractPage` then `toClip` in the popup context (has DOM).
// The Selection Workflow resolves HTML in `lib/selection-workflow/` and converts
// in-tab via `convertHtmlInTab` — Turndown cannot run in the service worker.

import type { PageClip, SelectionClip, WebClip } from '~/types/clip';
import { buildClip, toClip } from './build-clip';
import type { RawPageData } from './raw-data';

export type { PageClip, SelectionClip, WebClip };
export type { RawPageData, RawSelectionData } from './raw-data';
export { buildClip, toClip };

/**
 * Path to the runtime-registered content script that runs Readability
 * on the active tab. Bundled to `/content-scripts/extract-page.js` by WXT.
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

/**
 * Detects if a URL is unsupported for extraction (chrome:, edge:, file:, about:, or PDFs).
 */
function isUnsupportedUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase().trim();

  const unsupportedSchemes = ['chrome:', 'edge:', 'file:', 'about:'];
  if (unsupportedSchemes.some((scheme) => lowerUrl.startsWith(scheme))) {
    return true;
  }

  if (
    /\.pdf(\?|#|$)/i.test(lowerUrl) ||
    (lowerUrl.startsWith('chrome-extension://') && lowerUrl.includes('pdf'))
  ) {
    return true;
  }

  return false;
}
