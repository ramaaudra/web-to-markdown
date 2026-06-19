// lib/frontmatter — handles YAML frontmatter serialization and clip composition.
//
// Composes the final text block copied to the clipboard based on the active Preset.
// Pure functions — primary test seam for Slice 3.

import type { WebClip } from '~/types/clip';
import type { Preset } from '~/types/preset';

export interface FrontmatterMeta {
  url: string;
  title: string;
  fetched_at: string;
  date?: string;
  author?: string;
  site_name?: string;
}

/**
 * Format a publication date string to YYYY-MM-DD format.
 */
export function formatPublicationDate(dateStr: string): string | undefined {
  if (!dateStr) return undefined;

  // 1. Direct match YYYY-MM-DD regex at the start
  const regexMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (regexMatch) {
    return regexMatch[0];
  }

  // 2. Parse using Date as fallback
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    const date = new Date(parsed);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  return undefined;
}

/**
 * Serialize a string value to be safe for YAML, double-quoting and escaping
 * using JSON format if the value contains special characters or matches reserved words/numbers.
 */
export function serializeYamlValue(val: string): string {
  const needsQuoting =
    val === '' ||
    val.includes('"') ||
    val.includes("'") ||
    val.includes('\\') ||
    /^[ \t]|[ \t]$/.test(val) || // leading/trailing spaces
    /[\n\r]/.test(val) || // newlines
    /[:\s]#/.test(val) || // comments
    /:\s|:$/.test(val) || // colons followed by space or at end
    /^[-?{}[\]&*#?|><=!%@`]/.test(val) || // special starting characters
    /^(true|false|null|NaN|undefined)$/i.test(val) || // reserved words
    /^-?\d+(\.\d+)?$/.test(val); // numbers

  if (needsQuoting) {
    return JSON.stringify(val);
  }
  return val;
}

/**
 * Serialize the metadata fields into a YAML block string.
 * Omit optional fields that are not provided.
 */
export function serializeFrontmatter(meta: FrontmatterMeta): string {
  const lines: string[] = ['---'];

  // Required fields
  lines.push(`url: ${serializeYamlValue(meta.url)}`);
  lines.push(`title: ${serializeYamlValue(meta.title)}`);
  lines.push(`fetched_at: ${serializeYamlValue(meta.fetched_at)}`);

  // Optional fields
  if (meta.date !== undefined && meta.date !== null && meta.date !== '') {
    const formatted = formatPublicationDate(meta.date);
    if (formatted) {
      lines.push(`date: ${serializeYamlValue(formatted)}`);
    }
  }

  if (meta.author !== undefined && meta.author !== null && meta.author !== '') {
    lines.push(`author: ${serializeYamlValue(meta.author)}`);
  }

  if (meta.site_name !== undefined && meta.site_name !== null && meta.site_name !== '') {
    lines.push(`site_name: ${serializeYamlValue(meta.site_name)}`);
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * Pure composition function. Prepends YAML frontmatter when the Preset requests it.
 */
export function formatClip(clip: WebClip, preset: Preset): string {
  if (preset.frontmatter) {
    const meta: FrontmatterMeta = {
      url: clip.url,
      title: clip.title,
      fetched_at: clip.fetchedAt,
    };

    if (clip.kind === 'page') {
      if (clip.publishedAt) {
        meta.date = clip.publishedAt;
      }
      if (clip.author) {
        meta.author = clip.author;
      }
      if (clip.siteName) {
        meta.site_name = clip.siteName;
      }
    }

    return serializeFrontmatter(meta) + '\n' + clip.markdown;
  }

  return clip.markdown;
}
