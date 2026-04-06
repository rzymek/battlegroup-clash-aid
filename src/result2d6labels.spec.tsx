import {describe, expect, it} from 'vitest';
import {result2d6style} from "./result2d6style.tsx";
import {State} from "./state/state.tsx";
import {calculateDRM} from "./calculateDRM.tsx";
import {directDRM} from "./direct/DRM.tsx";
import {directCRT} from "./direct/CRT.ts";

describe('result2d6labels', () => {
  it('should return crt row', () => {
    const forDrmMin1: State['direct'] = {
      attacker: {firetype: '4'},
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
        defender_shellScrapes: 'digging',
      }
    };
    expect(calculateDRM(forDrmMin1, directDRM).value).toEqual(-1)
    expect(result2d6style(forDrmMin1, directDRM, directCRT)).toEqual({
      2: {backgroundColor: "lightgray"},
      3: {backgroundColor: "yellow"},
      4: {backgroundColor: "yellow"},
      5: {backgroundColor: "lightpink"},
      6: {backgroundColor: "lightpink"},
      7: {backgroundColor: "lightpink"},
      8: {backgroundColor: "orange"},
      9: {backgroundColor: "orange"},
      10: {backgroundColor: "orange"},
      11: {backgroundColor: "orange"},
      12: {backgroundColor: "red"},
    });
  });
});
