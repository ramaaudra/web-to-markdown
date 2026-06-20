// lib/presets — registry of the three named Presets shipped in v1.
// See ADR-0005 for the rationale.

import type { Preset, PresetId } from '~/types/preset';

export const PRESETS: Record<PresetId, Preset> = {
  'chat-ready': {
    id: 'chat-ready',
    label: 'Chat-ready',
    description: 'Strip images and links. Cleanest output for AI chat.',
    imagePolicy: 'strip',
    linkPolicy: 'strip',
    frontmatter: true,
  },
  reference: {
    id: 'reference',
    label: 'Reference',
    description:
      'Strip images, keep inline links. Lets the AI cite the source.',
    imagePolicy: 'strip',
    linkPolicy: 'keep-inline',
    frontmatter: true,
  },
  archive: {
    id: 'archive',
    label: 'Archive',
    description: 'Keep image URLs and links. For saving into notes.',
    imagePolicy: 'keep-url',
    linkPolicy: 'keep-inline',
    frontmatter: true,
  },
};

/** A Preset guaranteed to strip both images and links — Slice 1's hardcoded fallback. */
export const CHAT_READY_PRESET: Preset = PRESETS['chat-ready'];

export const PRESET_ORDER: readonly PresetId[] = [
  'chat-ready',
  'reference',
  'archive',
] as const;
