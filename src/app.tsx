import './app.css'
import {state} from "./state/state.tsx";
import {SelectionBar} from "./SelectionBar.tsx";
import {combatTypes} from "./state/combatTypes.tsx";
import {DirectFire} from "./directFire.tsx";
import {IndirectFire} from "./indirect/indirectFire.tsx";
import {Assault} from "./assault/assault.tsx";

export function App() {
  return (
    <div>
      <SelectionBar of={[state, 'combatTypes']} values={combatTypes} required/>
      <Router/>
      {/*<pre>{JSON.stringify(state, null, 2)}</pre>*/}
    </div>
  )
}

function Router() {
  switch (state.combatTypes) {
    case "direct":
      return <DirectFire/>
    case "indirect":
      return <IndirectFire/>
    case "assault":
      return <Assault/>
  }
}
