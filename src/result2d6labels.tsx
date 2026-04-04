import {calculateResult} from "./calculateResult.tsx";
import {State} from "./state/state.tsx";
import {calculateDRM} from "./calculateDRM.tsx";
import {roll2d6} from "./state/roll2d6.tsx";
import * as R from "remeda";
import {resultColors} from "./resultColors.tsx";

export function result2d6labels(state: State['direct']) {
  const drm = calculateDRM(state).value
  return R.pipe(
    roll2d6,
    R.map(roll => ({
      [roll]: <div key={roll} style={{background: resultColors[calculateResult(state, roll, drm)?.result!]}}>{roll}</div>
    })),
    R.mergeAll,
  )
}