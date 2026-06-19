import type { PresetId } from "~/types/preset";

export interface Settings {
  lastUsedPreset: PresetId;
  onboardingComplete: boolean;
  frontmatterEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  lastUsedPreset: "chat-ready",
  onboardingComplete: false,
  frontmatterEnabled: true,
};

const STORAGE_KEY = "settings";

/**
 * Retrieves the stored user settings from chrome.storage.sync.
 * Falls back to default values for any missing or undefined fields.
 */
export async function getSettings(): Promise<Settings> {
  if (
    typeof chrome === "undefined" ||
    !chrome.storage ||
    !chrome.storage.sync
  ) {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const result = await chrome.storage.sync.get(STORAGE_KEY);
    const data = result[STORAGE_KEY] as any;

    if (!data) {
      return { ...DEFAULT_SETTINGS };
    }

    return {
      lastUsedPreset: data.lastUsedPreset ?? DEFAULT_SETTINGS.lastUsedPreset,
      onboardingComplete:
        data.onboardingComplete ?? DEFAULT_SETTINGS.onboardingComplete,
      frontmatterEnabled:
        data.frontmatterEnabled ?? DEFAULT_SETTINGS.frontmatterEnabled,
    };
  } catch (err) {
    console.error("[webtomd] failed to get settings from storage:", err);
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Merges the provided settings updates into the existing settings
 * and persists the updated settings object to chrome.storage.sync.
 */
export async function setSettings(partial: Partial<Settings>): Promise<void> {
  if (
    typeof chrome === "undefined" ||
    !chrome.storage ||
    !chrome.storage.sync
  ) {
    return;
  }

  try {
    const current = await getSettings();
    const updated = {
      ...current,
      ...partial,
    };

    await chrome.storage.sync.set({ [STORAGE_KEY]: updated });
  } catch (err) {
    console.error("[webtomd] failed to set settings in storage:", err);
  }
}
