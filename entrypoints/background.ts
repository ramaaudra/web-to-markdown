import { defineBackground } from 'wxt/utils/define-background';
import {
  registerContextMenus,
  registerSelectionCapture,
  handleCopySelectionClick,
} from '~/lib/selection-workflow';

export default defineBackground(() => {
  registerContextMenus();
  registerSelectionCapture();

  chrome.contextMenus.onClicked.addListener(handleCopySelectionClick);

  chrome.runtime.onInstalled.addListener((details) => {
    console.log('[webtomd] installed', details.reason);
    if (details.reason === 'install') {
      chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
    }
  });
});
