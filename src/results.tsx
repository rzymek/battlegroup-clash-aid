import {calculateDRM} from "./calculateDRM.tsx";
import {state} from "./state/state.tsx";
import {calculateResult, ResultValue} from "./calculateResult.tsx";
import {ReactNode} from "preact/compat";
import * as R from 'remeda';

const resultLabels: Record<ResultValue, ReactNode> = {
  1: '1 hit',
  2: '2 hits',
  3: '3 hits',
  S: 'Suppressed',
  '-': 'miss',
} as const;

function ProbabilityBar(props: { drm: { value: number } }) {
  const d6 = [1, 2, 3, 4, 5, 6];
  const r = R.pipe(
    d6,
    R.flatMap(d1 => d6.map(d2 => d1 + d2)),
    R.map(result2d6 => calculateResult({
      ...state,
      result2d6
    }, props.drm.value)?.result),
    R.groupBy(it => it),
    R.mapValues(arr => ((100 * arr.length) / (6 * 6)).toFixed().padStart(2,' ') + '%')
  )

  return <div style={{display:'flex'}}>
    <div style={{background: 'red', height: '10mm', width: r['3']}}/>
    <div style={{background: 'orange', height: '10mm', width: r['2']}}/>
    <div style={{background: 'lightpink', height: '10mm', width: r['1']}}/>
    <div style={{background: 'yellow', height: '10mm', width: r['S']}}/>
    <div style={{background: 'lightgray', height: '10mm', width: r['-']}}/>
  </div>
}

export function Results() {
  const drm = calculateDRM(state.direct);
  const result = calculateResult(state, drm.value);
  return <div style={{padding: 8, display: 'flex', flexDirection: 'column', gap: 6}}>
    <ProbabilityBar drm={drm}/>
    {result && <>
        <div>Result: <b>{resultLabels[result.result]}</b>
            (drm: {drm.value}, modified dice roll: {result.modifiedDiceRoll})
        </div>
        <div>
            <table>
                <thead>
                <tr>
                    <th>Reason</th>
                    <th>DRM</th>
                </tr>
                </thead>
                <tbody>
                {drm.reasons.map((r, idx) => <tr key={idx}>
                  <td>{reasonLabels[r.reason] ?? r.reason}</td>
                  <th>{r.modifier}</th>
                </tr>)}
                </tbody>
            </table>
        </div>
    </>}
  </div>
}

const reasonLabels: Record<string, string> = {
  "condition": "Value of played Target marker",
  "attacker.TQ": "TQ for Firing FE*",
  "target.targetMarker": "Firing FE has Overwatch marker",
  "between.sameWoodsUrban": "Foot FE in Dense Wood/Urban Firing at Tracked/Wheeled FE in same Dense Wood/Urban",
  "between.losThrough": "LoS** between Firing FE and target passes through Light Wood/ Light Urban / Smoke",
  "defender.footInTerrain": "Target is Foot FE in Light Wood/ Light Urban / Dense Wood/Urban",
  "defender.shellScrapes": "Target has Digging / Shell Scrape marker",
  "attacker.moved": "Firing FE taking Move-Fire Action - NATO / Russia",
};