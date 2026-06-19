<script lang="ts">
  import { onMount } from 'svelte';
  import { getSettings, setSettings } from '~/lib/storage';
  import { PRESETS, PRESET_ORDER } from '~/lib/presets';
  import type { PresetId } from '~/types/preset';

  let lastUsedPreset = $state<PresetId>('chat-ready');
  let frontmatterEnabled = $state(true);
  let onboardingComplete = $state(false);
  let savedStatus = $state('');

  onMount(async () => {
    const settings = await getSettings();
    lastUsedPreset = settings.lastUsedPreset;
    frontmatterEnabled = settings.frontmatterEnabled;
    onboardingComplete = settings.onboardingComplete;
  });

  async function updatePreset(id: PresetId) {
    lastUsedPreset = id;
    await setSettings({ lastUsedPreset: id });
    showSavedNotification();
  }

  async function toggleFrontmatter(e: Event) {
    const checked = (e.target as HTMLInputElement).checked;
    frontmatterEnabled = checked;
    await setSettings({ frontmatterEnabled: checked });
    showSavedNotification();
  }

  function showSavedNotification() {
    savedStatus = 'Settings saved!';
    setTimeout(() => {
      savedStatus = '';
    }, 2000);
  }

  function openWelcomePage() {
    chrome.tabs.create({ url: chrome.runtime.getURL('welcome.html') });
  }
</script>

<main class="options-container">
  <div class="card">
    <header class="header">
      <div class="logo-area">
        <span class="logo-icon">⚡</span>
        <h1 class="logo-title">WebToMD Settings</h1>
      </div>
      <div class="status-indicator">
        {#if savedStatus}
          <span class="saved-badge">{savedStatus}</span>
        {/if}
      </div>
    </header>

    <div class="section">
      <h2 class="section-title">Default Preset</h2>
      <p class="section-desc">Select the default formatting behavior applied when opening the popup.</p>

      <div class="presets-list">
        {#each PRESET_ORDER as id}
          {@const preset = PRESETS[id]}
          <label class="preset-option" class:active={lastUsedPreset === id}>
            <input
              type="radio"
              name="preset"
              value={id}
              checked={lastUsedPreset === id}
              onchange={() => updatePreset(id)}
            />
            <div class="preset-meta">
              <span class="preset-label">{preset.label}</span>
              <span class="preset-desc">{preset.description}</span>
            </div>
          </label>
        {/each}
      </div>
    </div>

    <hr class="divider" />

    <div class="section toggle-section">
      <div class="section-text">
        <h2 class="section-title">YAML Frontmatter</h2>
        <p class="section-desc">Prepend structured page metadata (URL, Title, Fetch Time, etc.) to the top of your markdown clips.</p>
      </div>
      <label class="switch">
        <input
          type="checkbox"
          checked={frontmatterEnabled}
          onchange={toggleFrontmatter}
        />
        <span class="slider"></span>
      </label>
    </div>

    <hr class="divider" />

    <div class="section welcome-section">
      <h2 class="section-title">Onboarding</h2>
      <p class="section-desc">Need a refresher on how to use the extension? You can view the quickstart onboarding guide again.</p>
      <button class="welcome-btn" onclick={openWelcomePage}>
        Show welcome page again
      </button>
    </div>

    <footer class="footer">
      <div class="footer-meta">
        <span>Version 0.1.0</span>
        <span class="dot">•</span>
        <a href="https://github.com/ramaaudra/web-to-markdown" target="_blank" rel="noopener noreferrer" class="repo-link">
          GitHub Repository
        </a>
      </div>
    </footer>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #e2e8f0;
    background: #090b11;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    box-sizing: border-box;
  }

  .options-container {
    width: 100%;
    max-width: 600px;
  }

  .card {
    background: #0f111a;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .logo-icon {
    font-size: 20px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .logo-title {
    margin: 0;
    font-family: 'Outfit', sans-serif;
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(to right, #ffffff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .saved-badge {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    color: #10b981;
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 9999px;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .section-title {
    margin: 0;
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .section-desc {
    margin: 0 0 8px;
    font-size: 13px;
    color: #94a3b8;
    line-height: 1.5;
  }

  .presets-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .preset-option {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    background: #161925;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .preset-option:hover {
    background: #1f2438;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .preset-option.active {
    background: rgba(99, 102, 241, 0.06);
    border-color: rgba(99, 102, 241, 0.3);
  }

  .preset-option input[type="radio"] {
    margin-top: 3px;
    accent-color: #6366f1;
  }

  .preset-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .preset-label {
    font-size: 14px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .preset-desc {
    font-size: 12px;
    color: #94a3b8;
  }

  .divider {
    margin: 0;
    border: 0;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .toggle-section {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
  }

  .toggle-section .section-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
    max-width: 440px;
  }

  /* Switch widget styles */
  .switch {
    position: relative;
    display: inline-block;
    width: 44px;
    height: 24px;
    flex-shrink: 0;
  }

  .switch input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #1f2438;
    transition: .3s;
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 3px;
    bottom: 3px;
    background-color: #94a3b8;
    transition: .3s;
    border-radius: 50%;
  }

  input:checked + .slider {
    background-color: #6366f1;
    border-color: rgba(99, 102, 241, 0.3);
  }

  input:checked + .slider:before {
    transform: translateX(20px);
    background-color: #ffffff;
  }

  .welcome-section {
    gap: 12px;
  }

  .welcome-btn {
    align-self: flex-start;
    background: #1f2438;
    color: #cbd5e1;
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .welcome-btn:hover {
    background: #2b324e;
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .footer {
    margin-top: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 16px;
  }

  .footer-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #64748b;
  }

  .dot {
    color: #334155;
  }

  .repo-link {
    color: #6366f1;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .repo-link:hover {
    color: #8b5cf6;
    text-decoration: underline;
  }
</style>
