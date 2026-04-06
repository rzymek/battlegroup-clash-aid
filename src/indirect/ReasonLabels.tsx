import {LabelsFor} from "../calculateDRM.tsx";
import {indirectDRM} from "./DRM.tsx";

export const reasonLabels: LabelsFor<typeof indirectDRM> = {
  'losSupport_other':'Friendly Recce / FST with LoS to target',
  'losSupport_uas':'UAS with LoS to target',
  'target_footInTerrain':'Target is Foot FE in Light Wood*/ Light Urban / Dense Wood*/Urban',
  'target_marker':'Value of played Target marker',
  'target_moved':'Target has Moved marker**',
  'target_shellScrapes':'Target has Digging / Shell Scrape marker',
  'target_tracked':'Target is Tracked FE Type',
};