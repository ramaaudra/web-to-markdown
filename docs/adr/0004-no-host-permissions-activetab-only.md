# 0004 — No host permissions; `activeTab` only

The extension never asks for `<all_urls>` or any per-site host permission. All extraction happens on-demand via `chrome.scripting.executeScript()` after a user gesture (icon click or context-menu click), gated by `activeTab`.

Trade-off: we cannot inject a persistent content script (e.g. for in-page "select to highlight" affordances). For v1 we do not need one — selection clipping is triggered from the right-click menu, which is itself a user gesture.

Why it matters: Chrome shows a scary install warning for `<all_urls>`. Dropping it improves Chrome Web Store install conversion and signals trustworthiness to privacy-conscious users.
