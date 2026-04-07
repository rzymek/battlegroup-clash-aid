import * as R from 'remeda';
import {AssaultResult, calculateResult} from "./calculateResult.tsx";

export function ProbabilityBar<T extends keyof AssaultResult>({type, colors, reverse}: {
  type: T,
  colors: Record<AssaultResult[T], string>,
  reverse?:boolean
}) {
  const d6 = [1, 2, 3, 4, 5, 6];
  const resultProbability = R.pipe(
    d6,
    R.flatMap(d1 => d6.map(d2 => d1 + d2)),
    R.map(roll2d6 => calculateResult(roll2d6)),
    R.groupBy(it => it.result[type]),
    R.mapValues(arr => ((100 * arr!.length) / (6 * 6)).toFixed().padStart(2, ' ') + '%')
  )

  return <div style={{display: 'flex'}}>
    {R.pipe(
      resultProbability,
      R.entries(),
      reverse ? R.reverse() : R.identity(),
      R.map(([result, probability]) =>
        <div style={{
          overflow: 'hidden',
          backgroundColor: colors[result],
          height: '10mm',
          width: probability,
          display: 'flex',
          fontSize: '3mm',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(0,0,0,0.5)',
        }} title={`${result}: ${probability}`}>
          <><b>{result}</b>: <i>{probability}</i></>
        </div>
      ))}
  </div>
}

