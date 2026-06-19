# 0002 — Build on WXT + Svelte 5 + TypeScript

WXT gives us auto-generated MV3 manifests, HMR, and multi-browser support from one codebase. Svelte 5 (runes) keeps the popup small and reactive without React's runtime cost. TypeScript is non-negotiable for the Preset / Frontmatter / WebClip contract that crosses module boundaries.

Rejected: Plasmo (more opinionated, slower iteration), vanilla TS + esbuild (too much popup boilerplate), React (heavier runtime for the surfaces we need).
