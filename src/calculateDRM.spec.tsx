import {describe, expect, test} from "vitest";
import {calculateDRM} from "./calculateDRM.tsx";
import {directDRM} from "./direct/DRM.tsx";

describe('calculateDRM', () => {
  test('sample', () => {
    const result = calculateDRM({
      attacker: {
        TQ: 6,
        firetype: 'Javelin',
        moved: undefined,
        overwatch: "yes"
      },
      between: {
        losThrough: undefined,
        sameWoodsUrban: "yes"
      },
      defender: {
        targetMarker: 2,
        footInTerrain: undefined,
        shellScrapes: undefined
      }
    }, directDRM)

    expect(result).toEqual({
      value: 2 + 2 + 2 + 2,
      reasons: [
        {modifier: 2, reason: "attacker.TQ"},
        {modifier: 2, reason: "attacker.overwatch"},
        {modifier: 2, reason: "between.sameWoodsUrban"},
        {modifier: 2, reason: "defender.targetMarker"},
      ]
    })
  })
  test('zero', () => {
    const result = calculateDRM({
      attacker: {
        TQ: undefined,
        firetype: 'Javelin',
        moved: undefined,
        overwatch: undefined
      },
      between: {
        losThrough: undefined,
        sameWoodsUrban: undefined
      },
      defender: {
        targetMarker: undefined,
        footInTerrain: undefined,
        shellScrapes: undefined
      }
    }, directDRM)
    expect(result).toEqual({
      value: 0,
      reasons: []
    })
  })
});


