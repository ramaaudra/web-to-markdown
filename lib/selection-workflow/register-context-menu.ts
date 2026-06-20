import { captureSelectionHtml } from './resolve-selection-html';

export const COPY_SELECTION_MENU_ID = 'webtomd-copy-selection';

export function registerContextMenus(): void {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: COPY_SELECTION_MENU_ID,
      title: 'Copy Selection as MD',
      contexts: ['selection'],
    });
  });
}

/**
 * Cache selection HTML while the menu is open — before the click collapses it.
 * `onShown` is Chrome 121+; skipped silently when unavailable.
 */
export function registerSelectionCapture(): void {
  const onShown = (
    chrome.contextMenus as typeof chrome.contextMenus & {
      onShown?: typeof chrome.contextMenus.onClicked;
    }
  ).onShown;

  if (!onShown) return;

  onShown.addListener((info, tab) => {
    if (!tab?.id || !info.selectionText) return;
    void captureSelectionHtml(tab.id, info.frameId ?? 0).catch((err) => {
      console.warn('[webtomd] failed to cache selection on menu show', err);
    });
  });
}
