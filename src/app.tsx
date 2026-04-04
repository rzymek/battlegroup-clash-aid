import './app.css'
import overwatch from './svg/overwatch.svg?react'
import SameWoodsUrban from './svg/same-dense-terrain.svg?react'
import {state} from "./state/state.tsx";
import {footInTerrain} from "./footInTerrain.tsx";
import {shellScrapesSvg} from "./shellScrapesSvg.tsx";
import {moved} from "./moved.tsx";
import {targetMarker} from "./targetMarker.tsx";
import {losThrough} from "./losThrough.tsx";
import {tq} from "./tq.tsx";
import {Togglable} from "./togglable.tsx";
import {Select} from "./select.tsx";
import {SelectionBar} from "./SelectionBar.tsx";
import {firetype, firetypeLabels} from "./state/firetype.tsx";
import {combatTypes} from "./state/combatTypes.tsx";
import {roll2d6} from "./state/roll2d6.tsx";
import {Results} from "./results.tsx";
import {ProbabilityBar} from "./probabilityBar.tsx";
import {calculateDRM} from "./calculateDRM.tsx";
import {result2d6style} from "./result2d6style.tsx";

export function App() {
  return (
    <div>
      <SelectionBar of={[state, 'combatTypes']} values={combatTypes}/>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr 2fr', gap: 3}}>
        <div style={{
          textAlign: 'center', borderRight: 'solid 1px black',
          padding: 4,
        }}>
          <Select of={[state.direct.attacker, 'TQ']} values={tq}/>
          <Togglable of={[state.direct.attacker, 'overwatch', 'yes']}>{overwatch}</Togglable>
          <Select of={[state.direct.attacker, 'moved']} values={moved}/>
        </div>
        <div style={{
          borderRight: 'solid 1px black',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 100,
          padding: 4
        }}>
          <Togglable of={[state.direct.between, 'sameWoodsUrban', 'yes']}>
            <SameWoodsUrban/>
          </Togglable>
          <Select of={[state.direct.between, 'losThrough']} values={losThrough}/>
        </div>
        <div style={{textAlign: 'center', padding: 4}}>
          <Select of={[state.direct.defender, 'targetMarker']} values={targetMarker}/>
          <Select of={[state.direct.defender, 'footInTerrain']} values={footInTerrain}/>
          <Select of={[state.direct.defender, 'shellScrapes']} values={shellScrapesSvg}/>
        </div>
      </div>
      <div style={{display: 'flex', flexDirection:'column', gap: 4}}>
        <SelectionBar of={[state.direct.attacker, 'firetype']} values={firetype} labels={firetypeLabels}/>
        <ProbabilityBar drm={calculateDRM(state.direct)}/>
        <SelectionBar of={[state, 'roll2d6']} values={roll2d6} styles={result2d6style(state.direct)}/>
        <Results/>
      </div>
      <pre style={{fontSize: 12}}>{JSON.stringify(state, null, 2)}</pre>
    </div>
  )
}

