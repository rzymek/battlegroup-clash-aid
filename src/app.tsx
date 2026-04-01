import './app.css'
import TQ from './svg/TQ.svg?react'
import target1 from './svg/target1.svg?react'
import target2 from './svg/target2.svg?react'
import {SvgContent} from "./SvgContent.tsx";
import {ReactNode} from 'react';
import {state} from "./state/state.tsx";
import {update} from "./state/update.ts";

function Selectable(props: { selected?: boolean; onClick?: () => void, children?: ReactNode }) {
  return <div style={{
    display: 'flex',
    borderStyle: 'solid',
    borderWidth: 3,
    borderColor: props.selected ? 'blue' : 'transparent',
    borderRadius: 6
  }} onClick={props.onClick}>{props.children}</div>
}

export function App() {
  return (
    <div>
      Hello
      <div style={{height: '1cm', display: 'flex'}}>
        {[6, 5, 4, 3].map(v =>
          <Selectable selected={state.direct.attacker.TQ === v} onClick={update(()=>state.direct.attacker.TQ = v)} key={v}>
            <SvgContent svg={TQ}>{v < 4 ? `${v}-` : v}</SvgContent>
          </Selectable>
        )}
        <SvgContent svg={target1}/>
        <SvgContent svg={target2}/>
      </div>
    </div>
  )
}
