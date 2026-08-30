import {PropsWithChildren} from "preact/compat";

export function BoldifyValue(props: PropsWithChildren<{ value: string | number | undefined }>) {
  return props.children
}