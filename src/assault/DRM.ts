import {State} from "../state/state.tsx";
import {DRMDef} from "../calculateDRM.tsx";

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
}

