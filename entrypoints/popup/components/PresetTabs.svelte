<script lang="ts">
  import { PRESETS, PRESET_ORDER } from '~/lib/presets';
  import type { PresetId } from '~/types/preset';

  let { activeId = $bindable(), onChange } = $props<{
    activeId: PresetId;
    onChange?: (id: PresetId) => void;
  }>();

  const activePreset = $derived(PRESETS[activeId as PresetId]);

  function selectTab(id: PresetId) {
    if (id === activeId) return;
    activeId = id;
    onChange?.(id);
  }
</script>

<div class="preset-tabs">
  <div class="tab-row" role="tablist" aria-label="Web clip presets">
    {#each PRESET_ORDER as id}
      {@const preset = PRESETS[id]}
      <button
        type="button"
        class="tab-btn"
        class:active={activeId === id}
        onclick={() => selectTab(id)}
        role="tab"
        aria-selected={activeId === id}
      >
        {preset.label}
      </button>
    {/each}
  </div>
  <p class="preset-desc">{activePreset.description}</p>
</div>

<style>
  .preset-tabs {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .tab-row {
    display: flex;
    gap: 0;
    border-bottom: 1px solid var(--border);
  }

  .tab-btn {
    flex: 1;
    padding: 8px 4px 10px;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -1px;
    background: transparent;
    font-family: inherit;
    font-size: 12px;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    transition:
      color 0.15s ease,
      border-color 0.15s ease;
  }

  .tab-btn:hover {
    color: var(--fg);
  }

  .tab-btn.active {
    color: var(--fg);
    font-weight: 600;
    border-bottom-color: var(--accent);
  }

  .preset-desc {
    margin: 0;
    font-size: 12px;
    line-height: 1.45;
    color: var(--muted);
  }
</style>
