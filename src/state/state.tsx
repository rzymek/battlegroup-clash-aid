import {clone} from "remeda"
import {update} from "./update.ts"

const initialState = {
  direct: {
    attacker: {
      TQ: undefined as undefined | number,
      moved: undefined as undefined | true,
      digging: undefined as undefined | true,
    },
    defender: {
      target: undefined as undefined | 1 | 2,
    }
  }
}

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