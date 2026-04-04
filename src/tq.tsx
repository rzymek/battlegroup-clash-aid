import {ComponentType} from "preact";
import {State} from "./state/state.tsx";
import tq6 from "./svg/TQ6.png";
import tq5 from "./svg/TQ5.png";
import tq4 from "./svg/TQ4.png";
import tq3 from "./svg/TQ3-.png";
import {imgComp} from "./imgComp.tsx";

type TQ = Exclude<State['direct']['attacker']['TQ'], undefined>;

export const tq: Record<TQ, ComponentType> = {
  [6]: imgComp(tq6),
  [5]: imgComp(tq5),
  [4]: imgComp(tq4),
  [3]: imgComp(tq3),
} as const;

