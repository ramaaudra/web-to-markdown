// Ambient declarations for packages without bundled types.

declare module 'turndown-plugin-gfm' {
  import type { Plugin } from 'turndown';
  export const gfm: Plugin;
}
