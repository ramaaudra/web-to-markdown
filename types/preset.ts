// Preset model. See ADR-0005 for the rationale behind three presets + Chat-ready default.

/** Built-in Preset identifiers. */
export type PresetId = 'chat-ready' | 'reference' | 'archive';

/** How a Preset handles images in the source content. */
export type ImagePolicy = 'strip' | 'keep-url';

/** How a Preset handles links in the source content. */
export type LinkPolicy = 'strip' | 'keep-inline';

/** A named bundle of formatting options applied to a Web Clip. */
export interface Preset {
  readonly id: PresetId;
  readonly label: string;
  readonly description: string;
  readonly imagePolicy: ImagePolicy;
  readonly linkPolicy: LinkPolicy;
  /** Frontmatter is on by default for all v1 presets. */
  readonly frontmatter: true;
}
