<script lang="ts">
  // WebToMD welcome page — v1 scaffold.
  // Shown once on `chrome.runtime.onInstalled` (reason === 'install').
  // Content (welcome message + 3-step quickstart + "Got it" button) lands next.
</script>

<main>
  <h1>Welcome to WebToMD</h1>
  <p class="muted">Welcome page scaffold — quickstart and dismiss action land next.</p>
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
    padding: 48px 24px;
    max-width: 560px;
    margin: 0 auto;
  }
  h1 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 700;
  }
  .muted {
    margin: 0;
    font-size: 15px;
    color: #57606a;
  }
</style>
