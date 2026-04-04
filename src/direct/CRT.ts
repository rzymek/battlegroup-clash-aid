import {CRT, crtObj, } from "../calculateResult.tsx";
import {DirectFireType} from "../state/firetype.tsx";

/* @formatter:off */
export const rawCrt = [
  ['dice', '1', '2', '3', '4', 'RPG', 'NLAW', 'Stabber', 'Javelin'],
  ['11+',  1,   2,   2,   3,   1,     2,      2,         2       ],
  ['10',   1,   1,   2,   2,   1,     2,      2,         2       ],
  ['9',   'S',  1,   2,   2,  'S',    2,      2,         2       ],
  ['8',   'S',  1,   1,   2,  'S',    2,      1,         2       ],
  ['7',   'S', 'S',  1,   2,  'S',    1,      1,         2       ],
  ['6',   '-', 'S',  1,   1,  '-',    1,      1,         2       ],
  ['5',   '-', 'S', 'S',  1,  '-',    1,     'S',        1       ],
  ['4',   '-', '-', 'S',  1,  '-',   'S',    'S',        1       ],
  ['3',   '-', '-', 'S', 'S', '-',   'S',    '-',       'S'      ],
  ['2',   '-', '-', '-', 'S', '-',    '-',    '-',       'S'     ],
  ['1',   '-', '-', '-', '-', '-',    '-',    '-',       '-'     ],
] as const;
/* @formatter:on */

export const directCRT: CRT<DirectFireType> = crtObj(rawCrt);