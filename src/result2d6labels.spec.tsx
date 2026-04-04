import {describe, expect, it} from 'vitest';
import {result2d6style} from "./result2d6style.tsx";
import {State} from "./state/state.tsx";
import {calculateDRM} from "./calculateDRM.tsx";
import {directDRM} from "./direct/DRM.tsx";
import {directCRT} from "./direct/CRT.ts";

describe('result2d6labels', () => {
  it('should return crt row', () => {
    const forDrmMin1:State['direct'] = {
      attacker: {
        suppression: undefined,
        TQ: undefined,
        firetype: '4',
        moved: undefined,
        overwatch: undefined
      },
      between: {
        losThrough: undefined,
        sameWoodsUrban: undefined,
        lessThen250m: undefined,
      },
      defender: {
        targetMarker: undefined,
        footInTerrain: undefined,
        shellScrapes: 'digging',
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
