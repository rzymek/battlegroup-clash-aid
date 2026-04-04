import {describe, expect, it} from 'vitest';
import {result2d6style} from "./result2d6style.tsx";
import {State} from "./state/state.tsx";
import {calculateDRM} from "./calculateDRM.tsx";

describe('result2d6labels', () => {
  it('should return crt row', () => {
    const forDrmMin1:State['direct'] = {
      attacker: {
        TQ: undefined,
        firetype: '4',
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
        shellScrapes: 'digging',
      }
    };
    expect(calculateDRM(forDrmMin1).value).toEqual(-1)
    expect(result2d6style(forDrmMin1)).toEqual({
      1: '-',
      2: '-',
      3: 'S',
      4: 'S',
      5: 1,
      6: 1,
      7: 1,
      8: 2,
      9: 2,
      10: 2,
      11: 2,
      12: 2,
    });
  });
});
