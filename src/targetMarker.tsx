import { ComponentType } from "preact";
import {State} from "./state/state.tsx";
import Target1 from "./svg/target1.svg?react";
import Target2 from "./svg/target2.svg?react";

type TargetMarker = Exclude<State['direct']['drm']['defender_targetMarker'], undefined>;
export const targetMarker: Record<TargetMarker, ComponentType> = {
  1: Target1,
  2: Target2,
}