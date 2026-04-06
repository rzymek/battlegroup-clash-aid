import { ComponentType } from "preact";
import {State} from "./state/state.tsx";
import suppressed from "./svg/suppressed.png";
import disrupted from "./svg/disrupted.png";
import {imgComp} from "./imgComp.tsx";

type Suppression = Exclude<State['direct']['drm']['attacker_suppression'], undefined>;
export const suppression: Record<Suppression, ComponentType> = {
  suppressed: imgComp(suppressed),
  disrupted: imgComp(disrupted),
};