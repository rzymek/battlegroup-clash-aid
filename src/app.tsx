import './app.css'
import TQ from './svg/TQ.svg?react'
import overwatch from './svg/overwatch.svg?react'
import SameWoodsUrban from './svg/same-dense-terrain.svg?react'
import {SvgContent} from "./SvgContent.tsx";
import {ReactNode} from 'react';
import {state} from "./state/state.tsx";
import {update} from "./state/update.ts";
import {ComponentType} from "preact";
import {footInTerrain} from "./footInTerrain.tsx";
import {shellScrapesSvg} from "./shellScrapesSvg.tsx";
import {moved} from "./moved.tsx";
import {targetMarker} from "./targetMarker.tsx";
import {losThrough} from "./losThrough.tsx";

function Selectable(props: {
  selected?: boolean;
  onClick?: () => void,
  children?: ReactNode,
}) {
  return <div style={{
    minHeight: '15mm',
    maxHeight: '2cm',
    minWidth: '15mm',
    maxWidth: '2cm',
    display: 'inline-flex',
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

function toggle<T extends {}, R extends keyof T>(obj: T, key: R, value: T[R]) {
  return update(() => {
    if (obj[key] === value) {
      obj[key] = undefined as T[R]
    } else {
      obj[key] = value;
    }
  });
}

function Select<T extends {}, R extends keyof T, K extends T[R] & string>(props: {
  of: [T, R],
  values: Record<K, ComponentType>
}) {
  const [obj, key] = props.of;
  const allKeys = Object.keys(props.values) as K[];

  return <>
    {allKeys.map(value =>
      <Selectable selected={obj[key] === value}
                  onClick={toggle(obj, key, value)}>
        <SvgContent svg={props.values[value]} key={value}/>
      </Selectable>
    )}</>
}

export function App() {
  return (
    <div>
      <div style={{display: 'grid', gridTemplateColumns: '40% 20% 40%', gap: 3}}>
        <div style={{borderRight: 'solid 1px black'}}>
          {([6, 5, 4, 3] as const).map(v =>
            <Selectable selected={state.direct.attacker.TQ === v} onClick={toggle(state.direct.attacker, 'TQ', v)}
                        key={v}>
              <SvgContent svg={TQ}>{v < 4 ? `${v}-` : v}</SvgContent>
            </Selectable>
          )}
          <Togglable svg={overwatch} of={[state.direct.attacker, 'overwatch', true]}/>
          <Select of={[state.direct.attacker, 'moved']} values={moved}/>
        </div>
        <div style={{borderRight: 'solid 1px black'}}>
            <Togglable svg={SameWoodsUrban} of={[state.direct.between, 'sameWoodsUrban', true]}/>
            <Select of={[state.direct.between, 'losThrough']} values={losThrough}/>
        </div>
        <div>
          <Select of={[state.direct.defender, 'targetMarker']} values={targetMarker}/>
          <Select of={[state.direct.defender, 'footInTerrain']} values={footInTerrain}/>
          <Select of={[state.direct.defender, 'shellScrapes']} values={shellScrapesSvg}/>
        </div>
      </div>
      <pre style={{fontSize: 6}}>{JSON.stringify(state, null, 2)}</pre>
    </div>
  )
}
