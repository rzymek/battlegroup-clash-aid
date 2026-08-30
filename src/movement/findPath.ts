import type { Point, TerrainGrid, PathResult } from './types.ts';
import { cellCenter } from './terrainGrid.ts';

/**
 * Find the minimum movement-cost path between two points on a pre-built terrain grid.
 *
 * Points must be in SVG viewBox coordinate space. Use `screenToSvg` to convert mouse
 * click coordinates if needed.
 *
 * Returns null if no path exists (e.g. start/end is impassable terrain).
 */
export function findPath(
  start: Point,
  end: Point,
  grid: TerrainGrid,
): PathResult | null {
  const { costs, rows, cols, viewBox } = grid;

  const svgToCell = (pt: Point) => ({
    row: Math.max(0, Math.min(rows - 1, Math.floor((pt.y - viewBox.y) / viewBox.height * rows))),
    col: Math.max(0, Math.min(cols - 1, Math.floor((pt.x - viewBox.x) / viewBox.width * cols))),
  });

  const { row: sr, col: sc } = svgToCell(start);
  const { row: er, col: ec } = svgToCell(end);

  const cells = aStar(sr, sc, er, ec, costs, rows, cols);
  if (!cells) return null;

  const points = cells.map(({ row, col }) => cellCenter(row, col, viewBox, rows, cols));

  let totalCost = 0;
  for (let i = 1; i < cells.length; i++) {
    const dr = cells[i].row - cells[i - 1].row;
    const dc = cells[i].col - cells[i - 1].col;
    const dist = Math.sqrt(dr * dr + dc * dc);
    totalCost += dist * costs[cells[i].row * cols + cells[i].col];
  }

  return { points, totalCost };
}

/**
 * Convert a screen pixel coordinate (e.g. from a mouse event) to SVG viewBox units.
 */
export function screenToSvg(screenPoint: Point, svgElement: SVGSVGElement): Point {
  const rect = svgElement.getBoundingClientRect();
  const vb = svgElement.viewBox.baseVal;
  return {
    x: vb.x + ((screenPoint.x - rect.left) / rect.width) * vb.width,
    y: vb.y + ((screenPoint.y - rect.top) / rect.height) * vb.height,
  };
}

// ── A* ──────────────────────────────────────────────────────────────────────

const DIRS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
] as const;
const DIR_DIST = [Math.SQRT2, 1, Math.SQRT2, 1, 1, Math.SQRT2, 1, Math.SQRT2];

function aStar(
  sr: number, sc: number,
  er: number, ec: number,
  costs: Float32Array,
  rows: number, cols: number,
): { row: number; col: number }[] | null {
  const n = rows * cols;
  const idx = (r: number, c: number) => r * cols + c;

  const gScore = new Float32Array(n).fill(Infinity);
  const cameFrom = new Int32Array(n).fill(-1);
  const closed = new Uint8Array(n);

  const startIdx = idx(sr, sc);
  const endIdx = idx(er, ec);

  gScore[startIdx] = 0;
  const pq = new MinHeap();
  pq.push(startIdx, heuristic(sr, sc, er, ec));

  while (pq.size > 0) {
    const curIdx = pq.pop();
    if (closed[curIdx]) continue;
    closed[curIdx] = 1;

    if (curIdx === endIdx) return reconstruct(cameFrom, curIdx, cols);

    const cr = Math.floor(curIdx / cols);
    const cc = curIdx % cols;

    for (let d = 0; d < DIRS.length; d++) {
      const nr = cr + DIRS[d][0];
      const nc = cc + DIRS[d][1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

      const ni = idx(nr, nc);
      if (closed[ni]) continue;

      const terrainCost = costs[ni];
      if (!isFinite(terrainCost)) continue;

      const tentativeG = gScore[curIdx] + DIR_DIST[d] * terrainCost;
      if (tentativeG < gScore[ni]) {
        gScore[ni] = tentativeG;
        cameFrom[ni] = curIdx;
        pq.push(ni, tentativeG + heuristic(nr, nc, er, ec));
      }
    }
  }

  return null;
}

function heuristic(r1: number, c1: number, r2: number, c2: number): number {
  return Math.sqrt((r2 - r1) ** 2 + (c2 - c1) ** 2);
}

function reconstruct(
  cameFrom: Int32Array,
  endIdx: number,
  cols: number,
): { row: number; col: number }[] {
  const path: { row: number; col: number }[] = [];
  for (let cur = endIdx; cur !== -1; cur = cameFrom[cur]) {
    path.push({ row: Math.floor(cur / cols), col: cur % cols });
  }
  return path.reverse();
}

/**
 * Dijkstra flood-fill: returns a Float32Array (size rows×cols) with the minimum
 * movement cost to reach each cell from `start`. Cells costing more than `maxCost`
 * (or impassable) are left at Infinity.
 */
export function findReachableCells(
  start: Point,
  grid: TerrainGrid,
  maxCost: number,
): Float32Array {
  const { costs, rows, cols, viewBox } = grid;
  const sr = Math.max(0, Math.min(rows - 1, Math.floor((start.y - viewBox.y) / viewBox.height * rows)));
  const sc = Math.max(0, Math.min(cols - 1, Math.floor((start.x - viewBox.x) / viewBox.width * cols)));

  const dist = new Float32Array(rows * cols).fill(Infinity);
  const startIdx = sr * cols + sc;
  dist[startIdx] = 0;

  const pq = new MinHeap();
  pq.push(startIdx, 0);

  while (pq.size > 0) {
    const curIdx = pq.pop();
    const cr = Math.floor(curIdx / cols);
    const cc = curIdx % cols;
    const curDist = dist[curIdx];

    for (let d = 0; d < DIRS.length; d++) {
      const nr = cr + DIRS[d][0];
      const nc = cc + DIRS[d][1];
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;

      const ni = nr * cols + nc;
      const terrainCost = costs[ni];
      if (!isFinite(terrainCost)) continue;

      const newDist = curDist + DIR_DIST[d] * terrainCost;
      if (newDist <= maxCost && newDist < dist[ni]) {
        dist[ni] = newDist;
        pq.push(ni, newDist);
      }
    }
  }

  return dist;
}

class MinHeap {
  private heap: [number, number][] = []; // [fScore, nodeIdx]

  get size() { return this.heap.length; }

  push(idx: number, f: number) {
    this.heap.push([f, idx]);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): number {
    const top = this.heap[0][1];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(i: number) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.heap[i][0] < this.heap[p][0]) {
        [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
        i = p;
      } else break;
    }
  }

  private sinkDown(i: number) {
    const n = this.heap.length;
    for (;;) {
      let min = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.heap[l][0] < this.heap[min][0]) min = l;
      if (r < n && this.heap[r][0] < this.heap[min][0]) min = r;
      if (min === i) break;
      [this.heap[i], this.heap[min]] = [this.heap[min], this.heap[i]];
      i = min;
    }
  }
}
