import {ComponentType} from "preact";
import {toggle} from "./togglable.tsx";
import {Selectable} from "./selectable.tsx";

export function Select<T extends {}, R extends keyof T, K extends T[R] & string>(props: {
  of: [T, R],
  values: Record<K, ComponentType>
}) {
  const [obj, key] = props.of;
  const allKeys = Object.keys(props.values) as K[];
  return <>
    {allKeys.map(value => {
        const Img = props.values[value] as ComponentType;
        return <Selectable selected={obj[key] === value}
                           onClick={toggle(obj, key, value)}>
          <Img/>
        </Selectable>;
      }
    )}</>
}