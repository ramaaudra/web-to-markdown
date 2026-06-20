import { describe, it, expect } from 'vitest';
import { scriptTarget } from '~/lib/chrome/script-target';

describe('scriptTarget', () => {
  it('returns tab-only target for main frame', () => {
    expect(scriptTarget(3)).toEqual({ tabId: 3 });
    expect(scriptTarget(3, 0)).toEqual({ tabId: 3 });
  });

  it('includes frameIds for iframe targets', () => {
    expect(scriptTarget(3, 2)).toEqual({ tabId: 3, frameIds: [2] });
  });
});
