import {Select} from "../select.tsx";
import {indirectFireType, IndirectLosToTargetSupport, state} from "../state/state.tsx";
import {targetMarker} from "../targetMarker.tsx";
import {Togglable} from "../togglable.tsx";
import UAS from "../svg/uas.svg?react";
import moved from "../svg/moved.png";
import fst from "../svg/fst.png";
import recce from "../svg/recce.png";
import Tracked from "../svg/tracked.svg?react";
import {ComponentType} from "preact";
import {imgComp} from "../imgComp.tsx";
import {footInTerrain} from "../footInTerrain.tsx";
import {shellScrapesSvg} from "../shellScrapesSvg.tsx";
import {SelectionBar} from "../SelectionBar.tsx";
import {roll2d6} from "../state/roll2d6.tsx";
import {ProbabilityBar} from "../probabilityBar.tsx";
import {indirectDRM} from "./DRM.tsx";
import {indirectCRT} from "./CRT.ts";
import {Result} from "../result.tsx";
import {DRMExplained} from "../DRMExplained.tsx";
import {reasonLabels} from "./ReasonLabels.tsx";
import {result2d6style} from "../result2d6style.tsx";

const losSupport: Record<IndirectLosToTargetSupport, ComponentType> = {
  fst: imgComp(fst),
  recce: imgComp(recce),
}

export function IndirectFire() {
  return <div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 4fr', gap: 3}}>
      <div style={{textAlign: 'center', padding: 4, borderRight: 'solid 1px black',}}>
        <Select of={[state.indirect.losSupport, 'other']} values={losSupport}/>
        <Togglable of={[state.indirect.losSupport, 'uas', 'yes']}><UAS/></Togglable>
      </div>
      <div style={{textAlign: 'center', padding: 4,}}>
        <Select of={[state.indirect.target, 'marker']} values={targetMarker}/>
        <Select of={[state.indirect.target, 'footInTerrain']} values={footInTerrain}/>
        <Togglable of={[state.indirect.target, 'moved', 'yes']}>{imgComp(moved)()}</Togglable>
        <Select of={[state.indirect.target, 'shellScrapes']} values={shellScrapesSvg}/>
        <Togglable of={[state.indirect.target, 'tracked', 'yes']}><Tracked/></Togglable>
      </div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <SelectionBar of={[state.indirect.attacker, 'firetype']} values={indirectFireType}/>
      <ProbabilityBar drm={indirectDRM} state={state.indirect} crt={indirectCRT}/>
      <SelectionBar of={[state, 'roll2d6']} values={roll2d6} styles={result2d6style(state.indirect, indirectDRM, indirectCRT)}/>
      <Result drm={indirectDRM} state={state.indirect} crt={indirectCRT}/>
      <DRMExplained drm={indirectDRM} state={state.indirect} reasonLabels={reasonLabels}/>
    </div>
  </div>
}