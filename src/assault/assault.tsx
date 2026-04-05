import {Select} from "../select.tsx";
import * as R from "remeda";
import {state} from "../state/state.tsx";
import {Togglable} from "../togglable.tsx";
import {Img} from "../imgComp.tsx";
import FootAndTrackedPresent from "../svg/foot+tracked.svg?react";
import smoke from "../svg/smoke.png";
import reorg from "../svg/reorg.png";
import bridge from "../svg/bridge.svg";
import urbanWoodElevated from "../svg/urban-wood-elevated.png";
import {shellScrapesSvg} from "../shellScrapesSvg.tsx";
import {SelectionBar} from "../SelectionBar.tsx";
import {indirectDRM} from "../indirect/DRM.tsx";
import {indirectCRT} from "../indirect/CRT.ts";
import {roll2d6} from "../state/roll2d6.tsx";
import {result2d6style} from "../result2d6style.tsx";
import {AssaultFirepower} from "./assaultFirepower.tsx";
import {hqSvg} from "./hqSvg.tsx";
import {calculateCombatRatio} from "./combatRatio.tsx";
import {tq} from "../tq.tsx";

export function Assault() {
  return <div>
    <AssaultFirepower/>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3}}>
      <div style={{textAlign: 'center', padding: 4, gap: 4, display:'flex', flexWrap:'wrap', alignSelf: 'flex-start',justifyContent:'center'}}>
        <Select of={[state.assault.attacker, 'hq']} values={hqSvg}/>
        <Select of={[state.assault.attacker, 'TQ']} values={tq}/>
        <Togglable of={[state.assault.attacker, 'footAndTrackPresent', 'yes']}><FootAndTrackedPresent/></Togglable>
        <Togglable of={[state.assault.location, 'smoke', 'yes']}><Img src={smoke}/></Togglable>
        <Togglable of={[state.assault.location, 'bridge', 'yes']}><Img src={bridge}/></Togglable>
      </div>
      <div style={{textAlign: 'center', padding: 4, gap: 4, display:'flex', flexWrap:'wrap',  alignSelf: 'flex-start',borderLeft: 'solid 1px black', justifyContent:'center'}}>
        <Select of={[state.assault.defender, 'hq']} values={hqSvg}/>
        <Select of={[state.assault.defender, 'TQ']} values={tq}/>
        <Togglable of={[state.assault.defender, 'footAndTrackPresent', 'yes']}><FootAndTrackedPresent/></Togglable>
        <Togglable of={[state.assault.defender, 'reorg', 'yes']}><Img src={reorg}/></Togglable>
        <Togglable of={[state.assault.defender, 'urbanDenseElevated', 'yes']}><Img src={urbanWoodElevated}/></Togglable>
        <Select of={[state.assault.defender, 'shellScrapes']} values={shellScrapesSvg}/>
      </div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div style={{textAlign:'center', fontSize:'8mm', fontWeight:'bold'}}>
        {calculateCombatRatio(R.sum(state.assault.firepower.attacker), R.sum(state.assault.firepower.defender))}
        &nbsp;&nbsp;&nbsp;({R.sum(state.assault.firepower.attacker)}:{R.sum(state.assault.firepower.defender)})
      </div>
      <SelectionBar of={[state, 'roll2d6']} values={roll2d6}
                    styles={result2d6style(state.indirect, indirectDRM, indirectCRT)}/>
      <pre>{JSON.stringify(state.assault, null, 2)}</pre>
    </div>
  </div>
}