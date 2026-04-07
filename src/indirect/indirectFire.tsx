import {Select} from "../select.tsx";
import {indirectFireType, IndirectLosToTargetSupport, state} from "../state/state.tsx";
import {targetMarker} from "../targetMarker.tsx";
import {Togglable} from "../togglable.tsx";
import UAS from "../svg/uas.svg?react";
import moved from "../svg/moved.png";
import fst from "../svg/fst.png";
import recce from "../svg/recce.png";
import triangulation from "../svg/triangulation.png";
import interference from "../svg/interference.png";
import Tracked from "../svg/tracked.svg?react";
import {ComponentType} from "preact";
import {Img, imgComp} from "../imgComp.tsx";
import {allTerrain} from "../footInTerrain.tsx";
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
import {fpvJammingSvg} from "./fpvJammingSvg.tsx";

const losSupport: Record<IndirectLosToTargetSupport, ComponentType> = {
  fst: imgComp(fst),
  recce: imgComp(recce),
}

export function IndirectFire() {

  return <div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 3}}>
      <div style={{textAlign: 'center', padding: 4, borderRight: 'solid 1px black',}}>
        <Select of={[state.indirect.drm, 'losSupport_other']} values={losSupport}/>
        <Togglable of={[state.indirect.drm, 'losSupport_uas', 'yes']}><UAS/></Togglable>
        <Togglable of={[state.indirect.drm, 'ew_triangulation', 'yes']}><Img src={triangulation}/></Togglable>
        <Togglable of={[state.indirect.drm, 'ew_interference', 'yes']}><Img src={interference}/></Togglable>
        <Select of={[state.indirect.drm, 'fpv_jamming']} values={fpvJammingSvg}/>
      </div>
      <div style={{textAlign: 'center', padding: 4,}}>
        <Select of={[state.indirect.drm, 'target_marker']} values={targetMarker}/>
        <Select of={[state.indirect.drm, 'target_footInTerrain']} values={allTerrain}/>
        <Togglable of={[state.indirect.drm, 'target_moved', 'yes']}>{imgComp(moved)()}</Togglable>
        <Select of={[state.indirect.drm, 'target_shellScrapes']} values={shellScrapesSvg}/>
        <Togglable of={[state.indirect.drm, 'target_tracked', 'yes']}><Tracked/></Togglable>
      </div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <SelectionBar of={[state.indirect.attacker, 'firetype']} values={indirectFireType}/>
      <ProbabilityBar drm={indirectDRM} state={state.indirect} crt={indirectCRT}/>
      <SelectionBar of={[state, 'roll2d6']} values={roll2d6}
                    styles={result2d6style(state.indirect, indirectDRM, indirectCRT)}/>
      <Result drm={indirectDRM} state={state.indirect} crt={indirectCRT}/>
      <DRMExplained drm={indirectDRM} state={state.indirect} reasonLabels={reasonLabels}/>
    </div>
  </div>
}