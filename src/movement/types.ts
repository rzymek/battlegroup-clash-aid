export interface Point {
  x: number;
  y: number;
}

export interface ViewBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TerrainLayer {
  label: string;
  cost: number;
  /** Closed paths (SVG Z present): rasterised with scanline fill + DDA edges. */
  polygons: Point[][];
  /** Open paths (no SVG Z): rasterised with DDA edges only — avoids false fills from the implied closing segment. */
  polylines: Point[][];
}

/** Pre-built raster grid of movement costs. Build once, reuse for many `findPath` calls. */
export interface TerrainGrid {
  costs: Float32Array;
  terrainIndex: Uint8Array; // index into terrainNames; 0 = open/default
  terrainNames: string[];   // terrain label for each index value
  rows: number;
  cols: number;
  viewBox: ViewBox;
  /** Metres per viewBox coordinate unit (svgWidthPx / viewBoxWidth). */
  metersPerUnit: number;
}

export interface PathResult {
  /** Waypoints in SVG viewBox coordinate units. */
  points: Point[];
  totalCost: number;
}
