import { describe, it, expect, vi, beforeEach } from 'vitest';
import { convertHtmlInTab } from '~/lib/extractor/convert-in-tab';
import { PRESETS } from '~/lib/presets';

describe('convertHtmlInTab', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('injects the converter script and converts in one call', async () => {
    const executeScript = vi
      .fn()
      .mockResolvedValueOnce([{ result: '**hello**' }]);

    vi.stubGlobal('chrome', { scripting: { executeScript } });

    const markdown = await convertHtmlInTab({
      tabId: 3,
      html: '<strong>hello</strong>',
      preset: PRESETS['chat-ready'],
    });

    expect(markdown).toBe('**hello**');
    expect(executeScript).toHaveBeenCalledTimes(1);
    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { tabId: 3 },
        files: ['/content-scripts/selection-convert.js'],
        args: ['<strong>hello</strong>', PRESETS['chat-ready']],
      })
    );
  });

  it('targets iframe frames when frameId is set', async () => {
    const executeScript = vi.fn().mockResolvedValueOnce([{ result: 'hello' }]);

    vi.stubGlobal('chrome', { scripting: { executeScript } });

    await convertHtmlInTab({
      tabId: 4,
      html: '<p>hello</p>',
      preset: PRESETS.reference,
      frameId: 2,
    });

    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { tabId: 4, frameIds: [2] },
      })
    );
  });
});
