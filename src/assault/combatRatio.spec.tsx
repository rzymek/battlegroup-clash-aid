import { describe, it, expect } from 'vitest';
import {calculateCombatRatio} from "./combatRatio.tsx";

describe('combatRatio', () => {
  it('should round down combat ratio', () => {
    expect(calculateCombatRatio(23,11)).toEqual('2:1');
    expect(calculateCombatRatio(21,11)).toEqual('1.5:1');
  });
});
