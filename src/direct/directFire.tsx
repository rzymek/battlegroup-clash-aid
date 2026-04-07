import {Select} from "../select.tsx";
import {state} from "../state/state.tsx";
import {tq} from "../tq.tsx";
import {Togglable} from "../togglable.tsx";
import Overwatch from "../svg/overwatch.svg?react";
import {moved} from "../moved.tsx";
import SameWoodsUrban from "../svg/same-dense-terrain.svg?react";
import LessThen250m from "../svg/250m.svg?react";
import {losThrough} from "../losThrough.tsx";
import {targetMarker} from "../targetMarker.tsx";
import {footInTerrain} from "../footInTerrain.tsx";
import {shellScrapesSvg} from "../shellScrapesSvg.tsx";
import {SelectionBar} from "../SelectionBar.tsx";
import {firetype, firetypeLabels} from "../state/firetype.tsx";
import {ProbabilityBar} from "../probabilityBar.tsx";
import {roll2d6} from "../state/roll2d6.tsx";
import {result2d6style} from "../result2d6style.tsx";
import {Result} from "../result.tsx";
import {DRMExplained} from "../DRMExplained.tsx";
import {directDRM} from "./DRM.tsx";
import {directCRT} from "./CRT.ts";
import {reasonLabels} from "./ReasonLabels.tsx";
import {suppression} from "../suppression.tsx";

export function DirectFire() {
  return <>
    <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 3}}>
      <div style={{
        textAlign: 'center', borderRight: 'solid 1px black',
        padding: 4,
      }}>
        <Select of={[state.direct.drm, 'attacker_TQ']} values={tq}/>
        <Togglable of={[state.direct.drm, 'attacker_overwatch', 'yes']}><Overwatch/></Togglable>
        <Select of={[state.direct.drm, 'attacker_moved']} values={moved}/>
        <Select of={[state.direct.drm, 'attacker_suppression']} values={suppression}/>
      </div>
      <div style={{
        borderRight: 'solid 1px black',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: 100,
        padding: 4
      }}>
        <Togglable of={[state.direct.drm, 'between_sameWoodsUrban', 'yes']}>
          <SameWoodsUrban/>
        </Togglable>
        <Select of={[state.direct.drm, 'between_losThrough']} values={losThrough}/>
        <Togglable of={[state.direct.drm, 'between_lessThen250m', 'yes']}><LessThen250m/></Togglable>
      </div>
      <div style={{textAlign: 'center', padding: 4}}>
        <Select of={[state.direct.drm, 'defender_targetMarker']} values={targetMarker}/>
        <Select of={[state.direct.drm, 'defender_footInTerrain']} values={footInTerrain}/>
        <Select of={[state.direct.drm, 'defender_shellScrapes']} values={shellScrapesSvg}/>
      </div>
    </div>
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <SelectionBar of={[state.direct.attacker, 'firetype']} values={firetype} labels={firetypeLabels}/>
      <ProbabilityBar drm={directDRM} state={state.direct} crt={directCRT}/>
      <SelectionBar of={[state, 'roll2d6']} values={roll2d6}
                    styles={result2d6style(state.direct, directDRM, directCRT)}/>
      <Result drm={directDRM} state={state.direct} crt={directCRT}/>
      <DRMExplained drm={directDRM} state={state.direct} reasonLabels={reasonLabels}/>
    </div>
  </>;
}