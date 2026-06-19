import { defineBackground } from 'wxt/utils/define-background';
import { registerContextMenus, COPY_SELECTION_MENU_ID } from '~/lib/context-menu';
import { extractSelection } from '~/lib/extractor';
import { writeClipboard } from '~/lib/clipboard';
import { showToast } from '~/lib/toast';
import { CHAT_READY_PRESET } from '~/lib/presets';

export default defineBackground(() => {
  registerContextMenus();

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== COPY_SELECTION_MENU_ID) return;
    if (!tab?.id) return;

    try {
      const clip = await extractSelection(tab.id, CHAT_READY_PRESET);
      if (!clip) {
        await showToast(tab.id, 'Select some text first.');
        return;
      }
      await writeClipboard(clip.markdown);
      await showToast(tab.id, 'Copied!');
    } catch (err) {
      console.error('[webtomd] selection workflow failed', err);
      await showToast(
        tab.id,
        err instanceof Error ? err.message : "Couldn't write to clipboard.",
      );
    }
  });

  chrome.runtime.onInstalled.addListener((details) => {
    console.log('[webtomd] installed', details.reason);
    if (details.reason === 'install') {
      chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
    }
  });
});