/**
 * The optional layers of the readout: what the calculator draws besides the
 * number itself.
 *
 * One vocabulary, read by three things: the chips that switch them, the stored
 * preferences that remember them, and the `?flags=` parameter a shared link
 * pins them with. A learn section names the layers it opens with from the same
 * list, so a section and a link say the same thing in the same words.
 */

/** Every layer, in the order the chips show them. */
export const DISPLAY_FLAG_KEYS = [
  'breakdown',
  'highlight',
  'hydrogens',
] as const;

/** One of {@link DISPLAY_FLAG_KEYS}. */
export type DisplayFlagKey = (typeof DISPLAY_FLAG_KEYS)[number];

/** What a chip reads, and whether the site opens with the layer drawn. */
export interface DisplayFlagMeta {
  key: DisplayFlagKey;
  /** What the chip reads. */
  label: string;
  /** What the layer adds, for the pointer and the share dialog. */
  description: string;
  /** Whether a visitor who has changed nothing sees it. */
  initial: boolean;
}

/**
 * The layers, described once.
 *
 * The working is on by default in both halves: the site exists to show *why* a
 * number is what it is, and a bare number teaches nothing. Explicit hydrogens
 * are off — they are a check a student asks for, and they crowd every drawing
 * that is not being checked.
 */
export const DISPLAY_FLAGS: readonly DisplayFlagMeta[] = [
  {
    key: 'breakdown',
    label: 'Working',
    description: 'What each element contributes, element by element.',
    initial: true,
  },
  {
    key: 'highlight',
    label: 'Highlight',
    description: 'The rings and the multiple bonds painted on the drawing.',
    initial: true,
  },
  {
    key: 'hydrogens',
    label: 'Hydrogens',
    description: 'Every hydrogen drawn, rather than implied by the valence.',
    initial: false,
  },
];

/**
 * Whether a string names one of the layers.
 * @param value - Candidate name, from a link or a learn section.
 * @returns True when it is a {@link DisplayFlagKey}.
 */
export function isDisplayFlagKey(value: string): value is DisplayFlagKey {
  for (const key of DISPLAY_FLAG_KEYS) {
    if (key === value) return true;
  }
  return false;
}
