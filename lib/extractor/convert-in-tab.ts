import { scriptTarget } from '~/lib/chrome/script-target';
import type { Preset } from '~/types/preset';

/**
 * Runtime content script that registers Turndown in the tab's isolated world.
 * Bundled to `/content-scripts/selection-convert.js` by WXT.
 */
const SELECTION_CONVERT_SCRIPT =
  '/content-scripts/selection-convert.js' as const;

type ConvertHtmlFn = (html: string, preset: Preset) => string;

export interface ConvertHtmlInTabParams {
  tabId: number;
  html: string;
  preset: Preset;
  frameId?: number;
}

/**
 * Convert HTML to Markdown inside the active tab — Turndown needs `document`,
 * which is unavailable in the MV3 service worker.
 */
export async function convertHtmlInTab({
  tabId,
  html,
  preset,
  frameId = 0,
}: ConvertHtmlInTabParams): Promise<string> {
  const results = await chrome.scripting.executeScript({
    target: scriptTarget(tabId, frameId),
    files: [SELECTION_CONVERT_SCRIPT],
    func: (value: string, opts: Preset) => {
      const convert = (
        globalThis as typeof globalThis & {
          __webtomd_convertHtml?: ConvertHtmlFn;
        }
      ).__webtomd_convertHtml;
      if (!convert) {
        throw new Error('WebToMD converter not loaded');
      }
      return convert(value, opts);
    },
    args: [html, preset],
    world: 'ISOLATED',
  } as unknown as chrome.scripting.ScriptInjection<[string, Preset], string>);

  const markdown = results?.[0]?.result;
  if (typeof markdown !== 'string') {
    throw new Error('HTML to Markdown conversion failed');
  }
  return markdown;
}
