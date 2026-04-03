import './app.css'
import overwatch from './svg/overwatch.svg?react'
import SameWoodsUrban from './svg/same-dense-terrain.svg?react'
import {ReactNode} from 'react';
import {state} from "./state/state.tsx";
import {update} from "./state/update.ts";
import {ComponentType} from "preact";
import {footInTerrain} from "./footInTerrain.tsx";
import {shellScrapesSvg} from "./shellScrapesSvg.tsx";
import {moved} from "./moved.tsx";
import {targetMarker} from "./targetMarker.tsx";
import {losThrough} from "./losThrough.tsx";
import {tq} from "./tq.tsx";

function Selectable(props: {
  selected?: boolean;
  onClick?: () => void,
  children?: ReactNode,
}) {
  return <div style={{
    height: '15mm',
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
  img: ComponentType,
  children?: string | number,
}) {
  const Img = props.img;
  const [obj, key, value] = props.of;
  return <Selectable selected={obj[key] === value}
                     onClick={toggle(obj, key, value)}>
    <Img/>
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
    {allKeys.map(value => {
        const Img = props.values[value] as ComponentType;
        return <Selectable selected={obj[key] === value}
                           onClick={toggle(obj, key, value)}>
          <Img/>
        </Selectable>;
      }
    )}</>
}

export function App() {
  return (
    <div>
      <div style={{display: 'grid', gridTemplateColumns: '40% 1fr 40%', gap: 3}}>
        <div style={{borderRight: 'solid 1px black'}}>
          <Select of={[state.direct.attacker, 'TQ']} values={tq}/>
          <Togglable img={overwatch} of={[state.direct.attacker, 'overwatch', true]}/>
          <Select of={[state.direct.attacker, 'moved']} values={moved}/>
        </div>
        <div style={{borderRight: 'solid 1px black', display:'flex', flexDirection:'column', alignItems:'center', minWidth: 100}}>
          <Togglable img={SameWoodsUrban} of={[state.direct.between, 'sameWoodsUrban', true]}/>
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
