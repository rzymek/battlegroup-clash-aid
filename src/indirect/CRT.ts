import {CRT, crtObj} from '../calculateResult.tsx';
import {IndirectFireType} from "../state/state.tsx";

/* @formatter:off */
export const rawCrt = [
  ['dice', 'FPV', 'Mortar', '152/155mm'],
  ['11+',    2,         2,          3  ],
  ['10',     1,         2,          2  ],
  [ '9',     1,         1,          2  ],
  [ '8',     1,         1,          2  ],
  [ '7',    '-',        1,          1  ],
  [ '6',    '-',        1,          1  ],
  [ '5',    '-',       '-',         1  ],
  [ '4',    '-',       '-',         1  ],
  [ '3',    '-',       '-',        '-' ],
  [ '2',    '-',       '-',        '-' ]
] as const;
/* @formatter:on */

export const indirectCRT:CRT<IndirectFireType> = crtObj(rawCrt);