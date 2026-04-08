import * as R from "remeda";
import {isFunction} from "remeda";

export type DRMRow<T extends string = string> = { modifier: number, reason: T, note?: string }

export type Reason<T extends {
  drm: DRMState
}> = Exclude<keyof T['drm'], number | symbol | 'preprocess' | 'postprocess'>
export type DRMState = Record<string, string | number | undefined>;
export type DRMDef<T extends { drm: DRMState }> = {
  [key in keyof T['drm']]: {
    [value in Exclude<T['drm'][key], undefined>]: number
  }
} & {
  postprocess?(result: DRMRow<Reason<T>>[], state: T): DRMRow<Reason<T>>[] | undefined
  preprocess?(state: T): T | undefined
}
export type SubState = { drm: DRMState, attacker: { firetype: string | undefined } }

export function calculateDRM<T extends { drm: DRMState }>(state: T, drm: DRMDef<T>): {
  value: number;
  reasons: DRMRow<Reason<T>>[]
} {
  state = drm.preprocess?.(state) ?? state;

  const allReasons = R.pipe(
    drm,
    R.entries(),
    R.filter(([key, value]) => !isFunction(value) && state.drm[key] !== undefined),
    R.map(([key, drmForKey]) => {
      const stateVal = state.drm[key]
      const modifier: number = drmForKey[stateVal as keyof typeof drmForKey];
      return {modifier, reason: key as Reason<T>} satisfies DRMRow<Reason<T>>;
    }),
  );

  const reasons = drm.postprocess?.(allReasons as any, state) ?? allReasons;

  return {
    value: R.pipe(
      reasons,
      R.map(it => it!.modifier),
      R.sum(),
    ) as number,
    reasons,
  }
}

export type LabelsFor<D extends Record<string, object>> = {
  [label in keyof D]: string
}