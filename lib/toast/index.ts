// lib/toast — Shadow DOM toast injection for the Selection Workflow.
//
// Injects a small banner into the active tab's DOM using a closed Shadow Root
// so page CSS can't bleed in (and our CSS can't bleed out). Auto-dismisses
// after a configurable timeout; cleans up on its own.

const TOAST_HOST_ID = 'webtomd-toast-host';
const DEFAULT_DURATION_MS = 2500;

export interface ShowToastOptions {
  /** Auto-dismiss timeout in milliseconds. Default 2500. */
  durationMs?: number;
  /** Estimated token count shown as a subline on success toasts. */
  tokenCount?: number;
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
  const durationMs = options.durationMs ?? DEFAULT_DURATION_MS;
  const tokenCount = options.tokenCount;
  await chrome.scripting.executeScript({
    target: { tabId },
    func: injectToast,
    args: [message, durationMs, tokenCount ?? null],
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

function injectToast(
  message: string,
  durationMs: number,
  tokenCount: number | null
): void {
  const host = ensureHost();
  renderToast(host, message, tokenCount);
  window.setTimeout(() => fadeAndRemove(host), durationMs);
}

function ensureHost(): ToastHost {
  const existing = document.getElementById(TOAST_HOST_ID) as ToastHost | null;
  if (existing) return existing;

  const host = document.createElement('div') as ToastHost;
  host.id = TOAST_HOST_ID;
  host.style.position = 'fixed';
  host.style.bottom = '20px';
  host.style.right = '20px';
  host.style.zIndex = '2147483647';
  host.style.pointerEvents = 'none';

  const root = host.attachShadow({ mode: 'closed' });
  host.__shadowRoot = root;

  document.documentElement.appendChild(host);
  return host;
}

function renderToast(
  host: ToastHost,
  message: string,
  tokenCount: number | null
): void {
  const root = host.__shadowRoot;
  root.replaceChildren();

  const style = document.createElement('style');
  style.textContent = `
    .toast {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 16px;
      border-radius: 10px;
      background: rgba(22, 26, 24, 0.82);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
      pointer-events: auto;
      max-width: 280px;
      opacity: 0;
      transform: translateY(8px);
      transition:
        opacity 180ms ease-out,
        transform 180ms ease-out;
    }

    .toast.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .toast.leaving {
      opacity: 0;
      transform: translateY(8px);
    }

    .toast-message {
      font: 600 13px/1.4 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
      color: oklch(0.72 0.14 155);
    }

    .toast-tokens {
      font: 500 11px/1.4 ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
      color: oklch(0.62 0.02 155);
    }
  `;

  const toast = document.createElement('div');
  toast.className = 'toast';

  const messageEl = document.createElement('div');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;
  toast.appendChild(messageEl);

  if (tokenCount !== null) {
    const tokensEl = document.createElement('div');
    tokensEl.className = 'toast-tokens';
    tokensEl.textContent = `~${tokenCount.toLocaleString('en-US')} tokens`;
    toast.appendChild(tokensEl);
  }

  root.appendChild(style);
  root.appendChild(toast);

  void toast.offsetWidth;
  toast.classList.add('visible');
}

function fadeAndRemove(host: ToastHost): void {
  const root = host.__shadowRoot;
  const toast = root.querySelector('.toast') as HTMLElement | null;
  if (!toast) {
    host.remove();
    return;
  }
  toast.classList.remove('visible');
  toast.classList.add('leaving');
  window.setTimeout(() => {
    root.replaceChildren();
    host.remove();
  }, 200);
}

function removeToastHost(): void {
  const host = document.getElementById(TOAST_HOST_ID);
  host?.remove();
}
