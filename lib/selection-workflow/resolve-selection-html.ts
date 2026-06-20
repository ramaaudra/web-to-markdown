// Selection HTML capture, cache, and resolve — one module for the full pipeline.

import { scriptTarget } from '~/lib/chrome/script-target';
import type { RawSelectionData } from '~/lib/extractor/raw-data';
import { readSelectionHtmlFromPage } from '~/lib/extractor/read-selection-html';

export const SELECTION_CACHE_KEY_PREFIX = 'webtomd-selection-cache';

function selectionCacheKey(tabId: number, frameId: number): string {
  return `${SELECTION_CACHE_KEY_PREFIX}:${tabId}:${frameId}`;
}

/** Wrap plain selection text as minimal HTML for Turndown. */
function selectionTextAsHtml(text: string): string {
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const paragraphs = escaped
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br>')}</p>`)
    .join('');
  return paragraphs || `<p>${escaped}</p>`;
}

async function readLiveSelectionHtml(
  tabId: number,
  frameId: number
): Promise<string | null> {
  const results = await chrome.scripting.executeScript<
    [],
    { html: string } | null
  >({
    target: scriptTarget(tabId, frameId),
    func: readSelectionHtmlFromPage,
    world: 'ISOLATED',
  });

  return results?.[0]?.result?.html?.trim() || null;
}

/**
 * Cache selection HTML while the context menu is open — before the click collapses it.
 */
export async function captureSelectionHtml(
  tabId: number,
  frameId = 0
): Promise<void> {
  const html = await readLiveSelectionHtml(tabId, frameId);
  if (!html) return;

  await chrome.storage.session.set({
    [selectionCacheKey(tabId, frameId)]: html,
  });
}

/** Read and remove cached selection HTML for a tab frame. */
export async function consumeSelectionHtml(
  tabId: number,
  frameId = 0
): Promise<string | null> {
  const key = selectionCacheKey(tabId, frameId);
  const data = await chrome.storage.session.get(key);
  const html = data[key] as string | undefined;
  if (!html) return null;
  await chrome.storage.session.remove(key);
  return html;
}

export interface ResolveSelectionHtmlOptions {
  frameId?: number;
  selectionText?: string;
}

/**
 * Resolve selection HTML from live DOM, session cache, or plain-text fallback.
 * Returns null when no usable selection exists.
 */
export async function resolveSelectionHtml(
  tabId: number,
  options: ResolveSelectionHtmlOptions = {}
): Promise<RawSelectionData | null> {
  const frameId = options.frameId ?? 0;
  const cachedHtml = await consumeSelectionHtml(tabId, frameId);
  const liveHtml = await readLiveSelectionHtml(tabId, frameId);
  const fallbackText = options.selectionText?.trim();
  const html = liveHtml || cachedHtml;

  if (!html && !fallbackText) return null;

  const tab = await chrome.tabs.get(tabId);
  const url = tab.url ?? '';
  const title = tab.title ?? url;

  return {
    kind: 'selection',
    url,
    title,
    html: html || selectionTextAsHtml(fallbackText!),
  };
}
