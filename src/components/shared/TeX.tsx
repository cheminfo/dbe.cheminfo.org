/**
 * One inline formula, typeset.
 *
 * The site's whole subject is an identity read from two sides, so the two
 * sides are written the way a chemist writes them on a board — a real stacked
 * half, real math spacing — rather than as a sentence with a `½` character in
 * it. KaTeX renders synchronously, so the formula is in the first paint and
 * never flashes its source.
 *
 * The markup is inserted rather than built as elements because that is the
 * only output KaTeX has. It is safe: the source is built here from numbers the
 * domain counted, never from anything a link or a drawing carries, and KaTeX
 * escapes what it is given.
 */

import katex from 'katex';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

/** What {@link TeX} needs. */
export interface TeXProps {
  /** The expression, in LaTeX: `1\,\text{part} + \tfrac{1}{2}(6) = 4`. */
  readonly math: string;
  /** A class for the span the formula is set in. */
  readonly className?: string;
}

/**
 * An expression, set inline.
 * @param props - See {@link TeXProps}.
 * @returns The typeset formula.
 */
export function TeX(props: TeXProps): ReactElement {
  const { math, className } = props;

  const html = useMemo(
    () =>
      katex.renderToString(math, {
        displayMode: false,
        // A formula that fails to parse is still information: it prints in red
        // rather than taking the page down with it.
        throwOnError: false,
        strict: 'ignore',
      }),
    [math],
  );

  return (
    <span
      className={className}
      // eslint-disable-next-line react/no-danger -- KaTeX has no element output
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
