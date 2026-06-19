<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte';
  import { extractPage } from '~/lib/extractor';
  import { writeClipboard } from '~/lib/clipboard';
  import { CHAT_READY_PRESET } from '~/lib/presets';
  import type { PageClip } from '~/types/clip';

  type State = 'loading' | 'ready' | 'error';

  let status = $state<State>('loading');
  let titleText = $state('');
  let previewText = $state('');
  let errorText = $state('');

  onMount(async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        throw new Error('No active tab.');
      }
      const clip: PageClip = await extractPage(tab.id, CHAT_READY_PRESET);
      titleText = clip.title;
      previewText = previewOf(clip.markdown);
      await writeClipboard(clip.markdown);
      status = 'ready';
    } catch (e) {
      status = 'error';
      errorText = e instanceof Error ? e.message : 'Failed to extract page.';
    }
  });

  function previewOf(md: string): string {
    return md
      .split('\n')
      .slice(0, 4)
      .join('\n')
      .trim();
  }
</script>

<main>
  {#if status === 'loading'}
    <p class="muted">Extracting page…</p>
  {:else if status === 'error'}
    <h1>WebToMD</h1>
    <p class="error">{errorText}</p>
  {:else}
    <h1>{titleText}</h1>
    <pre class="preview">{previewText}</pre>
    <p class="muted">Copied to clipboard. Paste anywhere.</p>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    font-family:
      ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
    color: #1f2328;
    background: #ffffff;
  }
  main {
    padding: 16px;
    min-width: 360px;
    max-width: 480px;
  }
  h1 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    line-height: 1.3;
    word-break: break-word;
  }
  .preview {
    margin: 0 0 8px;
    padding: 8px;
    font-family:
      ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 12px;
    line-height: 1.5;
    color: #57606a;
    background: #f6f8fa;
    border-radius: 6px;
    max-height: 120px;
    overflow: auto;
    white-space: pre-wrap;
  }
  .muted {
    margin: 0;
    font-size: 13px;
    color: #57606a;
  }
  .error {
    margin: 0;
    font-size: 13px;
    color: #cf222e;
  }
</style>