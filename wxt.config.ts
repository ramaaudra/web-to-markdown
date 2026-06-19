import { defineConfig } from 'wxt';

// https://wxt.dev/api/config.html
export default defineConfig({
  // Modules are declared by package name so WXT can resolve them via the
  // standard resolver. Importing the module function inline is not supported
  // by WXT's config loader — see https://wxt.dev/api/config.html#modules.
  modules: ['@wxt-dev/module-svelte'],

  manifest: {
    name: 'WebToMD',
    short_name: 'WebToMD',
    description:
      'Extract the main content of any webpage as token-efficient Markdown — ready to paste into your AI agent.',
    permissions: [
      'activeTab',
      'scripting',
      'contextMenus',
      'storage',
      'clipboardWrite',
    ],
    action: {
      default_title: 'Copy page as Markdown',
    },
  },

  // Source dirs — keep WXT's defaults; declare for clarity.
  srcDir: '.',
  outDir: '.output',
});
