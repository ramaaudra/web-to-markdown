<script lang="ts">
  import { setSettings } from '~/lib/storage';

  async function handleDismiss() {
    try {
      await setSettings({ onboardingComplete: true });

      // Close the tab
      const currentTab = await chrome.tabs.getCurrent();
      if (currentTab?.id !== undefined) {
        await chrome.tabs.remove(currentTab.id);
      } else {
        window.close();
      }
    } catch (e) {
      console.error('[webtomd] failed to dismiss welcome onboarding:', e);
      window.close();
    }
  }
</script>

<main class="welcome-container">
  <div class="card animate-fade-in">
    <header class="header">
      <div class="logo-area">
        <span class="logo-icon">⚡</span>
        <h1 class="logo-title">WebToMD</h1>
      </div>
    </header>

    <div class="hero">
      <h2 class="hero-title">Welcome to WebToMD!</h2>
      <p class="hero-desc">
        Extract the main content of any webpage or selection as clean, token-efficient Markdown — optimized for pasting into AI contexts.
      </p>
    </div>

    <div class="quickstart">
      <h3 class="quickstart-title">3-Step Quickstart</h3>
      <div class="steps-grid">
        <div class="step-card">
          <div class="step-num">1</div>
          <h4 class="step-title">Select Text</h4>
          <p class="step-desc">Highlight any specific text content on a web page, or skip highlighting to extract the whole page.</p>
        </div>
        <div class="step-card">
          <div class="step-num">2</div>
          <h4 class="step-title">Copy Content</h4>
          <p class="step-desc">Right-click and select <strong>"Copy Selection as MD"</strong>, or click the WebToMD icon in your extension bar.</p>
        </div>
        <div class="step-card">
          <div class="step-num">3</div>
          <h4 class="step-title">Paste to AI</h4>
          <p class="step-desc">Paste the clean Markdown directly into ChatGPT, Claude, or your personal obsidian vault/notebooks.</p>
        </div>
      </div>
    </div>

    <button class="dismiss-btn" onclick={handleDismiss}>
      Got it, let's go!
    </button>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    color: #e2e8f0;
    background: #090b11;
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 20px;
    box-sizing: border-box;
  }

  .welcome-container {
    width: 100%;
    max-width: 720px;
  }

  .card {
    background: #0f111a;
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    text-align: center;
  }

  .logo-area {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logo-icon {
    font-size: 26px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .logo-title {
    margin: 0;
    font-family: 'Outfit', sans-serif;
    font-size: 28px;
    font-weight: 800;
    background: linear-gradient(to right, #ffffff, #94a3b8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .hero {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 520px;
  }

  .hero-title {
    margin: 0;
    font-family: 'Outfit', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #ffffff;
  }

  .hero-desc {
    margin: 0;
    font-size: 14px;
    color: #94a3b8;
    line-height: 1.6;
  }

  .quickstart {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .quickstart-title {
    margin: 0;
    font-family: 'Outfit', sans-serif;
    font-size: 16px;
    font-weight: 600;
    color: #cbd5e1;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .steps-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }

  @media (max-width: 600px) {
    .steps-grid {
      grid-template-columns: 1fr;
    }
  }

  .step-card {
    background: #161925;
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    transition: all 0.2s ease;
  }

  .step-card:hover {
    transform: translateY(-2px);
    background: #1f2438;
    border-color: rgba(255, 255, 255, 0.08);
  }

  .step-num {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #ffffff;
    font-size: 14px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(99, 102, 241, 0.3);
  }

  .step-title {
    margin: 0;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 600;
    color: #f1f5f9;
  }

  .step-desc {
    margin: 0;
    font-size: 12px;
    color: #94a3b8;
    line-height: 1.5;
  }

  .dismiss-btn {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #ffffff;
    border: none;
    padding: 12px 32px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    transition: all 0.2s ease;
  }

  .dismiss-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.6);
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
  }

  .dismiss-btn:active {
    transform: translateY(1px);
  }

  /* Entrance animation */
  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
