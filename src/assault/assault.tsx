import {Select} from "../select.tsx";
import {state} from "../state/state.tsx";
import {Togglable} from "../togglable.tsx";
import {imgComp} from "../imgComp.tsx";
import FootAndTrackedPresent from "../svg/foot+tracked.svg?react";
import smoke from "../svg/smoke.png";
import reorg from "../svg/reorg.png";
import {shellScrapesSvg} from "../shellScrapesSvg.tsx";
import {SelectionBar} from "../SelectionBar.tsx";
import {ProbabilityBar} from "../probabilityBar.tsx";
import {indirectDRM} from "../indirect/DRM.tsx";
import {indirectCRT} from "../indirect/CRT.ts";
import {roll2d6} from "../state/roll2d6.tsx";
import {result2d6style} from "../result2d6style.tsx";
import {Result} from "../result.tsx";
import {DRMExplained} from "../DRMExplained.tsx";
import {reasonLabels} from "../indirect/ReasonLabels.tsx";

export function Assault() {
  return <div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3}}>
      <div style={{textAlign: 'center', padding: 4, borderRight: 'solid 1px black',}}>
        <Togglable of={[state.assault.attacker, 'footAndTrackPresent', 'yes']}><FootAndTrackedPresent/></Togglable>
      </div>
      <div style={{
        borderRight: 'solid 1px black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 100,
        padding: 4
      }}>
        <Togglable of={[state.assault.location, 'smoke', 'yes']}>{imgComp(smoke)()}</Togglable>
      </div>
      <div style={{textAlign: 'center', padding: 4,}}>
        <Togglable of={[state.assault.defender, 'reorg', 'yes']}>{imgComp(reorg)()}</Togglable>
        <Select of={[state.assault.defender, 'shellScrapes']} values={shellScrapesSvg}/>
        <Togglable of={[state.assault.defender, 'footAndTrackPresent', 'yes']}><FootAndTrackedPresent/></Togglable>
      </div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <ProbabilityBar drm={indirectDRM} state={state.indirect} crt={indirectCRT}/>
      <SelectionBar of={[state, 'roll2d6']} values={roll2d6}
                    styles={result2d6style(state.indirect, indirectDRM, indirectCRT)}/>
      <Result drm={indirectDRM} state={state.indirect} crt={indirectCRT}/>
      <DRMExplained drm={indirectDRM} state={state.indirect} reasonLabels={reasonLabels}/>
    </div>
  </div>
}