import {State} from "./state/state.tsx";
import * as R from "remeda";


type DRM<T extends string | number | undefined> = {
  [key in Exclude<T, undefined>]: number
}
type DRMDef<T extends Record<string, Record<string, number | string | undefined>>> = {
  [key in keyof T]: {
    [subkey in keyof T[key]]: DRM<T[key][subkey]>
  }
}

const ignore = {
  2: NaN,
  1: NaN,
  3: NaN,
  4: NaN,
  RPG: NaN,
  NLAW: NaN,
  Stabber: NaN,
  Javelin: NaN
} as const;

export const directDRM: DRMDef<State['direct']> = {
  attacker: {
    TQ: {
      3: -1,
      4: 0,
      5: +1,
      6: +2
    },
    overwatch: {
      yes: +2.
    },
    moved: {
      nato: -1,
      russia: -2
    },
    firetype: ignore,
  },
  between: {
    sameWoodsUrban: {
      yes: +2
    },
    losThrough: {
      "light-terrain": -2,
      smoke: -3
    }
  },
  defender: {
    targetMarker: {
      2: +2,
      1: +1,
    },
    footInTerrain: {
      light: -1,
      dense: -2,
    },
    shellScrapes: {
      digging: -1,
      shellScrapes: -2,
    }
  }
}

export function calculateDRM(state: State['direct']) {

  function sectionDRM(section: keyof typeof directDRM) {
    const stateElement: Record<string, string | number | undefined> = state[section];
    return R.pipe(
      stateElement,
      R.entries(),
      R.flatMap(([key, value]) => {
        if (value !== undefined) {
          const sectionDef = directDRM[section];
          const attackerElement = sectionDef[key as keyof typeof sectionDef];
          const modifier:number = attackerElement[value as keyof typeof attackerElement]
          return isFinite(modifier) ? [{modifier, reason: `${section}.${key}`}] : [];
        }else{
          return [];
        }
      }),
    );
  }

  const reasons = R.pipe(
    directDRM,
    R.keys(),
    R.map(sectionDRM),
    R.flat(),
  )
  return {
    value: R.pipe(
      reasons,
      R.map(it => it!.modifier),
      R.sum(),
    ) as number,
    reasons,
  }
}