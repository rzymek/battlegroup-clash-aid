import {calculateResult, CRT, resultValues} from "./calculateResult.tsx";
import * as R from 'remeda';
import {resultColors} from "./resultColors.tsx";
import {calculateDRM, DRMDef, SubState} from "./calculateDRM.tsx";

export function ProbabilityBar<T extends SubState>(props: {
  state: T,
  drm: DRMDef<T>
  crt: CRT<Exclude<T['attacker']['firetype'], undefined>>
}) {
  const d6 = [1, 2, 3, 4, 5, 6];
  const drm = calculateDRM(props.state, props.drm);
  const resultProbability = R.pipe(
    d6,
    R.flatMap(d1 => d6.map(d2 => d1 + d2)),
    R.map(roll2d6 => calculateResult(props.state.attacker.firetype, props.crt, roll2d6, drm.value)?.result),
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
      }} title={`${result}: ${resultProbability[result]}`}>
        {resultProbability[result] && <><b>{result}</b>: <i>{resultProbability[result]}</i></>}
      </div>
    )}
  </div>
}

