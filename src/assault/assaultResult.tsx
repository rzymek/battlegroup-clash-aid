import {calculateResult} from "./calculateResult.tsx";
import {state} from "../state/state.tsx";

export function AssaultResult() {
  const result = calculateResult(state.roll2d6);
  return <div style={{padding: 8, display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', fontSize: '7mm'}}>
    <div><i>Ratio: <b>{result.ratio}</b> ({result.rawRatio}), DRM: <b>{result.drm.value}</b></i></div>
    {'result' in result &&
        <div>
            Attacker: <b>{result.result.attacker}</b>,
          {' '} Defender: <b>{result.result.defender}</b>,
          {' '} Pull Back: <b style={{textTransform:'capitalise'}}>{result.result.pullback}</b>
        </div>}
  </div>
}