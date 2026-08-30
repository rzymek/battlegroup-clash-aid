import {PropsWithChildren} from "preact/compat";

export function BoldifyValue({value, values, children}: PropsWithChildren<{
  value: string | number | undefined;
  values: Record<string, string>;
}>) {
  if (typeof children !== "string") return children;
  const displayText = value != null ? values[value] : undefined;
  return children.split(/\[(.*?)]/).map((part, i) =>
    i % 2 === 1 && part === displayText ? <b>{part}</b> : part
  );
}
