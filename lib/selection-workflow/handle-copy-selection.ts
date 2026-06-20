import { buildClip } from '~/lib/extractor/build-clip';
import { convertHtmlInTab } from '~/lib/extractor/convert-in-tab';
import { writeClipboard } from '~/lib/clipboard';
import { formatClip } from '~/lib/frontmatter';
import { PRESETS } from '~/lib/presets';
import { getSettings } from '~/lib/storage';
import { showToast } from '~/lib/toast';
import { estimateTokens } from '~/lib/token';
import { COPY_SELECTION_MENU_ID } from './register-context-menu';
import { resolveSelectionHtml } from './resolve-selection-html';

async function safeShowToast(
  tabId: number | undefined,
  message: string,
  options?: Parameters<typeof showToast>[2]
): Promise<void> {
  if (!tabId) {
    console.error('[webtomd]', message);
    return;
  }
  try {
    await showToast(tabId, message, options);
  } catch (toastErr) {
    console.error('[webtomd] toast failed:', message, toastErr);
  }
}

/** Context-menu handler for "Copy Selection as MD". */
export async function handleCopySelectionClick(
  info: chrome.contextMenus.OnClickData,
  tab?: chrome.tabs.Tab
): Promise<void> {
  if (info.menuItemId !== COPY_SELECTION_MENU_ID) return;
  if (!tab?.id) {
    console.error('[webtomd] selection workflow: missing tab id');
    return;
  }

  const tabId = tab.id;
  const frameId = info.frameId ?? 0;

  try {
    const rawSelection = await resolveSelectionHtml(tabId, {
      frameId,
      selectionText: info.selectionText,
    });
    if (!rawSelection) {
      await safeShowToast(tabId, 'Select some text first.', { frameId });
      return;
    }

    const settings = await getSettings();
    const preset = PRESETS[settings.lastUsedPreset] || PRESETS['chat-ready'];
    const markdown = await convertHtmlInTab({
      tabId,
      html: rawSelection.html,
      preset,
      frameId,
    });
    const clip = buildClip(rawSelection, preset, markdown);
    const formatted = formatClip(clip, preset, {
      frontmatterEnabled: settings.frontmatterEnabled,
    });
    await writeClipboard(formatted, { tabId, frameId });
    await safeShowToast(tabId, 'Selection copied', {
      frameId,
      tokenCount: estimateTokens(formatted),
    });
  } catch (err) {
    console.error('[webtomd] selection workflow failed', err);
    await safeShowToast(tabId, "Couldn't copy selection.", { frameId });
  }
}
