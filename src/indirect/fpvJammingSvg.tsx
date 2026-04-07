import {D6} from "../state/state.tsx";
import {ComponentType} from "preact";
import FpvJam1 from '../svg/fpv-jam1.svg?react'
import FpvJam2 from '../svg/fpv-jam2.svg?react'
import FpvJam3 from '../svg/fpv-jam3.svg?react'
import FpvJam4 from '../svg/fpv-jam4.svg?react'
import FpvJam5 from '../svg/fpv-jam5.svg?react'
import FpvJam6 from '../svg/fpv-jam6.svg?react'

export const fpvJammingSvg:Record<D6,ComponentType>= {
  1: FpvJam1,
  2: FpvJam2,
  3: FpvJam3,
  4: FpvJam4,
  5: FpvJam5,
  6: FpvJam6,
}
