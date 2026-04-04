import * as R from "remeda";

import {describe, expect, it} from 'vitest';
import {reasonLabels as directLabels} from "./direct/ReasonLabels.tsx";
import {reasonLabels as indirectLabels} from "./indirect/ReasonLabels.tsx";
import {DRMDef, SubState} from "./calculateDRM.tsx";
import {directDRM} from "./direct/DRM.tsx";
import {indirectDRM} from "./indirect/DRM.tsx";

function drmLabels(drm:DRMDef<SubState>) {
  return R.pipe(
    drm,
    R.entries(),
    R.flatMap(([sectionKey, section]) =>
      R.pipe(
        section,
        R.keys(),
        R.map(key => `${sectionKey}.${key}`)
      )
    ),
    R.filter(it=>it!=='attacker.firetype'),
    R.sortBy(R.identity()),
  );
}

function sortedLabels(labels:Record<string,string>) {
  return R.pipe(
    labels,
    R.keys(),
    R.sortBy(R.identity()),
  );
}

describe('results', () => {
  it('direct: have labels for all reasons', () => {
    const labels = drmLabels(directDRM);
    const actual = sortedLabels(directLabels)
    expect(actual).toEqual(labels);
    expect(labels).toMatchInlineSnapshot(`
      [
        "attacker.TQ",
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
  it('indirect: have labels for all reasons', () => {
    const labels = drmLabels(indirectDRM);
    const actual = sortedLabels(indirectLabels)
    expect(labels).toMatchInlineSnapshot(`
      [
        "losSupport.other",
        "losSupport.uas",
        "target.footInTerrain",
        "target.marker",
        "target.moved",
        "target.shellScrapes",
        "target.tracked",
      ]
    `)
    expect(actual).toEqual(labels);
  });

});
