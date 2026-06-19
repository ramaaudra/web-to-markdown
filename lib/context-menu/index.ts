// lib/context-menu — Chrome right-click menu registration for the Selection
// Workflow. The "Copy Selection as MD" item appears whenever the user has
// selected text on any page. Clicks are dispatched to the background service
// worker via `chrome.contextMenus.onClicked`.

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
