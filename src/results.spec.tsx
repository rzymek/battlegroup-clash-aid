import {directDRM} from "./calculateDRM.tsx";
import * as R from "remeda";

import { describe, it, expect } from 'vitest';

import {reasonLabels} from "./DRMExplained.tsx";

describe('results', () => {
  it('should', () => {
    // given:
    const labels = R.pipe(
      directDRM,
      R.entries(),
      R.flatMap(([sectionKey, section]) =>
        R.pipe(
          section,
          R.keys(),
          R.map(key => `${sectionKey}.${key}`)
        )
      ),
      R.sortBy(R.identity()),
    );

    const actual = R.pipe(
      reasonLabels,
      R.keys(),
      R.sortBy(R.identity()),
    )
    expect(actual).toEqual(labels);
    expect(labels).toMatchInlineSnapshot(`
      [
        "attacker.TQ",
        "attacker.firetype",
        "attacker.moved",
        "attacker.overwatch",
        "between.losThrough",
        "between.sameWoodsUrban",
        "defender.footInTerrain",
        "defender.shellScrapes",
        "defender.targetMarker",
      ]
    `)
  });
});
