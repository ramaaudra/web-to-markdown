# 0005 — Three named presets, Chat-ready as default

WebToMD ships three named Presets rather than a single default + per-clip toggles:

- **Chat-ready** (default) — strip images and links, keep frontmatter. Cleanest output for pasting into an AI chat.
- **Reference** — strip images, keep inline links, keep frontmatter. Lets the AI cite the source URL when answering.
- **Archive** — keep image URLs, keep links, keep frontmatter. For saving into Obsidian / Notes for re-reading.

A live token estimate in the popup makes the cost of each Preset visible, so users switch up or down based on the article rather than guessing.

Rejected: single preset with per-clip toggles (no namesake feature, more friction for first-time users); more than three presets (UI clutter for marginal use cases).

Alternative architectures (custom user-defined presets, per-site overrides) are tracked in the v2 backlog.
