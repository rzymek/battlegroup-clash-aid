import {describe, expect, test} from "vitest";
import {calculateDRM} from "./calculateDRM.tsx";
import {directDRM} from "./direct/DRM.tsx";

describe('calculateDRM', () => {
  test('sample', () => {
    const result = calculateDRM({
      attacker: {
        firetype: 'Javelin',
      },
      drm: {
        attacker_suppression: undefined,
        attacker_TQ: 6,
        attacker_moved: undefined,
        attacker_overwatch: "yes",
        between_losThrough: undefined,
        between_sameWoodsUrban: "yes",
        between_lessThen250m: "yes",
        defender_targetMarker: 2,
        defender_footInTerrain: undefined,
        defender_shellScrapes: undefined
      }
    }, directDRM)

    expect(result).toEqual({
      value: 2 + 2 + 2 + 2,
      reasons: [
        {modifier: 2, reason: "attacker_TQ"},
        {modifier: 2, reason: "attacker_overwatch"},
        {modifier: 2, reason: "between_sameWoodsUrban"},
        {modifier: 2, reason: "defender_targetMarker"},
      ]
    })
  })
  test('zero', () => {
    const result = calculateDRM({
      drm: {
        attacker_suppression: undefined,
        attacker_TQ: undefined,
        attacker_moved: undefined,
        attacker_overwatch: undefined,
        between_losThrough: undefined,
        between_sameWoodsUrban: undefined,
        between_lessThen250m: undefined,
        defender_targetMarker: undefined,
        defender_footInTerrain: undefined,
        defender_shellScrapes: undefined
      },
      attacker: {
        firetype: undefined
      }
    }, directDRM)
    expect(result).toEqual({
      value: 0,
      reasons: []
    })
  })
});


