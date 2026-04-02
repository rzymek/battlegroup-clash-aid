import {clone} from "remeda"
import {update} from "./update.ts"

const initialState = {
  direct: {
    attacker: {
      TQ: undefined as undefined | 6 | 5 | 4 | 3,
      overwatch: undefined as undefined | true,
      moved: undefined as undefined | 'nato' | 'russia',
    },
    between: {
      sameWoodsUrban: undefined as undefined | true,
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