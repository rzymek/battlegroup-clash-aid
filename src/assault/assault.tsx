import {Select} from "../select.tsx";
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
import {roll2d6} from "../state/roll2d6.tsx";
import {AssaultFirepower} from "./assaultFirepower.tsx";
import {hqSvg} from "./hqSvg.tsx";
import {tq} from "../tq.tsx";
import {assaultDRM} from "./DRM.ts";
import {LabelsFor} from "../calculateDRM.tsx";
import {DRMExplained} from "../DRMExplained.tsx";
import {AssaultResult} from "./assaultResult.tsx";

const reasonLabels: LabelsFor<typeof assaultDRM> = {
// "TQ difference between Attacker Foot and Defender Foot*",
  defender_reorg: "Defender has Reorg marker",
  attacker_hq: "Attacker HQ present",
  attacker_footAndTrackPresent: "Attacker has Foot PL and Tracked PL FEs present",
  defender_footAndTrackPresent: "Defender has Foot PL and Tracked PL-sized FEs present",
  defender_hq: "Defender HQ present",
  defender_shellScrapes: "Defender** has Digging / Shell Scrape marker",
  defender_urbanDenseElevated: "Defender** is in Urban/Dense Wood/Elevated position",
  location_bridge: "Smoke at Assault Location",
  location_smoke: "Defender is across a Bridge",
};

export function Assault() {
  return <div>
    <AssaultFirepower/>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3}}>
      <div style={{
        textAlign: 'center',
        padding: 4,
        gap: 4,
        display: 'flex',
        flexWrap: 'wrap',
        alignSelf: 'flex-start',
        justifyContent: 'center'
      }}>
        <Select of={[state.assault.drm, 'attacker_hq']} values={hqSvg}/>
        <Select of={[state.assault.attacker, 'TQ']} values={tq}/>
        <Togglable of={[state.assault.drm, 'attacker_footAndTrackPresent', 'yes']}><FootAndTrackedPresent/></Togglable>
        <Togglable of={[state.assault.drm, 'location_smoke', 'yes']}><Img src={smoke}/></Togglable>
        <Togglable of={[state.assault.drm, 'location_bridge', 'yes']}><Img src={bridge}/></Togglable>
      </div>
      <div style={{
        textAlign: 'center',
        padding: 4,
        gap: 4,
        display: 'flex',
        flexWrap: 'wrap',
        alignSelf: 'flex-start',
        borderLeft: 'solid 1px black',
        justifyContent: 'center'
      }}>
        <Select of={[state.assault.drm, 'defender_hq']} values={hqSvg}/>
        <Select of={[state.assault.defender, 'TQ']} values={tq}/>
        <Togglable of={[state.assault.drm, 'defender_footAndTrackPresent', 'yes']}><FootAndTrackedPresent/></Togglable>
        <Togglable of={[state.assault.drm, 'defender_reorg', 'yes']}><Img src={reorg}/></Togglable>
        <Togglable of={[state.assault.drm, 'defender_urbanDenseElevated', 'yes']}><Img
          src={urbanWoodElevated}/></Togglable>
        <Select of={[state.assault.drm, 'defender_shellScrapes']} values={shellScrapesSvg}/>
      </div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <SelectionBar of={[state, 'roll2d6']} values={roll2d6}/>
      <AssaultResult/>
      <DRMExplained drm={assaultDRM} state={state.assault} reasonLabels={reasonLabels}/>
    </div>
  </div>
}