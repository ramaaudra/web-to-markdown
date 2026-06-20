import { describe, it, expect, vi, beforeEach } from 'vitest';
import { COPY_SELECTION_MENU_ID } from '~/lib/selection-workflow';
import { htmlToMarkdown } from '~/lib/extractor/html-to-markdown';
import type { PRESETS } from '~/lib/presets';
import { handleCopySelectionClick } from '~/lib/selection-workflow/handle-copy-selection';

describe('handleCopySelectionClick — integration', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('produces real markdown on the clipboard with minimal Chrome mocks', async () => {
    let clipboardText = '';

    vi.stubGlobal('chrome', {
      tabs: {
        get: vi.fn().mockResolvedValue({
          url: 'https://example.com',
          title: 'Example',
        }),
      },
      storage: {
        session: {
          get: vi.fn().mockResolvedValue({}),
          remove: vi.fn().mockResolvedValue(undefined),
        },
        sync: {
          get: vi.fn().mockResolvedValue({
            settings: {
              lastUsedPreset: 'chat-ready',
              frontmatterEnabled: false,
              onboardingComplete: true,
            },
          }),
          set: vi.fn().mockResolvedValue(undefined),
        },
      },
      scripting: {
        executeScript: vi.fn().mockImplementation(async (opts) => {
          if (opts.files?.length) {
            (
              globalThis as typeof globalThis & {
                __webtomd_convertHtml?: typeof htmlToMarkdown;
              }
            ).__webtomd_convertHtml = htmlToMarkdown;
            if (opts.func) {
              const [html, preset] = opts.args as [string, typeof PRESETS['chat-ready']];
              const convert = (
                globalThis as typeof globalThis & {
                  __webtomd_convertHtml?: typeof htmlToMarkdown;
                }
              ).__webtomd_convertHtml!;
              return [{ result: convert(html, preset) }];
            }
            return [];
          }
          if (opts.func && typeof opts.args?.[0] === 'string' && opts.args.length === 1) {
            clipboardText = opts.args[0] as string;
            return [];
          }
          if (opts.func && opts.args?.length === 3) {
            return [];
          }
          return [{ result: { html: '<p><strong>hello</strong></p>' } }];
        }),
      },
    });

    await handleCopySelectionClick(
      {
        menuItemId: COPY_SELECTION_MENU_ID,
        selectionText: 'hello',
        frameId: 0,
      } as chrome.contextMenus.OnClickData,
      { id: 1 } as chrome.tabs.Tab
    );

    expect(clipboardText).toContain('**hello**');
  });
});
