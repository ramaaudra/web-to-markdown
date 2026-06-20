import { scriptTarget } from '~/lib/chrome/script-target';

// lib/toast — Shadow DOM toast injection for the Selection Workflow.
//
// Injects a small banner into the active tab's DOM using a closed Shadow Root
// so page CSS can't bleed in (and our CSS can't bleed out). Auto-dismisses
// after a configurable timeout; cleans up on its own.
//
// `chrome.scripting.executeScript({ func })` only serializes the one function
// passed in — helpers defined in the module are not available in the tab.
// Keep all injected logic inside `injectToastInPage`.

const DEFAULT_DURATION_MS = 2500;

export interface ShowToastOptions {
  /** Auto-dismiss timeout in milliseconds. Default 2500. */
  durationMs?: number;
  /** Estimated token count shown as a subline on success toasts. */
  tokenCount?: number;
  /** Frame to inject into when the selection lived in an iframe. */
  frameId?: number;
}

/**
 * Self-contained function injected into the tab. Must not call module-scope helpers.
 */
export function injectToastInPage(
  message: string,
  durationMs: number,
  tokenCount: number | null
): void {
  const hostId = 'webtomd-toast-host';

  let host = document.getElementById(hostId) as HTMLDivElement | null;
  if (!host) {
    host = document.createElement('div');
    host.id = hostId;
    host.style.position = 'fixed';
    host.style.bottom = '20px';
    host.style.right = '20px';
    host.style.zIndex = '2147483647';
    host.style.pointerEvents = 'none';
    document.documentElement.appendChild(host);
  }

  const root =
    host.shadowRoot ?? host.attachShadow({ mode: 'closed' as const });
  root.replaceChildren();

  const style = document.createElement('style');
  style.textContent = `
    .toast {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px 16px;
      border-radius: 10px;
      background: rgba(22, 26, 24, 0.92);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
      pointer-events: auto;
      max-width: 280px;
      opacity: 1;
      transform: translateY(0);
    }

    .toast-message {
      font: 600 13px/1.4 ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
      color: #4ade80;
    }

    .toast-tokens {
      font: 500 11px/1.4 ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
      color: #86efac;
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

  window.setTimeout(() => {
    host?.remove();
  }, durationMs);
}

/**
 * Inject a Shadow DOM toast into the given tab.
 */
export async function showToast(
  tabId: number,
  message: string,
  options: ShowToastOptions = {}
): Promise<void> {
  const durationMs = options.durationMs ?? DEFAULT_DURATION_MS;
  const tokenCount = options.tokenCount;

  await chrome.scripting.executeScript({
    target: scriptTarget(tabId, options.frameId),
    func: injectToastInPage,
    args: [message, durationMs, tokenCount ?? null],
    world: 'ISOLATED',
  });
}
