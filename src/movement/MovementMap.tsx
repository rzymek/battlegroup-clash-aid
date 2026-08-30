import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import mapBSvgRaw from '../../resources/mapB.svg?raw';
import mapBJpg from '../../resources/maps/mapB.jpg';
import { buildTerrainGrid } from './terrainGrid.ts';
import { findPath, screenToSvg } from './findPath.ts';
import type { Point, PathResult, TerrainGrid } from './types.ts';

// Movement cost per inkscape layer label (MP per grid unit × √2 for diagonals).
// Adjust as rules dictate.
const LAYER_COSTS: Record<string, number> = {
  lightWood: 2,
  denseWood: 3,
  river: Infinity,
  road: 0.5,
};

// ── Parse SVG metadata once at module load ───────────────────────────────────

const INKSCAPE_NS = 'http://www.inkscape.org/namespaces/inkscape';

const vbMatch = mapBSvgRaw.match(/viewBox="([^"]+)"/);
const [vbX, vbY, vbW, vbH] = (vbMatch?.[1] ?? '0 0 1000 1000').split(/[\s,]+/).map(Number);
const VIEW_BOX = `${vbX} ${vbY} ${vbW} ${vbH}`;

interface RenderablePath { id: string; d: string; style: Record<string, string>; transform: string }
interface RenderableLayer { label: string; paths: RenderablePath[] }

const TERRAIN_LAYERS: RenderableLayer[] = (() => {
  const doc = new DOMParser().parseFromString(mapBSvgRaw, 'image/svg+xml');
  const layers: RenderableLayer[] = [];
  for (const g of doc.querySelectorAll('g')) {
    if (g.getAttributeNS(INKSCAPE_NS, 'groupmode') !== 'layer') continue;
    const label = g.getAttributeNS(INKSCAPE_NS, 'label') ?? g.id;
    if (!(label in LAYER_COSTS)) continue; // skip non-terrain layers (e.g. the image layer)
    const paths: RenderablePath[] = [];
    for (const p of g.querySelectorAll('path')) {
      paths.push({
        id: p.id,
        d: p.getAttribute('d') ?? '',
        style: parseCss(p.getAttribute('style') ?? ''),
        transform: p.getAttribute('transform') ?? '',
      });
    }
    if (paths.length > 0) layers.push({ label, paths });
  }
  return layers;
})();

// ── Lazy terrain grid + grid image (built once on first use) ─────────────────

let cachedGrid: TerrainGrid | null = null;
function getGrid(): TerrainGrid {
  if (!cachedGrid) cachedGrid = buildTerrainGrid(mapBSvgRaw, LAYER_COSTS);
  return cachedGrid;
}

// Colors per cost level, matched to SVG terrain fills.
const COST_COLORS: Record<number, [r: number, g: number, b: number, a: number]> = {
  0.5: [220, 180, 60, 200], // road — yellow
  2: [0, 187, 15, 140],     // lightWood — bright green
  3: [0, 69, 6, 180],       // denseWood — dark green
  [Infinity]: [30, 80, 220, 200], // river — blue, impassable
};

let cachedGridDataUrl: string | null = null;
function getGridDataUrl(): string {
  if (cachedGridDataUrl) return cachedGridDataUrl;
  const grid = getGrid();
  const canvas = document.createElement('canvas');
  canvas.width = grid.cols;
  canvas.height = grid.rows;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(grid.cols, grid.rows);
  for (let i = 0; i < grid.costs.length; i++) {
    const color = COST_COLORS[grid.costs[i]];
    if (color) {
      img.data[i * 4 + 0] = color[0];
      img.data[i * 4 + 1] = color[1];
      img.data[i * 4 + 2] = color[2];
      img.data[i * 4 + 3] = color[3];
    }
  }
  ctx.putImageData(img, 0, 0);
  cachedGridDataUrl = canvas.toDataURL();
  return cachedGridDataUrl;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MovementMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [startPt, setStartPt] = useState<Point | null>(null);
  const [endPt, setEndPt] = useState<Point | null>(null);
  const [result, setResult] = useState<PathResult | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [gridDataUrl, setGridDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (showGrid && !gridDataUrl) setGridDataUrl(getGridDataUrl());
  }, [showGrid, gridDataUrl]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!svgRef.current) return;
    const pt = screenToSvg({ x: e.clientX, y: e.clientY }, svgRef.current);

    if (!startPt || endPt) {
      setStartPt(pt);
      setEndPt(null);
      setResult(null);
    } else {
      setEndPt(pt);
      setResult(findPath(startPt, pt, getGrid()));
    }
  }, [startPt, endPt]);

  const reset = useCallback(() => {
    setStartPt(null);
    setEndPt(null);
    setResult(null);
  }, []);

  const status = !startPt
    ? 'Click on the map to set the start point'
    : !endPt
      ? 'Click to set the end point'
      : result
        ? `Cost: ${result.totalCost.toFixed(1)} MP`
        : 'No path found';

  const pathPoints = result?.points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0 6px' }}>
        <button onClick={reset} disabled={!startPt}>Reset</button>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: '0.9em', cursor: 'pointer' }}>
          <input type="checkbox" checked={showGrid} onChange={e => setShowGrid((e.target as HTMLInputElement).checked)} />
          Show grid
        </label>
        <span style={{ fontSize: '0.9em', color: '#444' }}>{status}</span>
      </div>

      <div style={{ position: 'relative' }}>
        <img
          src={mapBJpg}
          alt="Map B"
          draggable={false}
          style={{ width: '100%', display: 'block', userSelect: 'none', visibility:'hidden' }}
        />
        <svg
          ref={svgRef}
          viewBox={VIEW_BOX}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'crosshair' }}
          onClick={handleClick}
        >
          {/* Terrain overlays (SVG bezier polygons) */}
          {!showGrid && TERRAIN_LAYERS.map(layer =>
            layer.paths.map(p => (
              <path
                key={p.id}
                d={p.d}
                transform={p.transform}
                style={p.style as preact.JSX.CSSProperties}
              />
            ))
          )}

          {/* Rasterised cost grid */}
          {showGrid && gridDataUrl && (
            <image
              href={gridDataUrl}
              x={vbX} y={vbY}
              width={vbW} height={vbH}
              imageRendering="pixelated"
              preserveAspectRatio="none"
            />
          )}

          {/* Path */}
          {pathPoints && (
            <polyline
              points={pathPoints}
              fill="none"
              stroke="rgba(220,50,50,0.85)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Start marker */}
          {startPt && <Marker pt={startPt} color="#1565c0" label="S" />}

          {/* End marker */}
          {endPt && <Marker pt={endPt} color="#b71c1c" label="E" />}
        </svg>
      </div>
    </div>
  );
}

function Marker({ pt, color, label }: { pt: Point; color: string; label: string }) {
  return (
    <g>
      <circle cx={pt.x} cy={pt.y} r={22} fill={color} opacity={0.85} />
      <text
        x={pt.x} y={pt.y}
        dominantBaseline="central"
        textAnchor="middle"
        fill="white"
        fontSize={26}
        fontWeight="bold"
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {label}
      </text>
    </g>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseCss(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const decl of css.split(';')) {
    const colon = decl.indexOf(':');
    if (colon < 0) continue;
    const prop = decl.slice(0, colon).trim();
    const value = decl.slice(colon + 1).trim();
    if (!prop || !value) continue;
    out[prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = value;
  }
  return out;
}
