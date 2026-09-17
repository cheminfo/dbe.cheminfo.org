/**
 * The header button that turns what is on screen into a link or an iframe.
 *
 * The address is kept in step with the state by the shell's route sync, so the
 * shared dialog reads the page, its entry and the calculator's configuration
 * straight off the location.
 */

import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement } from 'react';
import { useState } from 'react';
import {
  ShareButton as FamilyShareButton,
  ShareDialog,
} from 'react-cheminfo/ui';

import type { TabId } from '../state/index.ts';
import { TAB_LABELS, state } from '../state/index.ts';

import { shareVocabularyOf } from './vocabulary.ts';

/**
 * How tall the frame each page needs is, measured on the page itself: a
 * question with its hints is taller than a calculator, and a calculator with an
 * editor beside its readout is taller than one section of the explanation.
 *
 * The heights are written into the snippet because no sibling of the family
 * posts its height to its host, so a frame that is too short simply scrolls.
 */
const FRAME_HEIGHTS: Record<TabId, number> = {
  calculator: 640,
  learn: 560,
  exercises: 720,
  reference: 700,
  about: 700,
};

/**
 * Open the share dialog.
 * @returns The button, and the dialog while it is open.
 */
export function ShareButton(): ReactElement {
  useSignals();
  const [isOpen, setIsOpen] = useState(false);
  const tab = state.view.activeTab.value;
  const title = TAB_LABELS[tab];

  return (
    <>
      <FamilyShareButton
        onClick={() => {
          setIsOpen(true);
        }}
      />
      <ShareDialog
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
        }}
        vocabulary={shareVocabularyOf(tab)}
        title={title}
        frameTitle={`dbe.cheminfo.org — ${title}`}
        frameHeight={FRAME_HEIGHTS[tab]}
      />
    </>
  );
}
