import { defineBackground } from 'wxt/utils/define-background';

// WebToMD — service worker (Manifest V3).
//
// Responsibilities (v1):
//   - Register and refresh the right-click context menu items.
//   - Handle context-menu clicks: extract content from the active tab,
//     format via the current Preset, write to clipboard, show toast.
//   - Persist last-used Preset and onboarding flag in chrome.storage.sync.
//
// v1 placeholder: wiring only. Extraction, presets, and toast logic land in
// subsequent commits — see ADR-0005 and the v1 phasing in CONTEXT.md.

export default defineBackground(() => {
  console.log('[webtomd] background service worker booted');

  // TODO(v1): chrome.runtime.onInstalled — open welcome page on first install.
  // TODO(v1): chrome.contextMenus.create for "Copy Selection as MD" + "Copy Page as MD".
  // TODO(v1): chrome.contextMenus.onClicked handler.
});
