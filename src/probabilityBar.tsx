import {calculateResult, resultValues} from "./calculateResult.tsx";
import {state} from "./state/state.tsx";
import * as R from 'remeda';
import {resultColors} from "./resultColors.tsx";

export function ProbabilityBar(props: { drm: { value: number } }) {
  const d6 = [1, 2, 3, 4, 5, 6];
  const resultProbability = R.pipe(
    d6,
    R.flatMap(d1 => d6.map(d2 => d1 + d2)),
    R.map(roll2d6 => calculateResult(state.direct, roll2d6, props.drm.value)?.result),
    R.groupBy(it => it),
    R.mapValues(arr => ((100 * arr.length) / (6 * 6)).toFixed().padStart(2, ' ') + '%')
  )

  return <div style={{display: 'flex'}}>
    {resultValues.map(result =>
      <div style={{
        overflow: 'hidden',
        background: resultColors[result],
        height: '10mm',
        width: resultProbability[result],
        display: 'flex',
        fontSize: '3mm',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(0,0,0,0.5)',
      }}>
        {result}: {resultProbability[result]}
      </div>
    )}
  </div>
}

