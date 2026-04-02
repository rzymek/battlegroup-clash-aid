import {State} from "./state/state.tsx";
import shellScrapes from './svg/shell scrapes.svg?react'
import digging from './svg/digging.svg?react'
import {ComponentType} from "preact";

type ShellScrapes = Exclude<State['direct']['defender']['shellScrapes'], undefined>;
export const shellScrapesSvg: Record<ShellScrapes, ComponentType> = {
  digging,
  shellScrapes,
}