import {ComponentType} from "preact";
import {TQ} from "./state/state.tsx";
import tq6 from "./svg/TQ6.png";
import tq5 from "./svg/TQ5.png";
import tq4 from "./svg/TQ4.png";
import {imgComp} from "./imgComp.tsx";

export const tq: Record<TQ, ComponentType> = {
  [6]: imgComp(tq6),
  [5]: imgComp(tq5),
  [4]: imgComp(tq4),
} as const;

