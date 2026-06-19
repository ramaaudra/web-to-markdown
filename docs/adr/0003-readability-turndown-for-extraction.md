# 0003 — Extract main content with @mozilla/readability + turndown

`@mozilla/readability` (Mozilla, MIT) gives battle-tested main-content extraction with metadata (title, byline, siteName). `turndown` (MIT) is the de-facto HTML-to-Markdown converter and is what every comparable web clipper (MarkDownload, Obsidian Clipper, Joplin Web Clipper) ships.

Rejected: Defuddle (newer, less battle-tested), Postlight Mercury (commercial), custom heuristics (regression risk). If extraction quality becomes a complaint at scale, v2 can layer in Defuddle or per-site adapters — this ADR does not foreclose that.
