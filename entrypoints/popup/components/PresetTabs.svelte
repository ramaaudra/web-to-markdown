<script lang="ts">
  import type { PresetId } from '~/types/preset';

  let { activeId = $bindable(), onChange } = $props<{
    activeId: PresetId;
    onChange?: (id: PresetId) => void;
  }>();

  const tabs: { id: PresetId; label: string; description: string }[] = [
    {
      id: 'chat-ready',
      label: 'Chat-ready',
      description: 'AI chat',
    },
    {
      id: 'reference',
      label: 'Reference',
      description: 'Citations',
    },
    {
      id: 'archive',
      label: 'Archive',
      description: 'Full notes',
    },
  ];

  function selectTab(id: PresetId) {
    activeId = id;
    if (onChange) {
      onChange(id);
    }
  }
</script>

<div class="tabs-container" role="tablist" aria-label="Web clip presets">
  <!-- Sliding active background pill -->
  <div class="active-pill" class:pos-0={activeId === 'chat-ready'} class:pos-1={activeId === 'reference'} class:pos-2={activeId === 'archive'}></div>

  {#each tabs as tab}
    <button
      type="button"
      class="tab-btn"
      class:active={activeId === tab.id}
      onclick={() => selectTab(tab.id)}
      title={tab.description}
      role="tab"
      aria-selected={activeId === tab.id}
    >
      <span class="label">{tab.label}</span>
    </button>
  {/each}
</div>

<style>
  .tabs-container {
    position: relative;
    display: flex;
    background: #1e222b;
    border: 1px solid #2d3343;
    padding: 3px;
    border-radius: 12px;
    width: 100%;
    box-sizing: border-box;
    z-index: 1;
    overflow: hidden;
  }

  .tab-btn {
    position: relative;
    flex: 1;
    background: transparent;
    border: none;
    padding: 8px 12px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 500;
    color: #94a3b8;
    cursor: pointer;
    text-align: center;
    border-radius: 9px;
    transition: color 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 2;
    outline: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .tab-btn:hover {
    color: #f1f5f9;
  }

  .tab-btn.active {
    color: #ffffff;
    font-weight: 600;
  }

  .active-pill {
    position: absolute;
    top: 3px;
    bottom: 3px;
    left: 3px;
    width: calc(33.333% - 4px);
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border-radius: 9px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }

  .pos-0 {
    transform: translateX(0%);
  }

  .pos-1 {
    transform: translateX(100%);
    /* Adjust for padding gap */
    transform: translateX(calc(100% + 2px));
  }

  .pos-2 {
    transform: translateX(200%);
    /* Adjust for padding gap */
    transform: translateX(calc(200% + 4px));
  }
</style>
