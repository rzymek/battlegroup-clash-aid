import { ComponentType } from "preact";
import {State} from "./state/state.tsx";
import nato from "./svg/moved-nato.svg?react";
import russia from "./svg/moved-russia.svg?react";

type Moved = Exclude<State['direct']['attacker']['moved'], undefined>;
export const moved: Record<Moved, ComponentType> = {
  nato,
  russia,
};