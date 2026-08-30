import type { TerrainGrid } from './types.ts';

// Colors keyed by inkscape layer label (terrain name, not cost value).
const TERRAIN_COLORS: Record<string, [r: number, g: number, b: number, a: number]> = {
  'road':          [255, 220,  50, 220],  // minor road — yellow
  'major road':    [255, 140,   0, 220],  // major road — orange
  'lightWood':     [ 80, 160,  60, 180],  // light wood — green
  'denseWood':     [ 20,  80,  20, 210],  // dense wood — dark green
  'light urban':   [200, 140, 100, 180],  // light urban — tan
  'urban':         [140,  80,  60, 220],  // urban — brown
  'shallow hill':  [180, 160, 120, 180],  // shallow hill — khaki
  'steep hill':    [140, 110,  70, 210],  // steep hill — dark khaki
  'river':         [ 30,  80, 220, 200],  // river — blue
};

function buildDataUrl(cols: number, rows: number, fill: (img: ImageData) => void): string {
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(cols, rows);
  fill(img);
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
}

// Cache per grid instance so switching FE type (different grid object) gets a fresh render.
const gridDataUrlCache = new WeakMap<TerrainGrid, string>();

export function getGridDataUrl(grid: TerrainGrid): string {
  const cached = gridDataUrlCache.get(grid);
  if (cached) return cached;
  const url = buildDataUrl(grid.cols, grid.rows, img => {
    for (let i = 0; i < grid.terrainIndex.length; i++) {
      const name = grid.terrainNames[grid.terrainIndex[i]];
      const color = TERRAIN_COLORS[name];
      if (color) {
        img.data[i * 4]     = color[0];
        img.data[i * 4 + 1] = color[1];
        img.data[i * 4 + 2] = color[2];
        img.data[i * 4 + 3] = color[3];
      }
    }
  });
  gridDataUrlCache.set(grid, url);
  return url;
}

export function buildRangeDataUrl(dist: Float32Array, grid: TerrainGrid, movementRange: number): string {
  return buildDataUrl(grid.cols, grid.rows, img => {
    for (let i = 0; i < dist.length; i++) {
      if (dist[i] <= movementRange) {
        const ratio = dist[i] / movementRange;
        img.data[i * 4]     = Math.round(ratio * 200);
        img.data[i * 4 + 1] = 180;
        img.data[i * 4 + 2] = 0;
        img.data[i * 4 + 3] = 130;
      }
    }
  });
}
