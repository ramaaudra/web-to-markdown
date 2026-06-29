<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    heading,
    lede,
    children,
  }: {
    heading: string;
    lede?: string;
    children?: Snippet;
  } = $props();
</script>

<svelte:options runes={true} />

<main class="page">
  <div class="page-brand">
    <span class="page-brand-icon" aria-hidden="true">⚡</span>
    <span>WebToMD</span>
  </div>

  <h1 class="page-heading">{heading}</h1>
  {#if lede}
    <p class="page-lede">{lede}</p>
  {/if}

  {@render children?.()}
</main>
