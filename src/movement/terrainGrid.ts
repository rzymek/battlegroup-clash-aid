import type { Point, TerrainLayer, TerrainGrid, ViewBox } from './types.ts';
import { flattenSvgPath } from './parseSvgPath.ts';

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
  for (const polygon of layer.polygons) {
    // Horizontal scanlines: correct for wide polygons and thin vertical/diagonal features.
    for (let r = 0; r < rows; r++) {
      const y = viewBox.y + (r + 0.5) * cellH;
      const xs = xIntersections(polygon, y);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const c0 = Math.max(0, Math.floor((xs[i] - viewBox.x) / cellW));
        const c1 = Math.min(cols - 1, Math.floor((xs[i + 1] - viewBox.x) / cellW));
        for (let c = c0; c <= c1; c++) costs[r * cols + c] = merge(costs[r * cols + c], layer.cost);
      }
    }
    // Vertical scanlines: catches thin nearly-horizontal features (roads running left/right).
    for (let c = 0; c < cols; c++) {
      const x = viewBox.x + (c + 0.5) * cellW;
      const ys = yIntersections(polygon, x);
      for (let i = 0; i + 1 < ys.length; i += 2) {
        const r0 = Math.max(0, Math.floor((ys[i] - viewBox.y) / cellH));
        const r1 = Math.min(rows - 1, Math.floor((ys[i + 1] - viewBox.y) / cellH));
        for (let r = r0; r <= r1; r++) costs[r * cols + c] = merge(costs[r * cols + c], layer.cost);
      }
    }
  }
}

/** X-coordinates where polygon edges cross the horizontal line at y (sorted ascending). */
function xIntersections(polygon: Point[], y: number): number[] {
  const xs: number[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const p0 = polygon[i];
    const p1 = polygon[(i + 1) % polygon.length];
    if ((p0.y < y) !== (p1.y < y)) {
      xs.push(p0.x + (y - p0.y) / (p1.y - p0.y) * (p1.x - p0.x));
    }
  }
  return xs.sort((a, b) => a - b);
}

/** Y-coordinates where polygon edges cross the vertical line at x (sorted ascending). */
function yIntersections(polygon: Point[], x: number): number[] {
  const ys: number[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const p0 = polygon[i];
    const p1 = polygon[(i + 1) % polygon.length];
    if ((p0.x < x) !== (p1.x < x)) {
      ys.push(p0.y + (x - p0.x) / (p1.x - p0.x) * (p1.y - p0.y));
    }
  }
  return ys.sort((a, b) => a - b);
}

function parseTranslate(transform: string | null): { tx: number; ty: number } {
  if (!transform) return { tx: 0, ty: 0 };
  const m = transform.match(/translate\(\s*([-\d.e+]+)[\s,]+([-\d.e+]+)\s*\)/);
  return m ? { tx: parseFloat(m[1]), ty: parseFloat(m[2]) } : { tx: 0, ty: 0 };
}
