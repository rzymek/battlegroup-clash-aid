import {State} from "../state/state.tsx";
import {DRMDef} from "../calculateDRM.tsx";

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
  postprocess(result, state) {
    result = result.filter(r => r.reason !== 'between.lessThen250m')
    if(state.between.lessThen250m && state.between.losThrough) { // **
      result = result.filter(r => r.reason !== 'between.losThrough')
    }
    return result;
  }
}