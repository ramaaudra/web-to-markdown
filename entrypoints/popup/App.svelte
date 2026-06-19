<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { htmlToMarkdown } from '~/lib/extractor';
  import { writeClipboard } from '~/lib/clipboard';
  import { PRESETS } from '~/lib/presets';
  import { formatClip } from '~/lib/frontmatter';
  import { estimateTokens } from '~/lib/token';
  import type { PresetId } from '~/types/preset';
  import PresetTabs from './components/PresetTabs.svelte';
  import TokenCount from './components/TokenCount.svelte';

  type State = 'loading' | 'ready' | 'error';

  let status = $state<State>('loading');
  let errorText = $state('');
  let showCopySuccess = $state(false);

  // Cached page extraction raw data
  let rawArticle = $state<any>(null);
  let tabUrl = $state('');
  let tabTitle = $state('');
  let fetchedAt = $state('');

  // Active preset selection
  let activePresetId = $state<PresetId>('chat-ready');
  const activePreset = $derived(PRESETS[activePresetId]);

  // Derived page clip object
  const clip = $derived.by(() => {
    if (!rawArticle) return null;
    return {
      kind: 'page' as const,
      url: tabUrl,
      title: rawArticle.title || tabTitle || tabUrl,
      siteName: rawArticle.siteName ?? undefined,
      author: rawArticle.byline ?? undefined,
      publishedAt: rawArticle.publishedTime ?? undefined,
      markdown: htmlToMarkdown(rawArticle.content || '', activePreset),
      fetchedAt,
    };
  });

  // Derived formatted Markdown text and token count
  const formattedClipText = $derived(clip ? formatClip(clip, activePreset) : '');
  const tokenCount = $derived(clip ? estimateTokens(formattedClipText) : 0);

  // Derived 5-line preview of the copied content
  const previewText = $derived.by(() => {
    if (!formattedClipText) return '';
    return formattedClipText
      .split('\n')
      .slice(0, 5)
      .join('\n')
      .trim();
  });

  onMount(async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        throw new Error('No active tab.');
      }
      tabUrl = tab.url ?? '';
      tabTitle = tab.title ?? '';
      fetchedAt = new Date().toISOString();

      // Execute script once to get RawArticle
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['/content-scripts/extract-page.js'],
        world: 'ISOLATED',
      });
      rawArticle = results?.[0]?.result;
      if (!rawArticle || !rawArticle.content) {
        throw new Error('Readability returned no content');
      }

      // Format and copy the default preset (Chat-ready)
      await copyCurrentClip(true);
      status = 'ready';
    } catch (e) {
      status = 'error';
      errorText = e instanceof Error ? e.message : 'Failed to extract page.';
    }
  });

  async function copyCurrentClip(silent = false) {
    if (!formattedClipText) return;
    try {
      await writeClipboard(formattedClipText);
      if (!silent) {
        showCopySuccess = true;
        setTimeout(() => {
          showCopySuccess = false;
        }, 2000);
      }
    } catch (e) {
      console.error('[webtomd] failed to write clipboard:', e);
    }
  }

  function handlePresetChange() {
    // Svelte 5 updates derived state synchronously, so we copy the new clip immediately
    copyCurrentClip();
  }
</script>

<main class="popup-container">
  <header class="header">
    <div class="logo-area">
      <span class="logo-icon">⚡</span>
      <h1 class="logo-title">WebToMD</h1>
    </div>
    <div class="status-indicator">
      {#if showCopySuccess}
        <span class="copied-badge" transition:fade={{ duration: 150 }}>Copied to clipboard!</span>
      {/if}
    </div>
  </header>

  {#if status === 'loading'}
    <div class="loader-container">
      <div class="spinner"></div>
      <p class="loader-text">Analyzing page content...</p>
    </div>
  {:else if status === 'error'}
    <div class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-title">Extraction Failed</p>
      <p class="error-desc">{errorText}</p>
    </div>
  {:else}
    <div class="control-panel">
      <PresetTabs bind:activeId={activePresetId} onChange={handlePresetChange} />
    </div>

    <div class="preview-panel">
      <div class="preview-header">
        <span class="preview-title">{clip?.title || 'No Title'}</span>
        <button class="copy-btn" onclick={() => copyCurrentClip()} title="Copy to clipboard">
          Copy
        </button>
      </div>
      <pre class="preview-content">{previewText}</pre>
    </div>

    <footer class="footer">
      <TokenCount count={tokenCount} />
    </footer>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #e2e8f0;
    background: #0f111a;
    width: 380px;
    overflow: hidden;
  }

  .popup-container {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-sizing: border-box;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 28px;
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .logo-icon {
    font-size: 16px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .logo-title {
    margin: 0;
    font-family: 'Outfit', sans-serif;
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(to right, #ffffff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .copied-badge {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.2);
    color: #10b981;
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 9999px;
  }

  .loader-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    gap: 12px;
  }

  .spinner {
    width: 28px;
    height: 28px;
    border: 3px solid rgba(99, 102, 241, 0.1);
    border-top-color: #6366f1;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loader-text {
    margin: 0;
    font-size: 13px;
    color: #64748b;
  }

  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
    background: rgba(239, 68, 68, 0.05);
    border: 1px solid rgba(239, 68, 68, 0.15);
    border-radius: 12px;
    text-align: center;
    gap: 8px;
  }

  .error-icon {
    font-size: 24px;
  }

  .error-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #ef4444;
  }

  .error-desc {
    margin: 0;
    font-size: 12px;
    color: #94a3b8;
  }

  .preview-panel {
    background: #161925;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 14px;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }

  .preview-title {
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #f1f5f9;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 240px;
  }

  .copy-btn {
    background: #1f2438;
    color: #cbd5e1;
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .copy-btn:hover {
    background: #2b324e;
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .preview-content {
    margin: 0;
    padding: 10px;
    background: #0f111a;
    border-radius: 8px;
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 11px;
    line-height: 1.5;
    color: #94a3b8;
    height: 110px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-all;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }

  /* Custom scrollbar for preview */
  .preview-content::-webkit-scrollbar {
    width: 6px;
  }
  .preview-content::-webkit-scrollbar-track {
    background: transparent;
  }
  .preview-content::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 99px;
  }
  .preview-content::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .footer {
    border-top: 1px solid rgba(255, 255, 255, 0.05);
    padding-top: 12px;
    display: flex;
    align-items: center;
  }
</style>