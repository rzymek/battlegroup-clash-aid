import {clone} from "remeda"
import {update} from "./update.ts"
import {DirectFireType} from "./firetype.tsx";
import {combatTypes} from "./combatTypes.tsx";

const yesNo = undefined as undefined | 'yes';

export const tq = [6,5,4,3] as const;
export type TQ = typeof tq[number];

const initialState = {
  combatTypes: 'direct' as typeof combatTypes[number],
  roll2d6: undefined as typeof undefined | number,
  direct: {
    attacker: {
      suppression: undefined as undefined | 'suppressed' | 'disrupted',
      TQ: undefined as undefined | TQ,
      overwatch: yesNo,
      moved: undefined as undefined | 'nato' | 'russia',
      firetype: undefined as undefined | DirectFireType,
    },
    between: {
      sameWoodsUrban: yesNo,
      losThrough: undefined as undefined | 'light-terrain' | 'smoke',
      lessThen250m: yesNo,
    },
    defender: {
      targetMarker: undefined as undefined | 1 | 2,
      footInTerrain: undefined as undefined | 'light' | 'dense',
      shellScrapes: undefined as undefined | 'digging' | 'shellScrapes',
    },
  },
  indirect: {
    losSupport: {
      uas: yesNo,
      other: undefined as undefined | IndirectLosToTargetSupport,
    },
    target: {
      marker: undefined as undefined | 1 | 2,
      footInTerrain: undefined as undefined | 'lightWood' | 'denseWood' | 'lightUrban' | 'urban',
      moved: yesNo,
      shellScrapes: undefined as undefined | 'digging' | 'shellScrapes',
      tracked: yesNo,
    },
    attacker: {
      firetype: undefined as undefined | IndirectFireType,
    }
  },
  assault: {
    attacker: {
      TQ: undefined as undefined | TQ,
      footAndTrackPresent: yesNo,
      hq: undefined as undefined | HQ,
    },
    location: {
      smoke: yesNo,
      bridge: yesNo,
    },
    defender:{
      TQ: undefined as undefined | TQ,
      reorg: yesNo,
      footAndTrackPresent: yesNo,
      hq: undefined as undefined | HQ,
      shellScrapes: undefined as undefined | 'digging' | 'shellScrapes',
      urbanDenseElevated: yesNo,
    },
    firepower: {
      attacker: [] as number[],
      defender: [] as number[],
    }
  }
}
export const hq = [1 , 2 , 3] as const;
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