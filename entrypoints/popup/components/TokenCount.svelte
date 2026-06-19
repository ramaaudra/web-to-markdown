<script lang="ts">
  let { count = 0 } = $props<{
    count: number;
  }>();

  // Format count with comma separators (e.g. 1,247)
  const formattedCount = $derived(count.toLocaleString('en-US'));

  // Determine token budget category: green (small), orange (medium), purple (large)
  const statusClass = $derived.by(() => {
    if (count < 2000) return 'status-low';
    if (count < 8000) return 'status-medium';
    return 'status-high';
  });

  const statusLabel = $derived.by(() => {
    if (count < 2000) return 'Lightweight';
    if (count < 8000) return 'Standard';
    return 'Heavy';
  });
</script>

<div class="token-wrapper">
  <div class="token-label">Estimated Size</div>
  <div class="token-badge {statusClass}">
    <span class="pulse-dot"></span>
    <span class="count-text">~{formattedCount} tokens</span>
    <span class="category-tag">{statusLabel}</span>
  </div>
</div>

<style>
  .token-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    font-family: 'Outfit', sans-serif;
  }

  .token-label {
    font-size: 13px;
    font-weight: 500;
    color: #94a3b8;
  }

  .token-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .count-text {
    font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, monospace;
    font-size: 12px;
  }

  .category-tag {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 1px 6px;
    border-radius: 4px;
    font-weight: 700;
  }

  /* Low status: Green styling */
  .status-low {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.2);
  }
  .status-low .pulse-dot {
    background: #10b981;
    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
  }
  .status-low .category-tag {
    background: rgba(16, 185, 129, 0.15);
  }

  /* Medium status: Orange styling */
  .status-medium {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
  }
  .status-medium .pulse-dot {
    background: #f59e0b;
    box-shadow: 0 0 8px rgba(245, 158, 11, 0.6);
  }
  .status-medium .category-tag {
    background: rgba(245, 158, 11, 0.15);
  }

  /* High status: Purple styling */
  .status-high {
    background: rgba(139, 92, 246, 0.1);
    color: #a78bfa;
    border: 1px solid rgba(139, 92, 246, 0.2);
  }
  .status-high .pulse-dot {
    background: #8b5cf6;
    box-shadow: 0 0 8px rgba(139, 92, 246, 0.6);
  }
  .status-high .category-tag {
    background: rgba(139, 92, 246, 0.15);
  }

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    position: relative;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(0.95);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.15);
      opacity: 1;
    }
    100% {
      transform: scale(0.95);
      opacity: 0.8;
    }
  }
</style>
