import {State} from "../state/state.tsx";
import {DRMDef} from "../calculateDRM.tsx";
import * as R from "remeda";
import {narrow} from "./narrow.ts";

const ignore = {
  2: NaN,
  1: NaN,
  3: NaN,
  4: NaN,
  RPG: NaN,
  NLAW: NaN,
  Stabber: NaN,
  Javelin: NaN
} as const;

export const directDRM: DRMDef<State['direct']> = {
  attacker: {
    suppression: {
      suppressed: -1,
      disrupted: -2,
    },
    TQ: {
      3: -1,
      4: 0,
      5: +1,
      6: +2
    },
    overwatch: {
      yes: +2.
    },
    moved: {
      nato: -1,
      russia: -2
    },
    firetype: ignore,
  },
  between: {
    sameWoodsUrban: {
      yes: +2
    },
    losThrough: {
      "light-terrain": -2,
      smoke: -3
    },
    lessThen250m: {
      yes: 0,
    }
  },
  defender: {
    targetMarker: {
      2: +2,
      1: +1,
    },
    footInTerrain: {
      light: -1,
      dense: -2,
    },
    shellScrapes: {
      digging: -1,
      shellScrapes: -2,
    }
  },
  preprocess(state) {
    const suppression = state.attacker.suppression;
    if (suppression !== undefined) {
      state = R.pipe(state, R.clone())
      if (state.attacker.TQ !== undefined) {
        state.attacker.TQ = narrow(3, 6, Number(state.attacker.TQ) + directDRM.attacker.suppression[suppression]) as 6 | 5 | 4 | 3
      }
    }
    console.log(state)
    return state;
  },
  postprocess(result, state) {
    result = result.filter(r => r.reason !== 'between.lessThen250m')
    result = result.filter(r => r.reason !== 'attacker.suppression')
    if (state.between.lessThen250m && state.between.losThrough) { // **
      result = result.filter(r => r.reason !== 'between.losThrough')
    }
    return result;
  }
}