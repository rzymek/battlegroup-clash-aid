import {State, Suppression, TQ} from "../state/state.tsx";
import {DRMDef, Reason} from "../calculateDRM.tsx";

export const assaultDRM: DRMDef<State['assault']> = {
  defender_reorg: {
    yes: +2,
  },
  attacker_hq: {
    1: +1,
    2: +2,
    3: +3
  },
  attacker_footAndTrackPresent: {
    yes: +2,
  },
  location_smoke: {
    yes: +2,
  },
  defender_footAndTrackPresent: {
    yes: -1,
  },
  defender_hq: {
    1: -1,
    2: -2,
    3: -3,
  },
  defender_shellScrapes: {
    digging: -1,
    shellScrapes: -2,
  },
  defender_urbanDenseElevated: {
    yes: -2,
  },
  location_bridge: {
    yes: -3,
  },
  postprocess(result, state) {
    const tqDiff = tq(state.attacker) - tq(state.defender);
    if (isFinite(tqDiff)) {
      return [...result, {
        reason: `TQ difference between Attacker Foot and Defender Foot*` as Reason<State['assault']>,
        modifier: tqDiff
      }]
    }
  }
}

function tq(def: { TQ?: TQ, suppression?: Suppression }) {
  const {TQ = NaN, suppression = 'none'} = def;
  const tqModifier: Record<Suppression | 'none', number> = {
    none: 0,
    suppressed: -1,
    disrupted: -2
  };
  return Number(TQ) + tqModifier[suppression];
}

