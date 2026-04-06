import {State} from "./state/state.tsx";
import light from './svg/los-through-light.png'
import smoke from './svg/los-through-smoke.svg?react'
import {ComponentType} from "preact";
import {imgComp} from "./imgComp.tsx";

type LosThrough = Exclude<State['direct']['drm']['between_losThrough'], undefined>;
export const losThrough: Record<LosThrough, ComponentType> = {
  "lightTerrain": imgComp(light),
  smoke
}