import {calculateDRM} from "./calculateDRM.tsx";
import {state} from "./state/state.tsx";
import {calculateResult, ResultValue} from "./calculateResult.tsx";
import {ReactNode} from "preact/compat";

const resultLabels: Record<ResultValue, ReactNode> = {
  1: '1 hit',
  2: '2 hits',
  3: '3 hits',
  S: 'Suppressed',
  '-': 'miss',
} as const;

export function Result() {
  const drm = calculateDRM(state.direct);
  const result = calculateResult(state.direct, state.roll2d6, drm.value);
  return <div style={{padding: 8, display: 'flex', flexDirection: 'column', gap: 6}}>
    {result && <>
        <div>Result: <b>{resultLabels[result.result] ?? result.result}</b>
            &nbsp;
            <i>(DRM: {drm.value}, modified dice roll: {result.modifiedDiceRoll})</i>
        </div>
    </>}
  </div>
}

