import {calculateDRM} from "../calculateDRM.tsx";
import {state} from "../state/state.tsx";
import {assaultDRM} from "./DRM.ts";
import * as R from "remeda";
import {calculateCombatRatio} from "./combatRatio.tsx";
import {assaultCRT} from "./CRT.ts";
import {narrow} from "../direct/narrow.ts";

const pullBack = {
  A: 'attacker',
  D: 'defender'
} as const;

function interpret(result: Record<string, string>, ratio: string) {
  const value = result[ratio];
  const pullback = pullBack[value[0] as keyof typeof pullBack];
  const [attacker, defender] = value.substring(1).split(/:/).map(it => Number(it));
  return {attacker, defender, pullback};
}

interface BaseResult {
  ratio: string;
  drm: { value: number; reasons: any };
  rawRatio: string;
}

export type AssaultResult = {
  attacker: number;
  defender: number;
  pullback: "attacker" | "defender"
};

interface FullResult extends BaseResult {
  modifierDiceRoll: number;
  result: AssaultResult
}

export function calculateResult(roll2d6: number): FullResult;
export function calculateResult(roll2d6: undefined): BaseResult;
export function calculateResult(roll2d6: number | undefined): BaseResult | FullResult;
export function calculateResult(roll2d6: number | undefined): BaseResult | FullResult {
  const drm = calculateDRM(state.assault, assaultDRM);
  const attacker = R.sum(state.assault.attacker.firepower);
  const defender = R.sum(state.assault.defender.firepower);
  const rawRatio = `${attacker}:${defender}`;
  const ratio = calculateCombatRatio(attacker, defender)
  if (roll2d6 === undefined) {
    return {
      ratio, drm, rawRatio,
    };
  }
  const modifiedDiceRoll = narrow(2, 12, roll2d6 + drm.value);
  const result = assaultCRT[modifiedDiceRoll]!
  return {
    ratio, drm, rawRatio,
    modifierDiceRoll: modifiedDiceRoll,
    result: interpret(result, ratio),
  }
}