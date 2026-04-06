import * as R from 'remeda';

export function crtObj<T extends RawCRT, RV = ResultValue>(arr: T):CRT<Header<T>,RV> {
  const [header, ...values] = arr;
  return R.pipe(
    values,
    R.map(line => header.reduce((acc, label, index) => ({
      ...acc,
      [label]: line[index]
    }), {} as Record<typeof header[number], string | number>)),
    R.flatMap(line => {
      if (line.dice === '11+') {
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

export type RawCRT = readonly (readonly any[])[];
export type Header<T extends RawCRT> = Exclude<T[0][number], 'dice'>;

export const resultValues = ['-', 'S', 1, 2, 3] as const;
export type ResultValue = typeof resultValues[number];
export type CRT<FT extends string, RV = ResultValue>= Record<number, Record<FT, RV>>

export function calculateResult<FT extends string>(firetype: FT|undefined, crt: Record<number, Record<FT, ResultValue>>, roll2d6: number | undefined, drm: number) {
  if (roll2d6 === undefined || firetype === undefined) {
    return undefined;
  }
  const modifiedDiceRoll = narrow2d6(roll2d6 + drm, crt);
  const row = crt[modifiedDiceRoll]
  const result = row[firetype];
  return {modifiedDiceRoll, result};
}

export function narrow2d6<FT extends string>(roll2d6: number, crt:CRT<FT>) {
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
