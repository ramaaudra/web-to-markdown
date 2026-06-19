// Domain types for a Web Clip (the unit of output).
// See CONTEXT.md for the canonical glossary.

/** A Web Clip produced from the user's text selection on a page. */
export interface SelectionClip {
  readonly kind: 'selection';
  /** Source page URL. */
  readonly url: string;
  /** Article/page title (best-effort). */
  readonly title: string;
  /** The selected HTML fragment converted to Markdown. */
  readonly markdown: string;
  /** Wall-clock timestamp of when the clip was produced. */
  readonly fetchedAt: string;
}

/** A Web Clip produced from the page's main content. */
export interface PageClip {
  readonly kind: 'page';
  /** Source page URL. */
  readonly url: string;
  /** Article title. */
  readonly title: string;
  /** Site name (when available). */
  readonly siteName?: string;
  /** Byline (when available). */
  readonly author?: string;
  /** Publication date in ISO 8601 (YYYY-MM-DD) when available. */
  readonly publishedAt?: string;
  /** The main content converted to Markdown. */
  readonly markdown: string;
  /** Wall-clock timestamp of when the clip was produced. */
  readonly fetchedAt: string;
}

/** Any Web Clip — discriminated by `kind`. */
export type WebClip = SelectionClip | PageClip;
