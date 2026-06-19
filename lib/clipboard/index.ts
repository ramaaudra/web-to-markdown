// lib/clipboard — write text to the system clipboard.
//
// Used by both the popup (auto-copy on open / tab switch) and the background
// service worker (Selection Workflow). Tries the modern async Clipboard API
// first (extension contexts have user activation by virtue of the user
// gesture — icon click or context-menu click — so this should work without a
// fallback in practice). Falls back to `document.execCommand('copy')` if the
// async API is unavailable (e.g., older browsers).

export async function writeClipboard(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  if (typeof document !== 'undefined') {
    fallbackCopy(text);
    return;
  }
  throw new Error('Clipboard API is not available in service worker context');
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
