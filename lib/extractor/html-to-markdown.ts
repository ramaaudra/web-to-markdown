import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import type { ImagePolicy, LinkPolicy } from '~/types/preset';

export interface PresetConvertOptions {
  readonly imagePolicy: ImagePolicy;
  readonly linkPolicy: LinkPolicy;
}

/**
 * Convert HTML to Markdown with a Preset's image/link policy applied.
 * Requires a DOM (extension page or tab content script) — not a service worker.
 */
export function htmlToMarkdown(
  html: string,
  preset: PresetConvertOptions
): string {
  const td = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '_',
  });
  td.use(gfm);

  if (preset.imagePolicy === 'strip') {
    td.addRule('strip-images', {
      filter: 'img',
      replacement: () => '',
    });
  }

  if (preset.linkPolicy === 'strip') {
    td.addRule('strip-links', {
      filter: 'a',
      replacement: (content) => content,
    });
  }

  return td.turndown(html);
}
