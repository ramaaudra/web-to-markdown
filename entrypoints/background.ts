import { defineBackground } from 'wxt/utils/define-background';
import {
  registerContextMenus,
  COPY_SELECTION_MENU_ID,
} from '~/lib/context-menu';
import { extractSelection } from '~/lib/extractor';
import { writeClipboard } from '~/lib/clipboard';
import { showToast } from '~/lib/toast';
import { PRESETS } from '~/lib/presets';
import { formatClip } from '~/lib/frontmatter';
import { getSettings } from '~/lib/storage';

export default defineBackground(() => {
  registerContextMenus();

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== COPY_SELECTION_MENU_ID) return;
    if (!tab?.id) return;

    try {
      const settings = await getSettings();
      const preset = PRESETS[settings.lastUsedPreset] || PRESETS['chat-ready'];

      const clip = await extractSelection(tab.id, preset);
      if (!clip) {
        await showToast(tab.id, 'Select some text first.');
        return;
      }
      const formatted = formatClip(clip, preset, {
        frontmatterEnabled: settings.frontmatterEnabled,
      });
      await writeClipboard(formatted);
      await showToast(tab.id, 'Copied!');
    } catch (err) {
      console.error('[webtomd] selection workflow failed', err);
      await showToast(tab.id, "Couldn't write to clipboard.");
    }
  });

  chrome.runtime.onInstalled.addListener((details) => {
    console.log('[webtomd] installed', details.reason);
    if (details.reason === 'install') {
      chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
    }
  });
});
