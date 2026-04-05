export const combatRatios = [
  '<1:1',
  '1:1',
  '1.5:1',
  '2:1',
  '2.5:1',
  '3:1',
  '4:1',
  '5:1+',
] as const;

export type CombatRatio = typeof combatRatios[number];

export function calculateCombatRatio(attacker: number, defender: number): CombatRatio {
  const ratio = attacker / defender;
  if (ratio >= 5) return '5:1+';
  if (ratio >= 4) return '4:1';
  if (ratio >= 3) return '3:1';
  if (ratio >= 2.5) return '2.5:1';
  if (ratio >= 2) return '2:1';
  if (ratio >= 1.5) return '1.5:1';
  if (ratio >= 1) return '1:1';
  return '<1:1';
}
