import {State} from "../state/state.tsx";
import {DRMDef} from "../calculateDRM.tsx";

export const indirectDRM: DRMDef<State['indirect']> = {
  ew_interference: {
    yes: -2,
  },
  ew_triangulation: {
    yes: +2,
  },
  target_marker: {
    1: +1,
    2: +2,
  },
  target_footInTerrain: {
    lightWood: -1,
    lightUrban: -1,
    denseWood: -2,
    urban: -2,
  },
  target_moved: {
    yes: -2,
  },
  target_shellScrapes: {
    digging: -1,
    shellScrapes: -2,
  },
  target_tracked: {
    yes: -3,
  },
  losSupport_uas: {
    yes: 2,
  },
  losSupport_other: {
    recce: 1,
    fst: 3,
  },
  fpv_jamming: {
    1: -1,
    2: -2,
    3: -3,
    4: -4,
    5: -5,
    6: -6,
  },
  postprocess(result, state) {
    if (state.attacker.firetype === 'FPV' && state.drm.target_moved) { // **
      result = result.filter(it => it.reason !== 'target_moved')
    }
    if (state.attacker.firetype === '152/155mm') { // *
      const woods: State['indirect']['drm']['target_footInTerrain'][] = ['lightWood', "denseWood"];
      const isInWoods = woods.includes(state.drm.target_footInTerrain);
      if (isInWoods && state.drm.target_shellScrapes === 'shellScrapes') {
        result = result.map(it => it.reason === 'target_footInTerrain' ? ({
          ...it, modifier: 0,
          note: `* This DRM does not apply against Artillery unless the Foot FE has a Shell Scrape marker.`
        } as const) : it)
      }
    } else {
      result = result.filter(it =>
        it.reason !== 'ew_triangulation' && it.reason !== 'ew_interference')
    }
    if (state.attacker.firetype !== 'FPV') {
      result = result.map(it => it.reason === 'fpv_jamming' ?
        ({...it, modifier: 0, note: '**FPV ignores this penalty.'}) : it)
    }
    return result;
  }
}

