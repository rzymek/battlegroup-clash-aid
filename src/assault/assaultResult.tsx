import {calculateResult} from "./calculateResult.tsx";

export function AssaultResult() {
  const result = calculateResult();
  const info = <>
    <i>(ratio: {result.rawRatio} - <b>"{result.ratio}"</b>, DRM: {result.drm.value}, modified dice  roll: {result.modifierDiceRoll})</i></>;
  return <div style={{padding: 8, display: 'flex', flexDirection: 'column', gap: 6}}>
    {result.losses ? <>
        <div>Losses:
            Attacker: <b>{result.losses.attacker}</b>
          {' '} Defender: <b>{result.losses.defender}</b>
        </div>
        <div>Pull Back: <b>{result.losses.pullback}</b>
          {' '}{info}
        </div>
    </> : info}
  </div>
}