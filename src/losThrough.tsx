import {State} from "./state/state.tsx";
import light from './svg/los-through-light.svg?react'
import smoke from './svg/los-through-smoke.svg?react'
import {ComponentType} from "preact";

type LosThrough = Exclude<State['direct']['between']['losThrough'], undefined>;
export const losThrough: Record<LosThrough, ComponentType> = {
  "light-terrain": light,
  smoke
}