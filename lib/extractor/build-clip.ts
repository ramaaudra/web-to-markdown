import type { WebClip } from '~/types/clip';
import type { Preset } from '~/types/preset';
import { htmlToMarkdown } from './html-to-markdown';
import type { RawPageData, RawSelectionData } from './raw-data';

/**
 * Assemble a Web Clip envelope from raw extraction data and pre-converted Markdown.
 * Shared by Page Clip (popup) and Selection Clip (service worker) paths.
 */
export function buildClip(
  data: RawPageData | RawSelectionData,
  preset: Preset,
  markdown: string
): WebClip {
  const fetchedAt = new Date().toISOString();

  if (data.kind === 'page') {
    return {
      kind: 'page',
      url: data.url,
      title: data.title,
      siteName: data.siteName,
      author: data.author,
      publishedAt: data.publishedAt,
      markdown,
      fetchedAt,
    };
  }

  return {
    kind: 'selection',
    url: data.url,
    title: data.title,
    markdown,
    fetchedAt,
  };
}

/** Page Clip and Selection Clip conversion in extension contexts with DOM access. */
export function toClip(
  data: RawPageData | RawSelectionData,
  preset: Preset
): WebClip {
  const html = data.kind === 'page' ? data.content : data.html;
  return buildClip(data, preset, htmlToMarkdown(html, preset));
}
