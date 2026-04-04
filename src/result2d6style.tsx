import {calculateResult} from "./calculateResult.tsx";
import {State} from "./state/state.tsx";
import {calculateDRM} from "./calculateDRM.tsx";
import {roll2d6} from "./state/roll2d6.tsx";
import * as R from "remeda";
import {resultColors} from "./resultColors.tsx";
import { CSSProperties } from "preact";

export function result2d6style(state: State['direct']) {
  const drm = calculateDRM(state).value
  return R.pipe(
    roll2d6,
    R.map(roll => ({
      [roll]: {
        backgroundColor: resultColors[calculateResult(state, roll, drm)?.result!]
      } satisfies CSSProperties
    })),
    R.mergeAll,
  )
}