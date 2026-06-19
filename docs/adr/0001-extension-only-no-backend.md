# 0001 — Extension-only MVP, no backend service

WebToMD v1 ships as a Chrome extension with no server-side component. URL-to-Markdown conversion (problem #3 in the original brief) is deferred to v2 because the use case is already covered by Readability+Turndown in the popup for the currently-open page, and a backend would add hosting cost, abuse surface, and operational burden out of proportion to the v1 value.

If v2 ships a URL-to-MD service, the extension can call it via `fetch()` from the right-click "Copy link as MD" flow; this ADR does not foreclose that path.
