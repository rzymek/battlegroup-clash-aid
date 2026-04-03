import {update} from "./state/update.ts";
import './app.css'
import {ReactNode} from 'react';
import {CSSProperties} from "preact";
import {Selectable} from "./selectable.tsx";

export function Togglable<T extends {}, R extends keyof T>(props: {
  of: [T, R, T[R]],
  style?: CSSProperties,
  children: ReactNode,
  selectedStyle?: CSSProperties,
}) {
  const [obj, key, value] = props.of;
  return <Selectable selected={obj[key] === value}
                     selectedStyle={props.selectedStyle}
                     style={props.style}
                     onClick={toggle(obj, key, value)}>
    {props.children}
  </Selectable>
}

export function toggle<T extends {}, R extends keyof T>(obj: T, key: R, value: T[R]) {
  return update(() => {
    if (obj[key] === value) {
      obj[key] = undefined as T[R]
    } else {
      obj[key] = value;
    }
  });
}