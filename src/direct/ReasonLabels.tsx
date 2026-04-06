import {directDRM} from "./DRM.tsx";
import {LabelsFor} from "../calculateDRM.tsx";

export const reasonLabels: LabelsFor<typeof directDRM> = {
  'defender_targetMarker': 'Value of played Target marker',
  'attacker_TQ': 'TQ for Firing FE*',
  'attacker_overwatch': 'Firing FE has Overwatch marker',
  'between_sameWoodsUrban': 'Foot FE in Dense Wood/Urban Firing at Tracked/Wheeled FE in same Dense Wood/Urban',
  'between_losThrough': 'LoS** between Firing FE and target passes through Light Wood/ Light Urban / Smoke',
  'defender_footInTerrain': 'Target is Foot FE in Light Wood/ Light Urban / Dense Wood/Urban',
  'defender_shellScrapes': 'Target has Digging / Shell Scrape marker',
  'attacker_moved': 'Firing FE taking Move-Fire Action - NATO / Russia',
  'between_lessThen250m': '** Do not apply if Move-Fire within 250m',
  'attacker_suppression': '* Remember Suppression / Disruption reduce TQ',
};