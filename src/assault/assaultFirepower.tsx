import {Img} from "../imgComp.tsx";
import fp1 from '../svg/assault/1.svg';
import fp2 from '../svg/assault/2.svg';
import fp3 from '../svg/assault/3.svg';
import fp4 from '../svg/assault/4.svg';
import fp5 from '../svg/assault/5.svg';
import fp6 from '../svg/assault/6.svg';
import fp7 from '../svg/assault/7.svg';
import fp8 from '../svg/assault/8.svg';
import fp10 from '../svg/assault/10.svg';
import backspace from '../svg/assault/backspace.svg';
import * as R from "remeda";
import {update} from "../state/update.ts";
import {state} from "../state/state.tsx";

const fpImg: Record<number, string> = {
  1: fp1,
  2: fp2,
  3: fp3,
  4: fp4,
  5: fp5,
  6: fp6,
  7: fp7,
  8: fp8,
  10: fp10,
}

function FirepowerKeyboard(props: { field: number[], color:string }) {
  return <div style={{
    display: 'flex',
    gap: 3,
    flexWrap: 'wrap',
    padding: 8,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  }}>
    {R.pipe(
      fpImg,
      R.entries(),
      R.map(([v, img]) => <Img src={img} key={v} style={{backgroundColor: props.color}}
                               onClick={update(() => props.field.push(Number(v)))}/>)
    )}
    <Img src={backspace} onClick={update(() => props.field.pop())} style={{backgroundColor: props.color}}/>
  </div>
}

function FirepowerValue(props: { field: number[],color:string}) {
  const sum = R.pipe(props.field, R.sum());
  if (sum === 0) {
    return <div/>;
  }
  return <div style={{padding: 8}}>
    {sum} = {props.field.map((item) =>
    <Img src={fpImg[item]} style={{height: '5mm', marginRight: 3, backgroundColor: props.color}}/>
  )}
  </div>

}

export function AssaultFirepower() {
  return <div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 100px 1fr'}}>
      <FirepowerKeyboard field={state.assault.firepower.attacker} color='lightpink'/>
      <div style={{display: 'grid' ,gridTemplateRows:'1fr auto 1fr',
        border:'solid 1px black',
        borderTop: 'none',
        borderBottom: 'none',
        alignItems:'center'
      }}>
        <FirepowerValue field={state.assault.firepower.attacker} color='lightpink'/>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 4,
          fontSize: '8mm',
          whiteSpace: 'nowrap',
        }}>{R.sum(state.assault.firepower.attacker)} : {R.sum(state.assault.firepower.defender)}
        </div>
        <FirepowerValue field={state.assault.firepower.defender} color='lightblue'/>
      </div>
      <FirepowerKeyboard field={state.assault.firepower.defender} color='lightblue'/>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr'}}>
    </div>
  </div>
}
