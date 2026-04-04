import {State} from "./state/state.tsx";
import * as R from 'remeda';

function crtObj(arr: typeof rawCrt) {
  const [header, ...values] = arr;
  return R.pipe(
    values,
    R.map(line => header.reduce((acc, label, index) => ({
      ...acc,
      [label]: line[index]
    }), {} as Record<typeof header[number], string | number>)),
    R.flatMap(line => {
      if (line.dice === '<1') {
        return []
      } else if (line.dice === '11+') {
        return [{...line, dice: 12}, {...line, dice: 11}]
      } else {
        return [{...line, dice: Number(line.dice)}]
      }
    }),
    R.sortBy([line => line.dice, "desc"]),
    R.map(({dice, ...rest}) => ({
      [dice]: rest
    })),
    R.mergeAll
  )
}

/* @formatter:off */
const rawCrt = [
  ['dice', '1', '2', '3', '4', 'RPG', 'NLAW', 'Stabber', 'Javelin'],
  ['11+',  1,   2,   2,   3,   1,     2,      2,         2       ],
  ['10',   1,   1,   2,   2,   1,     2,      2,         2       ],
  ['9',   'S',  1,   2,   2,  'S',    2,      2,         2       ],
  ['8',   'S',  1,   1,   2,  'S',    2,      1,         2       ],
  ['7',   'S', 'S',  1,   2,  'S',    1,      1,         2       ],
  ['6',   '-', 'S',  1,   1,  '-',    1,      1,         2       ],
  ['5',   '-', 'S', 'S',  1,  '-',    1,     'S',        1       ],
  ['4',   '-', '-', 'S',  1,  '-',   'S',    'S',        1       ],
  ['3',   '-', '-', 'S', 'S', '-',   'S',    '-',       'S'      ],
  ['2',   '-', '-', '-', 'S', '-',    '-',    '-',       'S'     ],
  ['1',   '-', '-', '-', '-', '-',    '-',    '-',       '-'     ],
  ['<1',  '-', '-', '-', '-', '-',    '-',    '-',       '-'     ],
] as const;
/* @formatter:on */

type Header = Exclude<(typeof rawCrt)[0][number], 'dice'>;

export const crt: Record<number, {
  [key in Header]: ResultValue
}> = crtObj(rawCrt);

export const resultValues = ['-', 'S', 1, 2, 3] as const;
export type ResultValue = typeof resultValues[number];

export function calculateResult(state: State['direct'], roll2d6: number | undefined, drm: number) {
  if (roll2d6 === undefined || state.attacker.firetype === undefined) {
    return undefined;
  }
  const modifiedDiceRoll = narrow2d6(roll2d6 + drm);
  const row = crt[modifiedDiceRoll]
  const result = row[state.attacker.firetype];
  return {modifiedDiceRoll, result};
}

export function narrow2d6(roll2d6: number) {
  const diceValues = R.pipe(crt, R.keys(), R.map(it => Number(it)));
  const min = Math.min(...diceValues);
  const max = Math.max(...diceValues);
  if (roll2d6 < min) {
    return min;
  } else if (roll2d6 > max) {
    return max;
  } else {
    return roll2d6;
  }
}
