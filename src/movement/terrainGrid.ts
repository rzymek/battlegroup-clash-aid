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
  const { layers, viewBox, metersPerUnit } = parseTerrainLayers(svgContent, layerCosts, defaultCost);

  const costs = new Float32Array(gridRows * gridCols).fill(defaultCost);
  const terrainIndex = new Uint8Array(gridRows * gridCols); // 0 = open
  const terrainNames = ['open', ...layers.map(l => l.label)];
  const cellW = viewBox.width / gridCols;
  const cellH = viewBox.height / gridRows;

  // Process layers in SVG document order: last layer always wins, matching SVG rendering.
  for (let li = 0; li < layers.length; li++) {
    applyLayer(layers[li], li + 1, costs, terrainIndex, gridRows, gridCols, viewBox, cellW, cellH,
      (_, cost) => cost);
  }

  return { costs, terrainIndex, terrainNames, rows: gridRows, cols: gridCols, viewBox, metersPerUnit };
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
): { layers: TerrainLayer[]; viewBox: ViewBox; metersPerUnit: number } {
  const doc = new DOMParser().parseFromString(svgContent, 'image/svg+xml');

  const svgEl = doc.querySelector('svg');
  const vbNums = (svgEl?.getAttribute('viewBox') ?? '0 0 1000 1000')
    .trim().split(/[\s,]+/).map(Number);
  const viewBox: ViewBox = { x: vbNums[0], y: vbNums[1], width: vbNums[2], height: vbNums[3] };

  // SVG width in user-units (px) where 1 px = 1 m, viewBox uses a different scale.
  const svgPxWidth = parseFloat(svgEl?.getAttribute('width') ?? '0');
  const metersPerUnit = svgPxWidth > 0 ? svgPxWidth / viewBox.width : 1;

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

  return { layers, viewBox, metersPerUnit };
}

type Merge = (existing: number, cost: number) => number;

function applyLayer(
  layer: TerrainLayer,
  layerIndex: number,
  costs: Float32Array,
  terrainIndex: Uint8Array,
  rows: number, cols: number,
  viewBox: ViewBox, cellW: number, cellH: number,
  merge: Merge,
) {
  for (const polygon of layer.polygons) {
    // Horizontal scanlines: fills wide polygons and thin vertical/diagonal features.
    for (let r = 0; r < rows; r++) {
      const y = viewBox.y + (r + 0.5) * cellH;
      const xs = xIntersections(polygon, y);
      for (let i = 0; i + 1 < xs.length; i += 2) {
        const c0 = Math.max(0, Math.floor((xs[i] - viewBox.x) / cellW));
        const c1 = Math.min(cols - 1, Math.floor((xs[i + 1] - viewBox.x) / cellW));
        for (let c = c0; c <= c1; c++) {
          const idx = r * cols + c;
          costs[idx] = merge(costs[idx], layer.cost);
          terrainIndex[idx] = layerIndex;
        }
      }
    }
    // Vertical scanlines: catches thin nearly-horizontal features.
    for (let c = 0; c < cols; c++) {
      const x = viewBox.x + (c + 0.5) * cellW;
      const ys = yIntersections(polygon, x);
      for (let i = 0; i + 1 < ys.length; i += 2) {
        const r0 = Math.max(0, Math.floor((ys[i] - viewBox.y) / cellH));
        const r1 = Math.min(rows - 1, Math.floor((ys[i + 1] - viewBox.y) / cellH));
        for (let r = r0; r <= r1; r++) {
          const idx = r * cols + c;
          costs[idx] = merge(costs[idx], layer.cost);
          terrainIndex[idx] = layerIndex;
        }
      }
    }
    // DDA edge traversal: guarantees every cell a polygon edge touches is marked,
    // catching thin diagonal segments that axis-aligned scanlines miss.
    for (let i = 0; i < polygon.length; i++) {
      ddaEdge(
        polygon[i], polygon[(i + 1) % polygon.length],
        viewBox, cellW, cellH, rows, cols,
        costs, layer.cost, merge, terrainIndex, layerIndex,
      );
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

/**
 * DDA grid traversal: visits every cell the segment p0→p1 passes through.
 * Step count uses Chebyshev distance + 1, which guarantees the per-axis
 * step is always < 1 cell so no cell can be skipped.
 */
function ddaEdge(
  p0: Point, p1: Point,
  vb: ViewBox, cellW: number, cellH: number,
  rows: number, cols: number,
  costs: Float32Array, cost: number, merge: Merge,
  terrainIndex: Uint8Array, layerIndex: number,
) {
  const gc0 = (p0.x - vb.x) / cellW;
  const gr0 = (p0.y - vb.y) / cellH;
  const gc1 = (p1.x - vb.x) / cellW;
  const gr1 = (p1.y - vb.y) / cellH;
  const dc = gc1 - gc0;
  const dr = gr1 - gr0;
  const n = Math.ceil(Math.max(Math.abs(dc), Math.abs(dr))) + 1;
  for (let j = 0; j <= n; j++) {
    const t = j / n;
    const c = Math.floor(gc0 + t * dc);
    const r = Math.floor(gr0 + t * dr);
    if (c >= 0 && c < cols && r >= 0 && r < rows) {
      const idx = r * cols + c;
      costs[idx] = merge(costs[idx], cost);
      terrainIndex[idx] = layerIndex;
    }
  }
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
