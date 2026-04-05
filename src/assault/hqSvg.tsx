import HQ1 from '../svg/assault/hq1.svg?react'
import HQ2 from '../svg/assault/hq2.svg?react'
import HQ3 from '../svg/assault/hq3.svg?react'
import {ComponentType} from "preact";
import {HQ} from "../state/state.tsx";

export const hqSvg: Record<HQ, ComponentType> = {
  "1": HQ1,
  "2": HQ2,
  "3": HQ3,
}