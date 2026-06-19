import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSettings, setSettings, DEFAULT_SETTINGS } from '~/lib/storage';

describe('Storage settings', () => {
  let mockStore: Record<string, any> = {};

  beforeEach(() => {
    mockStore = {};

    // Mock chrome extension API
    vi.stubGlobal('chrome', {
      storage: {
        sync: {
          get: vi.fn().mockImplementation(async (key: string) => {
            return { [key]: mockStore[key] };
          }),
          set: vi.fn().mockImplementation(async (data: Record<string, any>) => {
            mockStore = { ...mockStore, ...data };
          }),
        },
      },
    });
  });

  it('returns default settings when storage is empty', async () => {
    const settings = await getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
  });

  it('returns partially set settings merged with defaults', async () => {
    mockStore['settings'] = {
      lastUsedPreset: 'reference',
    };
    const settings = await getSettings();
    expect(settings).toEqual({
      lastUsedPreset: 'reference',
      onboardingComplete: false,
      frontmatterEnabled: true,
    });
  });

  it('sets settings and merges partial updates', async () => {
    await setSettings({ lastUsedPreset: 'archive' });
    let settings = await getSettings();
    expect(settings.lastUsedPreset).toBe('archive');
    expect(settings.onboardingComplete).toBe(false);

    await setSettings({ onboardingComplete: true });
    settings = await getSettings();
    expect(settings.lastUsedPreset).toBe('archive');
    expect(settings.onboardingComplete).toBe(true);
    expect(settings.frontmatterEnabled).toBe(true);
  });
});
