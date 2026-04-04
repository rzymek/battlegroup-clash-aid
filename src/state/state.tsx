import {clone} from "remeda"
import {update} from "./update.ts"
import {firetype} from "./firetype.tsx";
import {combatTypes} from "./combatTypes.tsx";

const initialState = {
  combatTypes: 'direct' as typeof combatTypes[number],
  roll2d6: undefined as typeof undefined | number,
  direct: {
    attacker: {
      TQ: undefined as undefined | 6 | 5 | 4 | 3,
      overwatch: undefined as undefined | 'yes',
      moved: undefined as undefined | 'nato' | 'russia',
      firetype: undefined as undefined | typeof firetype[number],
    },
    between: {
      sameWoodsUrban: undefined as undefined | 'yes',
      losThrough: undefined as undefined | 'light-terrain' | 'smoke',
    },
    defender: {
      targetMarker: undefined as undefined | 1 | 2,
      footInTerrain: undefined as undefined | 'light' | 'dense',
      shellScrapes: undefined as undefined | 'digging' | 'shellScrapes',
    },
  }
}

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