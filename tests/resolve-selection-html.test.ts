import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  captureSelectionHtml,
  consumeSelectionHtml,
  resolveSelectionHtml,
  SELECTION_CACHE_KEY_PREFIX,
} from '~/lib/selection-workflow/resolve-selection-html';

function cacheKey(tabId: number, frameId: number) {
  return `${SELECTION_CACHE_KEY_PREFIX}:${tabId}:${frameId}`;
}

describe('consumeSelectionHtml', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns cached html for the matching tab and frame', async () => {
    const key = cacheKey(5, 0);
    const remove = vi.fn().mockResolvedValue(undefined);
    const get = vi.fn().mockResolvedValue({
      [key]: '<em>cached</em>',
    });

    vi.stubGlobal('chrome', {
      storage: { session: { get, remove } },
    });

    const html = await consumeSelectionHtml(5, 0);
    expect(html).toBe('<em>cached</em>');
    expect(remove).toHaveBeenCalledWith(key);
  });

  it('returns null when cache is empty', async () => {
    const get = vi.fn().mockResolvedValue({});

    vi.stubGlobal('chrome', {
      storage: { session: { get, remove: vi.fn() } },
    });

    const html = await consumeSelectionHtml(5, 0);
    expect(html).toBeNull();
  });

  it('scopes cache by tab and frame', async () => {
    const keyTab5 = cacheKey(5, 0);
    const keyTab9 = cacheKey(9, 0);
    const set = vi.fn().mockResolvedValue(undefined);
    const get = vi
      .fn()
      .mockImplementation(async (k: string) =>
        k === keyTab5 ? { [keyTab5]: '<p>tab 5</p>' } : {}
      );
    const remove = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal('chrome', {
      storage: { session: { get, set, remove } },
      scripting: {
        executeScript: vi
          .fn()
          .mockResolvedValue([{ result: { html: '<p>live</p>' } }]),
      },
    });

    const html = await consumeSelectionHtml(5, 0);
    expect(html).toBe('<p>tab 5</p>');
    expect(get).toHaveBeenCalledWith(keyTab5);
    expect(get).not.toHaveBeenCalledWith(keyTab9);
  });
});

describe('captureSelectionHtml', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('stores live selection HTML keyed by tab and frame', async () => {
    const key = cacheKey(2, 1);
    const set = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal('chrome', {
      storage: { session: { set } },
      scripting: {
        executeScript: vi
          .fn()
          .mockResolvedValue([{ result: { html: '<strong>cached</strong>' } }]),
      },
    });

    await captureSelectionHtml(2, 1);

    expect(set).toHaveBeenCalledWith({
      [key]: '<strong>cached</strong>',
    });
  });

  it('skips storage when live selection is empty', async () => {
    const set = vi.fn().mockResolvedValue(undefined);

    vi.stubGlobal('chrome', {
      storage: { session: { set } },
      scripting: {
        executeScript: vi.fn().mockResolvedValue([{ result: null }]),
      },
    });

    await captureSelectionHtml(1, 0);
    expect(set).not.toHaveBeenCalled();
  });
});

describe('resolveSelectionHtml', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null when no valid selection exists', async () => {
    vi.stubGlobal('chrome', {
      storage: {
        session: { get: vi.fn().mockResolvedValue({}), remove: vi.fn() },
      },
      scripting: {
        executeScript: vi.fn().mockResolvedValue([{ result: null }]),
      },
    });

    const res = await resolveSelectionHtml(1);
    expect(res).toBeNull();
  });

  it('falls back to selectionText when live HTML is gone', async () => {
    vi.stubGlobal('chrome', {
      tabs: {
        get: vi.fn().mockResolvedValue({
          url: 'https://example.com',
          title: 'Example Tab',
        }),
      },
      storage: {
        session: { get: vi.fn().mockResolvedValue({}), remove: vi.fn() },
      },
      scripting: {
        executeScript: vi.fn().mockResolvedValue([{ result: null }]),
      },
    });

    const res = await resolveSelectionHtml(1, {
      selectionText: 'hello\n\nworld',
    });

    expect(res).not.toBeNull();
    expect(res!.html).toContain('hello');
    expect(res!.html).toContain('world');
    expect(res!.kind).toBe('selection');
  });

  it('prefers cached HTML over plain-text fallback', async () => {
    const key = cacheKey(1, 0);
    vi.stubGlobal('chrome', {
      tabs: {
        get: vi.fn().mockResolvedValue({
          url: 'https://example.com',
          title: 'Example Tab',
        }),
      },
      storage: {
        session: {
          get: vi.fn().mockResolvedValue({ [key]: '<strong>cached</strong>' }),
          remove: vi.fn().mockResolvedValue(undefined),
        },
      },
      scripting: {
        executeScript: vi.fn().mockResolvedValue([{ result: null }]),
      },
    });

    const res = await resolveSelectionHtml(1, {
      selectionText: 'plain only',
    });

    expect(res!.html).toBe('<strong>cached</strong>');
  });

  it('prefers live HTML over cached HTML', async () => {
    const key = cacheKey(1, 0);
    vi.stubGlobal('chrome', {
      tabs: {
        get: vi.fn().mockResolvedValue({
          url: 'https://example.com',
          title: 'Example Tab',
        }),
      },
      storage: {
        session: {
          get: vi.fn().mockResolvedValue({ [key]: '<em>cached</em>' }),
          remove: vi.fn().mockResolvedValue(undefined),
        },
      },
      scripting: {
        executeScript: vi
          .fn()
          .mockResolvedValue([{ result: { html: '<strong>live</strong>' } }]),
      },
    });

    const res = await resolveSelectionHtml(1);
    expect(res!.html).toBe('<strong>live</strong>');
  });

  it('successfully resolves raw selection HTML', async () => {
    vi.stubGlobal('chrome', {
      tabs: {
        get: vi.fn().mockResolvedValue({
          url: 'https://example.com',
          title: 'Example Tab',
        }),
      },
      storage: {
        session: { get: vi.fn().mockResolvedValue({}), remove: vi.fn() },
      },
      scripting: {
        executeScript: vi
          .fn()
          .mockResolvedValue([{ result: { html: '<strong>hello</strong>' } }]),
      },
    });

    const res = await resolveSelectionHtml(1);
    expect(res).not.toBeNull();
    expect(res!.kind).toBe('selection');
    expect(res!.url).toBe('https://example.com');
    expect(res!.title).toBe('Example Tab');
    expect(res!.html).toBe('<strong>hello</strong>');
  });
});
