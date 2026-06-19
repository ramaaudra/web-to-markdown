<script lang="ts">
  // WebToMD popup — v1 scaffold.
  // Surface (locked): preset tabs + preview + token count + auto-copy.
  // See ADR-0005 for the three-preset model.
</script>

<main>
  <h1>WebToMD</h1>
  <p class="muted">Popup scaffold — preset tabs, preview, and token count land next.</p>
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
  }
  .muted {
    margin: 0;
    font-size: 13px;
    color: #57606a;
  }
</style>
