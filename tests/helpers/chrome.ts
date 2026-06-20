import { vi } from 'vitest';

/** Chrome stubs shared by selection resolve tests. */
export function stubChromeForSelectionExtract(
  executeScriptResult: unknown = null
): void {
  vi.stubGlobal('chrome', {
    tabs: {
      get: vi.fn().mockResolvedValue({
        url: 'https://example.com',
        title: 'Example Tab',
      }),
    },
    storage: {
      session: {
        get: vi.fn().mockResolvedValue({}),
        remove: vi.fn().mockResolvedValue(undefined),
      },
    },
    scripting: {
      executeScript: vi
        .fn()
        .mockResolvedValue([{ result: executeScriptResult }]),
    },
  });
}
