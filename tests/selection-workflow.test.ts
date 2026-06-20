import { describe, it, expect, vi, beforeEach } from 'vitest';
import { COPY_SELECTION_MENU_ID } from '~/lib/selection-workflow';
import { PRESETS } from '~/lib/presets';
import { handleCopySelectionClick } from '~/lib/selection-workflow/handle-copy-selection';

const {
  resolveSelectionHtml,
  convertHtmlInTab,
  writeClipboard,
  showToast,
  getSettings,
} = vi.hoisted(() => ({
  resolveSelectionHtml: vi.fn(),
  convertHtmlInTab: vi.fn(),
  writeClipboard: vi.fn(),
  showToast: vi.fn(),
  getSettings: vi.fn(),
}));

vi.mock(import('~/lib/selection-workflow/resolve-selection-html'), () => ({
  resolveSelectionHtml,
  captureSelectionHtml: vi.fn(),
  consumeSelectionHtml: vi.fn(),
  SELECTION_CACHE_KEY_PREFIX: 'webtomd-selection-cache' as const,
}));

vi.mock(import('~/lib/extractor/convert-in-tab'), () => ({
  convertHtmlInTab,
}));

vi.mock(import('~/lib/clipboard'), () => ({
  writeClipboard,
}));

vi.mock(import('~/lib/toast'), () => ({
  showToast,
}));

vi.mock(import('~/lib/storage'), () => ({
  getSettings,
}));

describe('handleCopySelectionClick', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveSelectionHtml.mockResolvedValue({
      kind: 'selection',
      url: 'https://example.com',
      title: 'Example',
      html: '<p>hello</p>',
    });
    convertHtmlInTab.mockResolvedValue('hello');
    writeClipboard.mockResolvedValue(undefined);
    showToast.mockResolvedValue(undefined);
    getSettings.mockResolvedValue({
      lastUsedPreset: 'chat-ready',
      frontmatterEnabled: true,
    });
  });

  it('ignores unrelated menu items', async () => {
    await handleCopySelectionClick(
      {
        menuItemId: 'other',
        selectionText: 'x',
      } as chrome.contextMenus.OnClickData,
      { id: 1 } as chrome.tabs.Tab
    );

    expect(resolveSelectionHtml).not.toHaveBeenCalled();
  });

  it('shows a toast when no selection is available', async () => {
    resolveSelectionHtml.mockResolvedValue(null);

    await handleCopySelectionClick(
      {
        menuItemId: COPY_SELECTION_MENU_ID,
        selectionText: '',
        frameId: 0,
      } as chrome.contextMenus.OnClickData,
      { id: 3 } as chrome.tabs.Tab
    );

    expect(showToast).toHaveBeenCalledWith(3, 'Select some text first.', {
      frameId: 0,
    });
    expect(writeClipboard).not.toHaveBeenCalled();
  });

  it('copies formatted selection markdown to the clipboard', async () => {
    await handleCopySelectionClick(
      {
        menuItemId: COPY_SELECTION_MENU_ID,
        selectionText: 'hello',
        frameId: 2,
      } as chrome.contextMenus.OnClickData,
      { id: 7 } as chrome.tabs.Tab
    );

    expect(resolveSelectionHtml).toHaveBeenCalledWith(7, {
      frameId: 2,
      selectionText: 'hello',
    });
    expect(convertHtmlInTab).toHaveBeenCalledWith({
      tabId: 7,
      html: '<p>hello</p>',
      preset: PRESETS['chat-ready'],
      frameId: 2,
    });
    expect(writeClipboard).toHaveBeenCalledWith(
      expect.stringContaining('hello'),
      { tabId: 7, frameId: 2 }
    );
    expect(showToast).toHaveBeenCalledWith(7, 'Selection copied', {
      frameId: 2,
      tokenCount: expect.any(Number),
    });
  });

  it('shows an error toast when the workflow throws', async () => {
    convertHtmlInTab.mockRejectedValue(new Error('convert failed'));

    await handleCopySelectionClick(
      {
        menuItemId: COPY_SELECTION_MENU_ID,
        selectionText: 'hello',
      } as chrome.contextMenus.OnClickData,
      { id: 9 } as chrome.tabs.Tab
    );

    expect(showToast).toHaveBeenCalledWith(9, "Couldn't copy selection.", {
      frameId: 0,
    });
  });
});
