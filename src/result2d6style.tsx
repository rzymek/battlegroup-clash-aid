import {calculateResult, CRT} from "./calculateResult.tsx";
import {calculateDRM, DRMDef, SubState} from "./calculateDRM.tsx";
import {roll2d6} from "./state/roll2d6.tsx";
import * as R from "remeda";
import {resultColors} from "./resultColors.tsx";
import {CSSProperties} from "preact";

export function result2d6style<T extends SubState>(
  state: T,
  drm: DRMDef<T>,
  crt: CRT<Exclude<T['attacker']['firetype'], undefined>>
) {
  const drmValue = calculateDRM(state, drm).value
  return R.pipe(
    roll2d6,
    R.map(roll => ({
      [roll]: {
        backgroundColor: resultColors[calculateResult(state.attacker.firetype, crt, roll, drmValue)?.result!]
      } satisfies CSSProperties
    })),
    R.mergeAll,
  )
}