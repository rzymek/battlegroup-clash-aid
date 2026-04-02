import {ComponentType} from "preact";
import {State} from "./state/state.tsx";
import dense from './svg/target-inf-dense-woods-urban.svg?react'
import light from './svg/target-inf-light-woods-urban.svg?react'

type FootInTerrain = Exclude<State['direct']['defender']['footInTerrain'], undefined>;
export const footInTerrain: Record<FootInTerrain, ComponentType> = {
  light,
  dense,
}