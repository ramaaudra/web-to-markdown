<script lang="ts">
  import { onMount } from 'svelte';
  import { getSettings, setSettings } from '~/lib/storage';
  import { PRESETS, PRESET_ORDER } from '~/lib/presets';
  import type { PresetId } from '~/types/preset';

  const GITHUB_URL = 'https://github.com/ramaaudra/web-to-markdown';
  const SAVED_FLASH_MS = 1600;

  let lastUsedPreset = $state<PresetId>('chat-ready');
  let frontmatterEnabled = $state(true);
  let version = $state('0.1.0');
  let presetSaved = $state(false);
  let outputSaved = $state(false);

  let presetSavedTimer: ReturnType<typeof setTimeout> | undefined = undefined;
  let outputSavedTimer: ReturnType<typeof setTimeout> | undefined = undefined;

  onMount(async () => {
    const settings = await getSettings();
    lastUsedPreset = settings.lastUsedPreset;
    frontmatterEnabled = settings.frontmatterEnabled;
    version = chrome.runtime.getManifest().version;
  });

  function flashSection(section: 'preset' | 'output') {
    if (section === 'preset') {
      presetSaved = true;
      clearTimeout(presetSavedTimer);
      presetSavedTimer = setTimeout(() => {
        presetSaved = false;
      }, SAVED_FLASH_MS);
      return;
    }

    outputSaved = true;
    clearTimeout(outputSavedTimer);
    outputSavedTimer = setTimeout(() => {
      outputSaved = false;
    }, SAVED_FLASH_MS);
  }

  async function updatePreset(id: PresetId) {
    lastUsedPreset = id;
    await setSettings({ lastUsedPreset: id });
    flashSection('preset');
  }

  async function toggleFrontmatter(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    frontmatterEnabled = checked;
    await setSettings({ frontmatterEnabled: checked });
    flashSection('output');
  }

  async function replayWelcomeTour() {
    await setSettings({ onboardingComplete: false });
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }
</script>

<svelte:head>
  <title>WebToMD — Options</title>
</svelte:head>

<svelte:options runes={true} />

<main class="page">
  <div class="page-brand">
    <span class="page-brand-icon" aria-hidden="true">⚡</span>
    <span>WebToMD</span>
  </div>

  <h1 class="page-heading">Settings</h1>
  <p class="page-lede">
    Choose your default Preset and output options. Changes save automatically.
  </p>

  <section class="settings-section" aria-labelledby="preset-label">
    <div class="section-header">
      <p class="section-label" id="preset-label">Default Preset</p>
      {#if presetSaved}
        <span class="saved-flash" role="status">Saved</span>
      {/if}
    </div>
    <div class="radio-list" role="radiogroup" aria-labelledby="preset-label">
      {#each PRESET_ORDER as id}
        {@const preset = PRESETS[id]}
        <label class="radio-option" class:selected={lastUsedPreset === id}>
          <input
            type="radio"
            name="preset"
            value={id}
            checked={lastUsedPreset === id}
            onchange={() => updatePreset(id)}
          />
          <div class="radio-body">
            <span class="radio-title">{preset.label}</span>
            <span class="radio-desc">{preset.description}</span>
          </div>
        </label>
      {/each}
    </div>
  </section>

  <section class="settings-section" aria-labelledby="output-label">
    <div class="section-header">
      <p class="section-label" id="output-label">Output</p>
      {#if outputSaved}
        <span class="saved-flash" role="status">Saved</span>
      {/if}
    </div>
    <div class="toggle-row">
      <div class="toggle-text">
        <p class="toggle-title">YAML Frontmatter</p>
        <p class="toggle-desc">
          Prepend structured metadata (URL, title, fetch time) to each Web
          Clip.
        </p>
      </div>
      <label class="toggle">
        <input
          type="checkbox"
          checked={frontmatterEnabled}
          onchange={toggleFrontmatter}
          aria-label="YAML Frontmatter"
        />
        <span class="toggle-track"></span>
      </label>
    </div>
  </section>

  <section class="settings-section" aria-labelledby="help-label">
    <p class="section-label" id="help-label">Help</p>
    <button type="button" class="link-row" onclick={replayWelcomeTour}>
      Replay welcome tour
    </button>
  </section>

  <footer class="page-footer">
    v{version} ·
    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
  </footer>
</main>

<style>
  :global(body) {
    margin: 0;
  }
</style>
