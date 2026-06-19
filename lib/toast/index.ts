// lib/toast — Shadow DOM toast injection for the Selection Workflow.
//
// Injects a small banner into the active tab's DOM using a closed Shadow Root
// so page CSS can't bleed in (and our CSS can't bleed out). Auto-dismisses
// after a configurable timeout; cleans up on its own.

const TOAST_HOST_ID = 'webtomd-toast-host';

interface ShowToastOptions {
  /** Auto-dismiss timeout in milliseconds. Default 2000. */
  durationMs?: number;
}

/**
 * Inject a Shadow DOM toast into the given tab. The injected function lives
 * in the page context so it can touch `document` directly.
 */
export async function showToast(
  tabId: number,
  message: string,
  options: ShowToastOptions = {}
): Promise<void> {
  const durationMs = options.durationMs ?? 2000;
  await chrome.scripting.executeScript({
    target: { tabId },
    func: injectToast,
    args: [message, durationMs],
    world: 'ISOLATED',
  });
}

export async function dismissToast(tabId: number): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: removeToastHost,
    world: 'ISOLATED',
  });
}

/* ------------------------------------------------------------------ */
/* Injected (page-context) helpers. These run inside the active tab.   */
/* ------------------------------------------------------------------ */

interface ToastHost extends HTMLDivElement {
  __shadowRoot: ShadowRoot;
}

function injectToast(message: string, durationMs: number): void {
  const host = ensureHost();
  renderToast(host, message);
  window.setTimeout(() => fadeAndRemove(host), durationMs);
}

function ensureHost(): ToastHost {
  const existing = document.getElementById(TOAST_HOST_ID) as ToastHost | null;
  if (existing) return existing;

  const host = document.createElement('div') as ToastHost;
  host.id = TOAST_HOST_ID;
  host.style.position = 'fixed';
  host.style.top = '16px';
  host.style.right = '16px';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';

  const root = host.attachShadow({ mode: 'closed' });
  host.__shadowRoot = root;

  document.documentElement.appendChild(host);
  return host;
}

function renderToast(host: ToastHost, message: string): void {
  const root = host.__shadowRoot;
  root.replaceChildren();

  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.font =
    "500 13px/1.4 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  toast.style.color = '#ffffff';
  toast.style.background = 'rgba(31, 35, 40, 0.94)';
  toast.style.padding = '10px 14px';
  toast.style.borderRadius = '8px';
  toast.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.18)';
  toast.style.pointerEvents = 'auto';
  toast.style.maxWidth = '320px';
  toast.style.wordBreak = 'break-word';
  toast.style.opacity = '0';
  toast.style.transition = 'opacity 160ms ease-out';

  root.appendChild(toast);

  void toast.offsetWidth;
  toast.style.opacity = '1';
}

function fadeAndRemove(host: ToastHost): void {
  const root = host.__shadowRoot;
  const toast = root.firstElementChild as HTMLElement | null;
  if (!toast) {
    host.remove();
    return;
  }
  toast.style.opacity = '0';
  window.setTimeout(() => {
    root.replaceChildren();
    host.remove();
  }, 200);
}

function removeToastHost(): void {
  const host = document.getElementById(TOAST_HOST_ID);
  host?.remove();
}
