import {calculateDRM} from "../calculateDRM.tsx";
import {state} from "../state/state.tsx";
import {assaultDRM} from "./DRM.ts";
import * as R from "remeda";
import {calculateCombatRatio} from "./combatRatio.tsx";
import {assaultCRT} from "./CRT.ts";
import {narrow} from "../direct/narrow.ts";

const pullBack: Record<string, string> = {
  A: 'attacker',
  D: 'defender'
}

function interpret(result: Record<string, string>, ratio: string) {
  const value = result[ratio];
  const pullback = pullBack[value[0]];
  const [attacker, defender] = value.substring(1).split(/:/);
  return {attacker, defender, pullback};
}

export function calculateResult() {
  const drm = calculateDRM(state.assault, assaultDRM);
  const attacker = R.sum(state.assault.attacker.firepower);
  const defender = R.sum(state.assault.defender.firepower);
  const rawRatio = `${attacker}:${defender}`;
  const ratio = calculateCombatRatio(attacker, defender)
  if (!state.roll2d6) {
    return {
      ratio, drm, rawRatio,
    };
  }
  const modifierDiceRoll = narrow(2, 12, state.roll2d6 + drm.value);
  const result = assaultCRT[modifierDiceRoll]!
  return {
    ratio,
    drm,
    rawRatio,
    modifierDiceRoll,
    losses: interpret(result, ratio),
  }
}