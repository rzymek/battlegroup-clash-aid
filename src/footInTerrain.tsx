import {ComponentType} from "preact";
import {State} from "./state/state.tsx";
import dense from './svg/target-inf-dense-woods-urban.svg?react'
import light from './svg/target-inf-light-woods-urban.svg?react'
import denseWood from './svg/target-inf-dense-woods.svg?react'
import lightWood from './svg/target-inf-light-woods.svg?react'
import urban from './svg/target-inf-urban.svg?react'
import lightUrban from './svg/target-inf-light-urban.svg?react'

type FootInTerrain = Exclude<State['direct']['defender']['footInTerrain'], undefined>;
export const footInTerrain: Record<FootInTerrain, ComponentType> = {
  light,
  dense,
}

export const allTerrain: Record<Exclude<State['indirect']['target']['footInTerrain'], undefined>, ComponentType> = {
  denseWood,
  lightUrban,
  lightWood,
  urban
}