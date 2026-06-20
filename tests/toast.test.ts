import { describe, it, expect, vi, beforeEach } from 'vitest';
import { injectToastInPage, showToast } from '~/lib/toast';

describe('injectToastInPage', () => {
  it('is self-contained for executeScript serialization', () => {
    const source = injectToastInPage.toString();
    // Module-scope helpers must not be referenced — they are not injected.
    expect(source).not.toMatch(/\bensureHost\b/);
    expect(source).not.toMatch(/\brenderToast\b/);
    expect(source).not.toMatch(/\bfadeAndRemove\b/);
  });
});

describe('showToast', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('targets the selection frame when frameId is set', async () => {
    const executeScript = vi.fn().mockResolvedValue([]);
    vi.stubGlobal('chrome', { scripting: { executeScript } });

    await showToast(4, 'Selection copied', { frameId: 2, tokenCount: 42 });

    expect(executeScript).toHaveBeenCalledWith(
      expect.objectContaining({
        target: { tabId: 4, frameIds: [2] },
        args: ['Selection copied', 2500, 42],
      })
    );
  });
});
