import { scriptTarget } from '~/lib/chrome/script-target';

// lib/clipboard — write text to the system clipboard.
//
// The popup writes from an extension page (document + Clipboard API). The
// Selection Workflow writes via the active tab because MV3 service workers
// often lack `document` and may not expose `navigator.clipboard` even with
// `clipboardWrite` — injecting into the tab is the reliable path.

export interface WriteClipboardOptions {
  tabId?: number;
  frameId?: number;
}

export async function writeClipboard(
  text: string,
  options: WriteClipboardOptions = {}
): Promise<void> {
  if (options.tabId != null) {
    await writeClipboardInTab(text, options.tabId, options.frameId);
    return;
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  if (typeof document !== 'undefined') {
    fallbackCopy(text);
    return;
  }
  throw new Error('Clipboard API is not available in this context');
}

export async function writeClipboardInTab(
  text: string,
  tabId: number,
  frameId?: number
): Promise<void> {
  await chrome.scripting.executeScript({
    target: scriptTarget(tabId, frameId),
    func: async (value: string) => {
      await navigator.clipboard.writeText(value);
    },
    args: [text],
    world: 'ISOLATED',
  });
}

function fallbackCopy(text: string): void {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!ok) {
    throw new Error('Clipboard write failed');
  }
}
