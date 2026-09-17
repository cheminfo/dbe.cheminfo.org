/**
 * The short explanation: ten sections in three coloured strips, one on screen
 * at a time.
 *
 * A section is a worked configuration rather than a slide — it names a
 * formula, a drawing, or both, and the numbers under the prose are counted
 * live from them. The address carries the section **id**, so `/learn/sulfur`
 * survives a section being inserted before it.
 */

import { Card } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement } from 'react';
import {
  GlossaryProvider,
  PagePart,
  TutorialStepStrip,
} from 'react-cheminfo/ui';

import { LearnStep } from '../components/learn/LearnStep.tsx';
import { GLOSSARY } from '../data/glossary.ts';
import {
  LEARN_LEVELS,
  LEARN_SECTIONS,
  learnSectionById,
  learnSectionIndex,
} from '../data/learn.ts';
import { setLearnSection, state } from '../state/index.ts';

/**
 * The explanation.
 * @returns The strips, the open section, and what it counts.
 */
export function Learn(): ReactElement {
  useSignals();
  const section = learnSectionById(state.view.learn.sectionId.value);
  // A section the tour no longer has resolves to the first one, whose position
  // is 0; `learnSectionIndex` only ever returns −1 for an id nothing carries.
  const index = Math.max(learnSectionIndex(section.id), 0);

  return (
    <GlossaryProvider glossary={GLOSSARY}>
      <section className="learn">
        <PagePart part="steps">
          <Card compact className="learn__steps no-print">
            <TutorialStepStrip
              steps={LEARN_SECTIONS}
              activeIndex={index}
              levelLabels={LEARN_LEVELS}
              onSelect={(position) => {
                setLearnSection(LEARN_SECTIONS[position]?.id ?? null);
              }}
            />
          </Card>
        </PagePart>

        <LearnStep
          key={section.id}
          section={section}
          position={index + 1}
          total={LEARN_SECTIONS.length}
        />
      </section>
    </GlossaryProvider>
  );
}
