import {calculateResult} from "./calculateResult.tsx";
import {roll2d6} from "../state/roll2d6.tsx";
import * as R from "remeda";
import {CSSProperties} from "preact";
import {hitsColors} from "./hitsColors.tsx";
import {pullbackColors} from "./pullbackColors.tsx";

export function result2d6style() {
  return R.pipe(
    roll2d6,
    R.map(roll => {
      const {result} = calculateResult(roll)
      return ({
        [roll]: {
          background: `linear-gradient(0deg, 
            ${hitsColors[result.attacker]} 33%, 
            ${pullbackColors[result.pullback]} 33%, 
            ${pullbackColors[result.pullback]} 66%, 
            ${hitsColors[result.defender]} 66%)`
        } satisfies CSSProperties
      });
    }),
    R.mergeAll,
  )
}