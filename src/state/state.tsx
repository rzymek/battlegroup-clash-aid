import {clone} from "remeda"
import {update} from "./update.ts"
import {DirectFireType} from "./firetype.tsx";
import {combatTypes} from "./combatTypes.tsx";

const yesNo = undefined as undefined | 'yes';

export const tq = [6, 5, 4] as const;
export type TQ = typeof tq[number];
export type Suppression = 'suppressed' | 'disrupted';

const initialState = {
  combatTypes: 'direct' as typeof combatTypes[number],
  roll2d6: undefined as typeof undefined | number,
  direct: {
    drm: {
      attacker_suppression: undefined as undefined | Suppression,
      attacker_TQ: undefined as undefined | TQ,
      attacker_overwatch: yesNo,
      attacker_moved: undefined as undefined | 'nato' | 'russia',
      between_sameWoodsUrban: yesNo,
      between_losThrough: undefined as undefined | 'lightTerrain' | 'smoke',
      between_lessThen250m: yesNo,
      defender_targetMarker: undefined as undefined | 1 | 2,
      defender_footInTerrain: undefined as undefined | 'light' | 'dense',
      defender_shellScrapes: undefined as undefined | 'digging' | 'shellScrapes',
    },
    attacker: {
      firetype: undefined as undefined | DirectFireType,
    },
  },
  indirect: {
    drm: {
      ew_triangulation: yesNo,
      ew_interference: yesNo,
      losSupport_uas: yesNo,
      losSupport_other: undefined as undefined | IndirectLosToTargetSupport,
      target_marker: undefined as undefined | 1 | 2,
      target_footInTerrain: undefined as undefined | 'lightWood' | 'denseWood' | 'lightUrban' | 'urban',
      target_moved: yesNo,
      target_shellScrapes: undefined as undefined | 'digging' | 'shellScrapes',
      target_tracked: yesNo,
    },
    attacker: {
      firetype: undefined as undefined | IndirectFireType,
    }
  },
  assault: {
    attacker: {
      TQ: undefined as undefined | TQ,
      firepower: [] as number[],
      suppression: undefined as undefined | 'suppressed' | 'disrupted',
    },
    defender: {
      TQ: undefined as undefined | TQ,
      firepower: [] as number[],
      suppression: undefined as undefined | 'suppressed' | 'disrupted',
    },
    drm: {
      attacker_footAndTrackPresent: yesNo,
      attacker_hq: undefined as undefined | HQ,
      location_smoke: yesNo,
      location_bridge: yesNo,
      defender_reorg: yesNo,
      defender_footAndTrackPresent: yesNo,
      defender_hq: undefined as undefined | HQ,
      defender_shellScrapes: undefined as undefined | 'digging' | 'shellScrapes',
      defender_urbanDenseElevated: yesNo,
    },
  }
}
export const hq = [1, 2, 3] as const;
export type HQ = typeof hq[number]
export const indirectLosToTargetSupport = ['recce', 'fst'] as const;
export type IndirectLosToTargetSupport = typeof indirectLosToTargetSupport[number]
export const indirectFireType = ['FPV', 'Mortar', '152/155mm'] as const;
export type IndirectFireType = typeof indirectFireType[number];
export type State = typeof state;

export const state: typeof initialState = clone({
  ...initialState,
  ...JSON.parse(localStorage.getItem("state") ?? '{}'),
})

update.onUpdate.push(() => {
  setTimeout(() => {
    localStorage.setItem("state", JSON.stringify(state))
  }, 0)
})

export function resetState() {
  const preserve: Partial<typeof state> = {}
  Object.assign(state, clone(initialState), preserve)
}

resetState();