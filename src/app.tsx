import './app.css'
import TQ from './svg/TQ.svg?react'
import target1 from './svg/target1.svg?react'
import target2 from './svg/target2.svg?react'
import moved from './svg/moved.svg?react'
import digging from './svg/digging.svg?react'
import {SvgContent} from "./SvgContent.tsx";
import {ReactNode} from 'react';
import {state} from "./state/state.tsx";
import {update} from "./state/update.ts";
import {ComponentType} from "preact";

function Selectable(props: {
  selected?: boolean;
  onClick?: () => void,
  children?: ReactNode,
}) {
  return <div style={{
    display: 'flex',
    borderStyle: 'solid',
    borderWidth: 3,
    borderColor: props.selected ? 'blue' : 'transparent',
    borderRadius: 6,
    userSelect: 'none'
  }} onClick={props.onClick}>{props.children}</div>
}

function Togglable<T extends {}, R extends keyof T>(props: {
  of: [T, R, T[R]],
  svg: ComponentType,
  children?: string | number,
}) {
  const [obj, key, value] = props.of;
  return <Selectable selected={obj[key] === value}
                     onClick={toggle(obj, key, value)}>
    <SvgContent svg={props.svg}>{props.children}</SvgContent>
  </Selectable>
}

const target = [
  {svg: target1, v: 1},
  {svg: target2, v: 2},
] as const;

function toggle<T extends {}, R extends keyof T>(obj: T, key: R, value: T[R]) {
  return update(() => {
    if (obj[key] === value) {
      obj[key] = undefined as T[R]
    } else {
      obj[key] = value;
    }
  });
}

export function App() {
  return (
    <div>
      <div style={{height: '1cm', display: 'flex', gap: 1}}>
        {[6, 5, 4, 3].map(v =>
          <Selectable selected={state.direct.attacker.TQ === v} onClick={toggle(state.direct.attacker, 'TQ', v)}
                      key={v}>
            <SvgContent svg={TQ}>{v < 4 ? `${v}-` : v}</SvgContent>
          </Selectable>
        )}
      </div>
      <div style={{height: '1cm', display: 'flex', gap: 1}}>
        {target.map(it =>
          <Selectable selected={state.direct.defender.target === it.v}
                      onClick={toggle(state.direct.defender, 'target', it.v)}
                      key={it.v}>
            <SvgContent svg={it.svg} key={it.v}/>
          </Selectable>
        )}
        <Togglable svg={moved} of={[state.direct.attacker, 'moved', true]}/>
        <Togglable svg={digging} of={[state.direct.attacker, 'digging', true]}/>
      </div>
      <pre style={{fontSize:6}}>{JSON.stringify(state, null, 2)}</pre>
    </div>
  )
}
