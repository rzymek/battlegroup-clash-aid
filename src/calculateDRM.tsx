import * as R from "remeda";

type DRM<T extends string | number | undefined> = {
  [key in Exclude<T, undefined>]: number
}
export type DRMDef<T extends SubState> = {
  [key in keyof T]: {
    [subkey in keyof T[key]]: DRM<T[key][subkey]>
  }
}
export type SubState<FT extends string = string> = Record<string, Record<string, number | string | undefined>> & {
  attacker: {
    firetype?: FT
  } & Record<string, number | string | undefined>//TODO
}

export function calculateDRM<T extends SubState<string>>(state: T, drm: DRMDef<T>) {

  function sectionDRM(section: keyof typeof drm) {
    const stateElement: Record<string, string | number | undefined> = state[section];
    return R.pipe(
      stateElement,
      R.entries(),
      R.flatMap(([key, value]) => {
        if (value !== undefined) {
          const sectionDef = drm[section];
          const attackerElement = sectionDef[key as keyof typeof sectionDef];
          const modifier: number = attackerElement[value as keyof typeof attackerElement]
          return isFinite(modifier) ? [{modifier, reason: `${section as string}.${key}`}] : [];
        } else {
          return [];
        }
      }),
    );
  }

  const reasons = R.pipe(
    drm as Record<string, any>,
    R.keys(),
    R.map(it => sectionDRM(it)),
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