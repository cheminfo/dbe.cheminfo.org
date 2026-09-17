/**
 * The working behind the drawing's number: where its rings and its pi bonds
 * came from.
 *
 * The rings are not perceived, they are counted — `bonds − atoms + parts` — so
 * the four numbers the count is made of are shown next to it and a reader can
 * redo the arithmetic. The multiple bonds are grouped by what they are rather
 * than listed one by one: `3 × C=C` is what a chemist sees in benzene, not six
 * bond indices.
 */

import { Callout, Tag } from '@blueprintjs/core';
import type { ReactElement } from 'react';
import { pluralize } from 'react-cheminfo/core';

import type { ExpandedAtom, StructureDbe } from '../../dbe/types.ts';

/** What {@link StructureBreakdown} needs. */
export interface StructureBreakdownProps {
  /** What the drawing counted. */
  readonly value: StructureDbe;
}

/**
 * The counts under the drawing.
 * @param props - See {@link StructureBreakdownProps}.
 * @returns The four counts, the multiple bonds, and anything that makes the
 * number a guess rather than a fact.
 */
export function StructureBreakdown(
  props: StructureBreakdownProps,
): ReactElement {
  const { value } = props;

  return (
    <div className="calc-readout" data-testid="structure-breakdown">
      <dl className="calc-stats">
        <Stat label="Rings" value={value.rings} />
        <Stat label="Pi bonds" value={value.piBonds} />
        <Stat label="Atoms" value={value.atoms} />
        <Stat label="Bonds" value={value.bonds} />
        <Stat label="Parts" value={value.fragments} />
        <Stat label="Charge" value={value.charge} />
      </dl>

      <p className="calc-note">
        {`Rings are counted, not perceived: ${value.bonds} ${pluralize(value.bonds, 'bond')} − ${value.atoms} ${pluralize(value.atoms, 'atom')} + ${value.fragments} ${pluralize(value.fragments, 'part')} = ${value.rings}.`}
      </p>

      {value.multiple.length > 0 && (
        <div className="calc-tags">
          {groupedBonds(value).map((group) => (
            <Tag minimal key={group.label}>
              {`${group.count} × ${group.label}`}
            </Tag>
          ))}
        </div>
      )}

      {value.expanded.length > 0 && (
        <p className="calc-note calc-note--accent">
          {value.expanded.map(expandedSentence).join(' ')}
        </p>
      )}

      {value.caveats.map((caveat) => (
        <Callout
          compact
          key={caveat.kind}
          intent={caveat.kind === 'radical' ? 'warning' : 'danger'}
        >
          {caveat.message}
        </Callout>
      ))}
    </div>
  );
}

/** One multiple-bond kind and how many of them the drawing has. */
interface BondGroup {
  label: string;
  count: number;
}

function Stat(props: { label: string; value: number }): ReactElement {
  const { label, value } = props;

  return (
    <div className="calc-stats__item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/**
 * The multiple bonds by what they join, in the order they were first met.
 * @param value - What the drawing counted.
 * @returns One entry per kind of bond, with how many there are.
 */
function groupedBonds(value: StructureDbe): readonly BondGroup[] {
  const groups: BondGroup[] = [];
  const seen = new Map<string, BondGroup>();
  for (const { label } of value.multiple) {
    const group = seen.get(label);
    if (group === undefined) {
      const added = { label, count: 1 };
      seen.set(label, added);
      groups.push(added);
    } else {
      group.count++;
    }
  }
  return groups;
}

/** What a hypervalent atom does to the formula's half of the page. */
function expandedSentence(atom: ExpandedAtom): string {
  return `The ${atom.symbol} is drawn making ${atom.valence} bonds, and the shared table counts it at ${atom.standard}.`;
}
