import {State} from "./state/state.tsx";
import shellScrapes from './svg/shell scrapes.svg?react'
import digging from './svg/digging.png'
import {ComponentType} from "preact";
import {imgComp} from "./imgComp.tsx";


type ShellScrapes = Exclude<State['direct']['defender']['shellScrapes'], undefined>;
export const shellScrapesSvg: Record<ShellScrapes, ComponentType> = {
  digging: imgComp(digging),
  shellScrapes,
}