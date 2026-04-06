import {calculateDRM, DRMDef, DRMState, LabelsFor} from "./calculateDRM.tsx";

export function DRMExplained<T extends { drm: DRMState }>(props: {
  state: T,
  drm: DRMDef<T>
  reasonLabels: LabelsFor<DRMDef<T>>
}) {
  const drm = calculateDRM(props.state, props.drm);
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
      <td>{props.reasonLabels[it.reason] ?? it.reason}</td>
      <th>{it.modifier}</th>
    </tr>)}
    </tbody>
  </table>

}