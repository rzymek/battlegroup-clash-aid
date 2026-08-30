import type { Point, TerrainLayer, TerrainGrid, ViewBox } from './types.ts';
import { flattenSvgPath } from './parseSvgPath.ts';
import { pointInPolygon } from './pointInPolygon.ts';

const INKSCAPE_NS = 'http://www.inkscape.org/namespaces/inkscape';

/**
 * Parse an SVG file and rasterize its terrain layers into a cost grid.
 *
 * @param svgContent  Raw SVG file content as a string.
 * @param layerCosts  Map from inkscape layer label → movement cost. Use Infinity for impassable.
 * @param defaultCost Cost for cells not covered by any polygon (open ground). Default: 1.
 * @param gridCols    Grid columns. Higher = more precision, slower build. Default: 200.
 * @param gridRows    Grid rows. Default: 150.
 */
export function buildTerrainGrid(
  svgContent: string,
  layerCosts: Record<string, number>,
  defaultCost = 1,
  gridCols = 200,
  gridRows = 150,
): TerrainGrid {
  const { layers, viewBox } = parseTerrainLayers(svgContent, layerCosts, defaultCost);

  const costs = new Float32Array(gridRows * gridCols).fill(defaultCost);

  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridCols; c++) {
      const pt = cellCenter(r, c, viewBox, gridRows, gridCols);
      let maxCost = defaultCost;
      for (const layer of layers) {
        for (const polygon of layer.polygons) {
          if (pointInPolygon(pt, polygon)) {
            maxCost = Math.max(maxCost, layer.cost);
          }
        }
      }
      costs[r * gridCols + c] = maxCost;
    }
  }

  return { costs, rows: gridRows, cols: gridCols, viewBox };
}

export function cellCenter(
  row: number, col: number,
  viewBox: ViewBox,
  rows: number, cols: number,
): Point {
  return {
    x: viewBox.x + (col + 0.5) / cols * viewBox.width,
    y: viewBox.y + (row + 0.5) / rows * viewBox.height,
  };
}

function parseTerrainLayers(
  svgContent: string,
  layerCosts: Record<string, number>,
  defaultCost: number,
): { layers: TerrainLayer[]; viewBox: ViewBox } {
  const doc = new DOMParser().parseFromString(svgContent, 'image/svg+xml');

  const svgEl = doc.querySelector('svg');
  const vbNums = (svgEl?.getAttribute('viewBox') ?? '0 0 1000 1000')
    .trim().split(/[\s,]+/).map(Number);
  const viewBox: ViewBox = { x: vbNums[0], y: vbNums[1], width: vbNums[2], height: vbNums[3] };

  const layers: TerrainLayer[] = [];

  for (const group of doc.querySelectorAll('g')) {
    if (group.getAttributeNS(INKSCAPE_NS, 'groupmode') !== 'layer') continue;

    const label = group.getAttributeNS(INKSCAPE_NS, 'label') ?? group.id;
    const cost = layerCosts[label] ?? defaultCost;

    const groupTranslate = parseTranslate(group.getAttribute('transform'));
    const polygons: Point[][] = [];

    for (const path of group.querySelectorAll('path')) {
      const d = path.getAttribute('d');
      if (!d) continue;
      const pathTranslate = parseTranslate(path.getAttribute('transform'));
      const tx = groupTranslate.tx + pathTranslate.tx;
      const ty = groupTranslate.ty + pathTranslate.ty;
      const pts = flattenSvgPath(d).map(p => ({ x: p.x + tx, y: p.y + ty }));
      if (pts.length >= 3) polygons.push(pts);
    }

    if (polygons.length > 0) layers.push({ label, cost, polygons });
  }

  return { layers, viewBox };
}

function parseTranslate(transform: string | null): { tx: number; ty: number } {
  if (!transform) return { tx: 0, ty: 0 };
  const m = transform.match(/translate\(\s*([-\d.e+]+)[\s,]+([-\d.e+]+)\s*\)/);
  return m ? { tx: parseFloat(m[1]), ty: parseFloat(m[2]) } : { tx: 0, ty: 0 };
}
