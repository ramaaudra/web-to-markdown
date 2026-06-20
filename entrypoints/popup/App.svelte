<svelte:options runes={true} />

<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { extractPage, toClip } from '~/lib/extractor';
  import type { RawPageData } from '~/lib/extractor';
  import { writeClipboard } from '~/lib/clipboard';
  import { PRESETS } from '~/lib/presets';
  import { formatClip } from '~/lib/frontmatter';
  import { estimateTokens } from '~/lib/token';
  import { getSettings, setSettings } from '~/lib/storage';
  import type { PresetId } from '~/types/preset';
  import PresetTabs from './components/PresetTabs.svelte';

  type State = 'loading' | 'ready' | 'error';

  const COPY_STATUS_MS = 2000;
  const TOKEN_FLASH_MS = 600;

  let status = $state<State>('loading');
  let errorText = $state(
    "Couldn't extract main content. The page might use heavy JavaScript rendering. Try the selection option instead."
  );
  let copyStatus = $state<'idle' | 'copied' | 'failed'>('idle');
  let tokenFlash = $state(false);
  let frontmatterEnabled = $state(true);

  let rawData = $state<RawPageData | null>(null);
  let activePresetId = $state<PresetId>('chat-ready');
  const activePreset = $derived(PRESETS[activePresetId]);

  const clip = $derived(rawData ? toClip(rawData, activePreset) : null);
  const formattedClipText = $derived(
    clip ? formatClip(clip, activePreset, { frontmatterEnabled }) : ''
  );
  const tokenCount = $derived(
    formattedClipText ? estimateTokens(formattedClipText) : 0
  );

  let copyStatusTimer: ReturnType<typeof setTimeout> | undefined = undefined;
  let tokenFlashTimer: ReturnType<typeof setTimeout> | undefined = undefined;

  onDestroy(() => {
    clearTimeout(copyStatusTimer);
    clearTimeout(tokenFlashTimer);
  });

  onMount(async () => {
    try {
      const settings = await getSettings();
      activePresetId = settings.lastUsedPreset;
      frontmatterEnabled = settings.frontmatterEnabled;

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        throw new Error("Couldn't extract main content. The page might use heavy JavaScript rendering. Try the selection option instead.");
      }

      rawData = await extractPage(tab.id);
      await copyCurrentClip(true);
      status = 'ready';
    } catch (e) {
      status = 'error';
      errorText =
        e instanceof Error
          ? e.message
          : "Couldn't extract main content. The page might use heavy JavaScript rendering. Try the selection option instead.";
    }
  });

  function flashTokens() {
    tokenFlash = true;
    clearTimeout(tokenFlashTimer);
    tokenFlashTimer = setTimeout(() => {
      tokenFlash = false;
    }, TOKEN_FLASH_MS);
  }

  function setCopyStatus(next: 'idle' | 'copied' | 'failed') {
    copyStatus = next;
    clearTimeout(copyStatusTimer);
    if (next !== 'idle') {
      copyStatusTimer = setTimeout(() => {
        copyStatus = 'idle';
      }, COPY_STATUS_MS);
    }
  }

  async function copyCurrentClip(silent = false) {
    if (!formattedClipText) return;
    try {
      await writeClipboard(formattedClipText);
      if (!silent) {
        setCopyStatus('copied');
        flashTokens();
      }
    } catch (e) {
      console.error('[webtomd] failed to write clipboard:', e);
      setCopyStatus('failed');
    }
  }

  async function handlePresetChange() {
    try {
      await setSettings({ lastUsedPreset: activePresetId });
    } catch (e) {
      console.error('[webtomd] failed to save preset setting:', e);
    }
    copyCurrentClip();
  }
</script>

<div class="popup">
  <header class="popup-header">
    <span class="popup-brand-name">WebToMD</span>
  </header>

  {#if status === 'loading'}
    <div class="popup-body">
      <div class="article-meta" aria-hidden="true">
        <div class="meta-skeleton title-skeleton"></div>
        <div class="meta-skeleton site-skeleton"></div>
      </div>
      <div class="tab-skeleton" aria-hidden="true">
        <div class="meta-skeleton tab-skeleton-line"></div>
      </div>
      <div class="preview-panel" aria-busy="true" aria-label="Loading preview">
        <div class="skeleton-lines">
          {#each Array(5) as _, i}
            <div class="skeleton-line" style:animation-delay="{i * 0.1}s"></div>
          {/each}
        </div>
      </div>
    </div>
    <footer class="popup-footer">
      <span class="footer-tokens">~— tokens</span>
    </footer>
  {:else if status === 'error'}
    <div class="popup-body">
      <p class="error-banner" role="alert">{errorText}</p>
    </div>
    <footer class="popup-footer">
      <span class="footer-tokens">~— tokens</span>
      {#if copyStatus === 'failed'}
        <span class="footer-status error">Copy failed</span>
      {/if}
    </footer>
  {:else}
    <div class="popup-body">
      <div class="article-meta">
        <h2 class="article-title">{clip?.title || 'Untitled'}</h2>
        {#if clip?.kind === 'page' && clip.siteName}
          <p class="article-site">{clip.siteName}</p>
        {/if}
      </div>

      <PresetTabs bind:activeId={activePresetId} onChange={handlePresetChange} />

      <div class="preview-panel">
        <pre class="preview-content">{formattedClipText}</pre>
      </div>
    </div>

    <footer class="popup-footer">
      <span class="footer-tokens" class:flash={tokenFlash}>
        ~{tokenCount.toLocaleString('en-US')} tokens
      </span>
      {#if copyStatus === 'copied'}
        <span class="footer-status">Copied</span>
      {:else if copyStatus === 'failed'}
        <span class="footer-status error">Copy failed</span>
      {/if}
    </footer>
  {/if}
</div>

<style>
  .meta-skeleton {
    border-radius: 4px;
    background: linear-gradient(
      90deg,
      var(--canvas) 0%,
      var(--border) 50%,
      var(--canvas) 100%
    );
    background-size: 200% 100%;
    animation: skeleton-shimmer 1.4s ease-in-out infinite;
  }

  .title-skeleton {
    height: 14px;
    width: 72%;
    margin-bottom: 8px;
  }

  .site-skeleton {
    height: 10px;
    width: 38%;
  }

  .tab-skeleton {
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
  }

  .tab-skeleton-line {
    height: 10px;
    width: 55%;
  }
</style>
