import * as R from "remeda";

export type DRMRow = { modifier: number, reason: string }
type DRM<T extends string | number | undefined> = {
  [key in Exclude<T, undefined>]: number
}
export type DRMDef<T extends SubState> = {
  [key in keyof T]: {
    [subkey in keyof T[key]]: DRM<T[key][subkey]>
  }
} & {
  postprocess?(result: DRMRow[], state: T): DRMRow[] | undefined
}
export type SubState<FT extends string = string> = Record<string, Record<string, number | string | undefined>> & {
  attacker: {
    firetype?: FT
  } & Record<string, number | string | undefined>//TODO
}

export function calculateDRM<T extends SubState>(state: T, drm: DRMDef<T>) {

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

  const allReasons = R.pipe(
    drm as Record<string, any>,
    R.keys(),
    R.filter(it => it !== 'postprocess'),
    R.map(it => sectionDRM(it)),
    R.flat(),
  );
  const reasons = drm.postprocess?.(allReasons, state) ?? allReasons;

  return {
    value: R.pipe(
      reasons,
      R.map(it => it!.modifier),
      R.sum(),
    ) as number,
    reasons,
  }
}