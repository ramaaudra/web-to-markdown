<script lang="ts">
  import { onMount } from 'svelte';
  import { getSettings, setSettings } from '~/lib/storage';

  let ready = $state(false);
  let dismissed = $state(false);

  onMount(async () => {
    const settings = await getSettings();
    dismissed = settings.onboardingComplete;
    ready = true;
  });

  async function handleDismiss() {
    try {
      await setSettings({ onboardingComplete: true });
      dismissed = true;
    } catch (e) {
      console.error('[webtomd] failed to dismiss welcome onboarding:', e);
    }
  }
</script>

<svelte:head>
  <title>Welcome to WebToMD</title>
</svelte:head>

<svelte:options runes={true} />

<main class="page">
  <div class="page-brand">
    <span class="page-brand-icon" aria-hidden="true">⚡</span>
    <span>WebToMD</span>
  </div>

  <h1 class="page-heading">Copy pages as clean Markdown</h1>
  <p class="page-lede">
    Extract the main content of any webpage as token-efficient Markdown — ready
    to paste into your AI agent.
  </p>

  <p class="section-label">How it works</p>
  <ol class="bordered-list">
    <li>
      <span class="step-num">1</span>
      <div class="step-body">
        <p class="step-title">Click the extension icon</p>
        <p class="step-desc">
          Open WebToMD on any article, docs page, or blog post.
        </p>
      </div>
    </li>
    <li>
      <span class="step-num">2</span>
      <div class="step-body">
        <p class="step-title">Preview and pick a preset</p>
        <p class="step-desc">
          Switch between Chat-ready, Reference, and Archive to balance tokens
          vs. detail. The Markdown copies automatically.
        </p>
      </div>
    </li>
    <li>
      <span class="step-num">3</span>
      <div class="step-body">
        <p class="step-title">Paste into your AI chat</p>
        <p class="step-desc">
          The formatted Markdown is already on your clipboard — paste it
          directly into ChatGPT, Claude, or your notes app.
        </p>
      </div>
    </li>
  </ol>

  <p class="section-label">Need a Selection Clip?</p>
  <p class="selection-hint">
    Select text on a page, right-click, and choose
    <kbd>Copy Selection as MD</kbd>.
  </p>

  {#if ready}
    {#if dismissed}
      <p class="dismiss-note" role="status">
        Onboarding complete. You can close this tab anytime.
      </p>
    {:else}
      <button class="btn-primary" onclick={handleDismiss}>Got it</button>
    {/if}
  {/if}

  <footer class="page-footer">
    All extraction happens locally on your device. WebToMD does not collect
    data, send telemetry, or require an account.
  </footer>
</main>

<style>
  :global(body) {
    margin: 0;
  }

  .selection-hint {
    margin: 0 0 28px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--muted);
  }
</style>
