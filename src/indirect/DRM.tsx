import {State} from "../state/state.tsx";
import {DRMDef} from "../calculateDRM.tsx";

const ignore = {
  'FPV': NaN,
  'Mortar': NaN,
  '152/155mm': NaN,
} as const;

export const indirectDRM: DRMDef<State['indirect']> = {
  target: {
    marker: {
      1: +1,
      2: +2,
    },
    footInTerrain: {
      lightWood: -1,
      lightUrban: -1,
      denseWood: -2,
      urban: -2,
    },
    moved: {
      yes: -2,
    },
    shellScrapes: {
      digging: -1,
      shellScrapes: -2,
    },
    tracked: {
      yes: -3,
    }
  },
  losSupport: {
    uas: {
      yes: 2,
    },
    other: {
      recce: 1,
      fst: 3,
    }
  },
  attacker: {
    firetype: ignore
  },
  postprocess(result, state) {
    if (state.attacker.firetype === 'FPV' && state.target.moved) { // **
      result = result.filter(it => it.reason !== 'target.moved')
    }
    if(state.attacker.firetype === '152/155mm') { // *
      const woods:State['indirect']['target']['footInTerrain'][] = ['lightWood', "denseWood"];
      if(woods.includes(state.target.footInTerrain)) {
        result = result.filter(it => it.reason !== 'target.footInTerrain')
      }
    }
    return result;
  }
}

