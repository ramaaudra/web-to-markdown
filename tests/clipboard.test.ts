import { describe, it, expect, vi, beforeEach } from 'vitest';
import { writeClipboard, writeClipboardInTab } from '~/lib/clipboard';

describe('writeClipboard', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('writes via injected tab script when tabId is provided', async () => {
    const executeScript = vi.fn().mockResolvedValue([]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });

    await writeClipboard('hello md', { tabId: 42, frameId: 0 });

    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { tabId: 42 },
        args: ['hello md'],
        world: 'ISOLATED',
      })
    );
  });

  it('throws in service-worker-like contexts without tabId or clipboard', async () => {
    vi.stubGlobal('navigator', { clipboard: undefined });
    vi.stubGlobal('document', undefined);

    await expect(writeClipboard('hello')).rejects.toThrow(
      'Clipboard API is not available in this context'
    );
  });
});

describe('writeClipboardInTab', () => {
  it('targets a specific frame when frameId is set', async () => {
    const executeScript = vi.fn().mockResolvedValue([]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });

    await writeClipboardInTab('snippet', 7, 3);

    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { tabId: 7, frameIds: [3] },
      })
    );
  });
});
