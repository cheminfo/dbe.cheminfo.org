/**
 * One question: what it asks, what it shows, what is written, and what the
 * marking says.
 *
 * The answer is marked on every keystroke and *Check* commits the attempt, so
 * the case list is live while the status stays deliberate. Nothing is
 * withheld: the hints open one at a time and the solution is always one click
 * away, because getting stuck and reading the answer is part of how the
 * intuition is built.
 */

import { Button, Callout, Card, Tag } from '@blueprintjs/core';
import { useSignals } from '@preact/signals-react/runtime';
import type { ReactElement } from 'react';
import { useMemo, useState } from 'react';
import { Structure } from 'react-cheminfo/structure';
import {
  ExerciseActions,
  ExerciseLevelTag,
  GlossaryText,
  HintLadder,
  PagePart,
  useIsHidden,
} from 'react-cheminfo/ui';
import { MF } from 'react-mf';

import type { DbeExercise } from '../../data/exercises.ts';
import type { DbeAnswer } from '../../dbe/index.ts';
import { validateDbeAnswer } from '../../dbe/index.ts';
import {
  getExerciseProgress,
  resetExercise,
  revealNextHint,
  setExerciseAnswer,
  setExerciseStatus,
  setShowSolution,
} from '../../state/index.ts';

import { AnswerBox } from './AnswerBox.tsx';
import { ExerciseVerdict } from './ExerciseVerdict.tsx';

/** What {@link ExerciseCard} needs. */
export interface ExerciseCardProps {
  /** The question on screen. Give the card `key={exercise.id}`. */
  readonly exercise: DbeExercise;
}

/**
 * The open question, its answer box and its marking.
 * @param props - See {@link ExerciseCardProps}.
 * @returns The card.
 */
export function ExerciseCard(props: ExerciseCardProps): ReactElement {
  useSignals();
  const { exercise } = props;
  const isHidden = useIsHidden();
  const progress = getExerciseProgress(exercise.id);
  const [answer, setAnswer] = useState<DbeAnswer>(() =>
    parseAnswer(progress.answer),
  );
  const [showStructure, setShowStructure] = useState(false);
  const result = useMemo(
    () => validateDbeAnswer(exercise.kind, exercise.expected, answer),
    [exercise, answer],
  );
  const blank = answer.dbe.trim() === '';
  const attempted = progress.status !== 'idle';

  const write = (next: DbeAnswer): void => {
    setAnswer(next);
    setExerciseAnswer(exercise.id, formatAnswer(next));
  };

  return (
    <Card className="exercise-card" data-testid="exercise-card">
      <div className="exercise-card__heading">
        <h1>{exercise.title}</h1>
        <ExerciseLevelTag level={exercise.level} />
        <Tag minimal round>
          {exercise.kind === 'formula' ? 'Formula' : 'Structure'}
        </Tag>
      </div>

      <p className="exercise-card__prose">
        <GlossaryText text={exercise.description} />
      </p>

      <Figure
        exercise={exercise}
        showStructure={showStructure}
        solved={progress.status === 'solved'}
      />

      <AnswerBox answer={answer} split={exercise.split} onChange={write} />

      <div className="exercise-card__actions no-print">
        <Button
          data-testid="check-button"
          intent="primary"
          icon="tick"
          text="Check"
          disabled={blank}
          onClick={() => {
            setExerciseStatus(
              exercise.id,
              result.passed ? 'solved' : 'attempted',
            );
          }}
        />
        <ExerciseActions
          hintsRevealed={progress.hintsRevealed}
          hintCount={exercise.hints.length}
          showSolution={progress.showSolution}
          onRevealHint={
            isHidden('hints')
              ? undefined
              : () => {
                  revealNextHint(exercise.id, exercise.hints.length);
                }
          }
          onToggleSolution={
            isHidden('solution')
              ? undefined
              : () => {
                  setShowSolution(exercise.id, !progress.showSolution);
                }
          }
          onReset={() => {
            resetExercise(exercise.id);
            setAnswer(parseAnswer(''));
            setShowStructure(false);
          }}
        >
          {offersStructure(exercise, attempted) && (
            <Button
              icon={showStructure ? 'eye-off' : 'eye-open'}
              text={showStructure ? 'Hide the structure' : 'Show the structure'}
              onClick={() => {
                setShowStructure(!showStructure);
              }}
            />
          )}
        </ExerciseActions>
      </div>

      <ExerciseVerdict
        result={result}
        attempted={attempted}
        blank={blank}
        solution={exercise.solution}
      />

      <PagePart part="hints">
        <HintLadder hints={exercise.hints} revealed={progress.hintsRevealed} />
      </PagePart>

      {progress.showSolution && (
        <PagePart part="solution">
          <Callout intent="warning" icon="key" title="The answer">
            <GlossaryText text={exercise.solution} />
          </Callout>
        </PagePart>
      )}
    </Card>
  );
}

/** What the question puts in front of the student: a formula, or a drawing. */
function Figure(props: {
  readonly exercise: DbeExercise;
  readonly showStructure: boolean;
  readonly solved: boolean;
}): ReactElement {
  const { exercise, showStructure, solved } = props;
  if (exercise.kind === 'structure') {
    return (
      <div className="exercise-card__figure">
        <Structure smiles={exercise.smiles} width={280} height={200} />
        {solved && (
          <Tag minimal round>
            {exercise.name}
          </Tag>
        )}
      </div>
    );
  }
  return (
    <div className="exercise-card__figure">
      <span className="exercise-card__mf">
        <MF mf={exercise.mf} />
      </span>
      {showStructure && exercise.smiles !== undefined && (
        <Structure smiles={exercise.smiles} width={240} height={170} />
      )}
    </div>
  );
}

/**
 * Whether the card offers the drawing behind a formula question.
 *
 * Only once the student has handed an answer in: the drawing is where the
 * formula's number is spent, and reading it first answers the question.
 */
function offersStructure(exercise: DbeExercise, attempted: boolean): boolean {
  return (
    exercise.kind === 'formula' && exercise.smiles !== undefined && attempted
  );
}

/**
 * The boxes as one stored string: `4`, or `4|1|3` when the question asks how
 * the answer is spent.
 * @param answer - What is written now.
 * @returns What the progress store keeps.
 */
function formatAnswer(answer: DbeAnswer): string {
  const split = `${answer.rings ?? ''}|${answer.piBonds ?? ''}`;
  return split === '|' ? answer.dbe : `${answer.dbe}|${split}`;
}

/**
 * Read a stored answer back into the boxes.
 * @param stored - What the progress store kept, from an earlier release
 * included: a string with no separator is a total on its own.
 * @returns The boxes.
 */
function parseAnswer(stored: string): DbeAnswer {
  const [dbe = '', rings = '', piBonds = ''] = stored.split('|');
  return { dbe, rings, piBonds };
}
