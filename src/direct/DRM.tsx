import {State, TQ} from "../state/state.tsx";
import {DRMDef} from "../calculateDRM.tsx";
import * as R from "remeda";
import {narrow} from "./narrow.ts";

export const directDRM: DRMDef<State['direct']> = {
  attacker_suppression: {
    suppressed: -1,
    disrupted: -2,
  },
  attacker_TQ: {
    4: 0,
    5: +1,
    6: +2
  },
  attacker_overwatch: {
    yes: +2.
  },
  attacker_moved: {
    nato: -1,
    russia: -2
  },
  between_sameWoodsUrban: {
    yes: +2,
  },
  between_losThrough: {
    lightTerrain: -2,
    smoke: -3
  },
  between_lessThen250m: {
    yes: 0,
  },
  defender_targetMarker: {
    2: +2,
    1: +1,
  },
  defender_footInTerrain: {
    light: -1,
    dense: -2,
  },
  defender_shellScrapes: {
    digging: -1,
    shellScrapes: -2,
  },
  preprocess(state) {
    const suppression = state.drm.attacker_suppression;
    if (suppression !== undefined) {
      state = R.pipe(state, R.clone())
      if (state.drm.attacker_TQ !== undefined) {
        state.drm.attacker_TQ = narrow(3, 6, Number(state.drm.attacker_TQ) + directDRM.attacker_suppression[suppression]) as TQ
      }
    }
    return state;
  },
  postprocess(result, state) {
    result = result.filter(r => r.reason !== 'between_lessThen250m')
    result = result.filter(r => r.reason !== 'attacker.suppression')
    if (state.drm.between_lessThen250m && state.drm.between_losThrough) { // **
      result = result.filter(r => r.reason !== 'between_losThrough')
    }
    return result;
  }
}