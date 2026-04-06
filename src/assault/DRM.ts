import {State} from "../state/state.tsx";
import {DRMDef} from "../calculateDRM.tsx";

export const indirectDRM: DRMDef<State['assault']['drm']> = {
  attacker_TQ: {},
  attacker_footAndTrackPresent: {},
  attacker_hq: {},
  defender_TQ: {},
  defender_footAndTrackPresent: {},
  defender_hq: {},
  defender_reorg: {},
  defender_shellScrapes: {},
  defender_urbanDenseElevated: {},
  location_bridge: {},
  location_smoke: {},
}

