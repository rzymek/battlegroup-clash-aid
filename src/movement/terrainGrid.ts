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
  const cellW = viewBox.width / gridCols;
  const cellH = viewBox.height / gridRows;

  // Process layers in SVG document order: last layer always wins, matching SVG rendering.
  for (const layer of layers) {
    applyLayer(layer, costs, gridRows, gridCols, viewBox, cellW, cellH,
      (_, cost) => cost);
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

type Merge = (existing: number, cost: number) => number;

function applyLayer(
  layer: TerrainLayer,
  costs: Float32Array,
  rows: number, cols: number,
  viewBox: ViewBox, cellW: number, cellH: number,
  merge: Merge,
) {
  // Point-in-polygon for filled zones
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const pt = cellCenter(r, c, viewBox, rows, cols);
      for (const polygon of layer.polygons) {
        if (pointInPolygon(pt, polygon)) {
          costs[r * cols + c] = merge(costs[r * cols + c], layer.cost);
          break;
        }
      }
    }
  }

  // Edge rasterization for thin features narrower than one cell
  for (const polygon of layer.polygons) {
    for (let i = 0; i < polygon.length; i++) {
      rasterizeSegment(
        polygon[i], polygon[(i + 1) % polygon.length],
        viewBox, cellW, cellH, rows, cols, costs, layer.cost, merge,
      );
    }
  }
}

/** Samples a segment at ½-cell intervals so no traversed cell is missed. */
function rasterizeSegment(
  p0: Point, p1: Point,
  vb: ViewBox, cellW: number, cellH: number,
  rows: number, cols: number,
  costs: Float32Array,
  cost: number,
  merge: Merge,
) {
  const gc0 = (p0.x - vb.x) / cellW;
  const gr0 = (p0.y - vb.y) / cellH;
  const gc1 = (p1.x - vb.x) / cellW;
  const gr1 = (p1.y - vb.y) / cellH;

  const n = Math.max(1, Math.ceil(Math.sqrt((gc1 - gc0) ** 2 + (gr1 - gr0) ** 2) * 2));
  for (let j = 0; j <= n; j++) {
    const t = j / n;
    const c = Math.floor(gc0 + t * (gc1 - gc0));
    const r = Math.floor(gr0 + t * (gr1 - gr0));
    if (c >= 0 && c < cols && r >= 0 && r < rows) {
      costs[r * cols + c] = merge(costs[r * cols + c], cost);
    }
  }
}

function parseTranslate(transform: string | null): { tx: number; ty: number } {
  if (!transform) return { tx: 0, ty: 0 };
  const m = transform.match(/translate\(\s*([-\d.e+]+)[\s,]+([-\d.e+]+)\s*\)/);
  return m ? { tx: parseFloat(m[1]), ty: parseFloat(m[2]) } : { tx: 0, ty: 0 };
}
