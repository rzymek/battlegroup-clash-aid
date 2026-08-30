import {calculateDRM, DRMDef, DRMState, LabelsFor} from "./calculateDRM.tsx";
import {BoldifyValue} from "./BoldifyValue.tsx";

const values = {
  fst: 'FST',
  recce: 'Recce',
  shellScrapes: 'Shell Scrape',
  digging: 'Digging',
  lightWood: "Light Wood",
  denseWood: "Dense Wood",
  lightUrban: "Light Urban",
  urban: "Urban",
} as const;

export function DRMExplained<T extends { drm: DRMState }>(props: {
  state: T,
  drm: DRMDef<T>
  reasonLabels: LabelsFor<DRMDef<T>>
}) {
  const drm = calculateDRM(props.state, props.drm);
  if (drm.reasons.length === 0) return null;
  return <table>
    <thead>
    <tr>
      <th>Reason</th>
      <th>DRM</th>
    </tr>
    </thead>
    <tbody>
    {drm.reasons.map((it, idx) => {
      return <tr key={idx}>
        <td>
          <div><BoldifyValue value={props.state.drm[it.reason]} values={values}>
            {props.reasonLabels[it.reason] ?? it.reason}
          </BoldifyValue></div>
          <div>{it.note}</div>
        </td>
        <th>{it.modifier > 0 && '+'}{it.modifier}</th>
      </tr>;
    })}
    </tbody>
  </table>
}

