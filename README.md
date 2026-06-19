# WebToMD

Chrome extension that extracts the **main content** of any webpage as token-efficient Markdown — optimized for pasting into AI agent contexts.

## Why

Feeding web content to an AI agent usually means one of three pain points:

1. Manual copy-paste is messy (whitespace, nav links, broken formatting).
2. Existing web clippers capture too much (navbar, sidebar, footer, ads, related articles).
3. Routing the agent through a browser MCP burns tokens on navigation overhead.

WebToMD solves (1) and (2) with a Manifest V3 Chrome extension that:

- Detects the page's main content (Mozilla Readability).
- Converts to Markdown (Turndown).
- Wraps the result in YAML frontmatter so the AI can cite it back.
- Ships three named **Presets** (Chat-ready / Reference / Archive) tuned for different AI contexts.
- Surfaces a live **token estimate** in the popup so you can pick the right Preset before committing.
- Works zero-UI for selections (right-click → Copy as MD → in-page toast).

Problem (3) is intentionally out of scope for v1.

## Status

v1 scaffold. Folder structure, manifest, type definitions, and ADRs are in place. Logic lands in subsequent commits.

See [`CONTEXT.md`](./CONTEXT.md) for the domain glossary and [`docs/adr/`](./docs/adr/) for the architectural decisions.

## Development

```sh
pnpm install
pnpm dev          # WXT dev server with HMR — load unpacked from .output/chrome-mv3
pnpm build        # Production build to .output/
pnpm zip          # Build + zip for Chrome Web Store upload
pnpm test         # Vitest
pnpm compile      # tsc --noEmit + svelte-check
```

## License

TBD — see ADR backlog.
