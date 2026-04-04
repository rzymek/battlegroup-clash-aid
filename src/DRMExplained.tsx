import {calculateDRM} from "./calculateDRM.tsx";
import {state} from "./state/state.tsx";

export const reasonLabels: Record<string, string> = {
  "defender.targetMarker": "Value of played Target marker",
  "attacker.TQ": "TQ for Firing FE*",
  "attacker.firetype": '',
  "attacker.overwatch": "Firing FE has Overwatch marker",
  "between.sameWoodsUrban": "Foot FE in Dense Wood/Urban Firing at Tracked/Wheeled FE in same Dense Wood/Urban",
  "between.losThrough": "LoS** between Firing FE and target passes through Light Wood/ Light Urban / Smoke",
  "defender.footInTerrain": "Target is Foot FE in Light Wood/ Light Urban / Dense Wood/Urban",
  "defender.shellScrapes": "Target has Digging / Shell Scrape marker",
  "attacker.moved": "Firing FE taking Move-Fire Action - NATO / Russia",
};

export function DRMExplained() {
  const drm = calculateDRM(state.direct);
  if(drm.reasons.length === 0) return null;
  return <table>
    <thead>
    <tr>
      <th>Reason</th>
      <th>DRM</th>
    </tr>
    </thead>
    <tbody>
    {drm.reasons.map((it, idx) => <tr key={idx}>
      <td>{reasonLabels[it.reason] ?? it.reason}</td>
      <th>{it.modifier}</th>
    </tr>)}
    </tbody>
  </table>

}