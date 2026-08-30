import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import mapBSvgRaw from '../../resources/mapB.svg?raw';
import { buildTerrainGrid } from './terrainGrid.ts';
import { findPath, findReachableCells, screenToSvg } from './findPath.ts';
import type { Point, PathResult, TerrainGrid } from './types.ts';

const MOVEMENT_RANGE = 20;

// Movement cost per inkscape layer label (MP per grid unit × √2 for diagonals).
// Adjust as rules dictate.
const LAYER_COSTS: Record<string, number> = {
  'light urban': 2,
  urban: 4,
  lightWood: 2,
  denseWood: 3,
  river: Infinity,
  'major road': 0.25,
  road: 0.5,
};

// ── Parse SVG metadata once at module load ───────────────────────────────────

const INKSCAPE_NS = 'http://www.inkscape.org/namespaces/inkscape';

const vbMatch = mapBSvgRaw.match(/viewBox="([^"]+)"/);
const [vbX, vbY, vbW, vbH] = (vbMatch?.[1] ?? '0 0 1000 1000').split(/[\s,]+/).map(Number);
const INITIAL_VB = { x: vbX, y: vbY, w: vbW, h: vbH };

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
        style: Object.fromEntries(
          Array.from(p.style).map(prop => [
            prop.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
            p.style.getPropertyValue(prop),
          ])
        ),
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
  0.25: [255, 140, 0, 220], // major road — orange
  0.5: [220, 180, 60, 200], // road — yellow
  2: [0, 187, 15, 140],     // lightWood / light urban — bright green
  3: [0, 69, 6, 180],       // denseWood — dark green
  4: [110, 90, 70, 200],    // urban — brown-gray
  [Infinity]: [30, 80, 220, 200], // river — blue, impassable
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

let cachedGridDataUrl: string | null = null;
function getGridDataUrl(): string {
  if (cachedGridDataUrl) return cachedGridDataUrl;
  const grid = getGrid();
  cachedGridDataUrl = buildDataUrl(grid.cols, grid.rows, img => {
    for (let i = 0; i < grid.costs.length; i++) {
      const color = COST_COLORS[grid.costs[i]];
      if (color) {
        img.data[i * 4] = color[0];
        img.data[i * 4 + 1] = color[1];
        img.data[i * 4 + 2] = color[2];
        img.data[i * 4 + 3] = color[3];
      }
    }
  });
  return cachedGridDataUrl;
}

function buildRangeDataUrl(dist: Float32Array, grid: TerrainGrid): string {
  return buildDataUrl(grid.cols, grid.rows, img => {
    for (let i = 0; i < dist.length; i++) {
      if (dist[i] <= MOVEMENT_RANGE) {
        const ratio = dist[i] / MOVEMENT_RANGE;
        img.data[i * 4] = Math.round(ratio * 200);
        img.data[i * 4 + 1] = 180;
        img.data[i * 4 + 2] = 0;
        img.data[i * 4 + 3] = 130;
      }
    }
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MovementMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [startPt, setStartPt] = useState<Point | null>(null);
  const [endPt, setEndPt] = useState<Point | null>(null);
  const [result, setResult] = useState<PathResult | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [rangeDataUrl, setRangeDataUrl] = useState<string | null>(null);
  const [vb, setVb] = useState(INITIAL_VB);
  const [isDragging, setIsDragging] = useState(false);

  // Keep a ref so window-level handlers always see current values without deps.
  const dragRef = useRef<{ cx: number; cy: number; snap: typeof INITIAL_VB } | null>(null);
  const movedRef = useRef(false);
  const clickHandlerRef = useRef<(e: MouseEvent) => void>(() => {});
  const rangeDistRef = useRef<Float32Array | null>(null);

  useEffect(() => {
    if (startPt && !endPt) {
      const grid = getGrid();
      const dist = findReachableCells(startPt, grid, MOVEMENT_RANGE);
      rangeDistRef.current = dist;
      setRangeDataUrl(buildRangeDataUrl(dist, grid));
    } else {
      rangeDistRef.current = null;
      setRangeDataUrl(null);
    }
  }, [startPt, endPt]);

  // Keep click logic up-to-date without stale closures in window handler.
  useEffect(() => {
    clickHandlerRef.current = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const pt = screenToSvg({ x: e.clientX, y: e.clientY }, svgRef.current);
      if (!startPt || endPt) {
        setStartPt(pt);
        setEndPt(null);
        setResult(null);
      } else {
        const grid = getGrid();
        const { rows, cols, viewBox } = grid;
        const row = Math.max(0, Math.min(rows - 1, Math.floor((pt.y - viewBox.y) / viewBox.height * rows)));
        const col = Math.max(0, Math.min(cols - 1, Math.floor((pt.x - viewBox.x) / viewBox.width * cols)));
        if (rangeDistRef.current && rangeDistRef.current[row * cols + col] > MOVEMENT_RANGE) {
          setStartPt(pt);
          setEndPt(null);
          setResult(null);
          return;
        }
        setEndPt(pt);
        setResult(findPath(startPt, pt, grid));
      }
    };
  }, [startPt, endPt]);

  // Wheel zoom centered on cursor.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      setVb(v => {
        const cx = v.x + (e.clientX - rect.left) / rect.width * v.w;
        const cy = v.y + (e.clientY - rect.top) / rect.height * v.h;
        return {
          x: cx + (v.x - cx) * factor,
          y: cy + (v.y - cy) * factor,
          w: v.w * factor,
          h: v.h * factor,
        };
      });
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, []);

  // Pan: track mouse on window so drag works outside the SVG bounds.
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.cx;
      const dy = e.clientY - dragRef.current.cy;
      if (!movedRef.current && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        movedRef.current = true;
        setIsDragging(true);
      }
      if (movedRef.current) {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const { snap } = dragRef.current;
        setVb({
          x: snap.x - dx * snap.w / rect.width,
          y: snap.y - dy * snap.h / rect.height,
          w: snap.w,
          h: snap.h,
        });
      }
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const wasMoved = movedRef.current;
      dragRef.current = null;
      movedRef.current = false;
      setIsDragging(false);
      if (!wasMoved) clickHandlerRef.current(e);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (e.button !== 0) return;
    dragRef.current = { cx: e.clientX, cy: e.clientY, snap: vb };
    movedRef.current = false;
  }, [vb]);

  const reset = () => {
    setStartPt(null);
    setEndPt(null);
    setResult(null);
    dragRef.current = null;
    movedRef.current = false;
    setIsDragging(false);
  };

  const status = !startPt
    ? 'Click on the map to set the start point'
    : !endPt
      ? `Click to set the end point (${MOVEMENT_RANGE} MP range shown)`
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

      <div style={{ position: 'relative', width: '100%', aspectRatio: `${vbW} / ${vbH}` }}>
        <svg
          ref={svgRef}
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'crosshair' }}
          onMouseDown={handleMouseDown}
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
          {showGrid && (
            <image
              href={getGridDataUrl()}
              x={vbX} y={vbY}
              width={vbW} height={vbH}
              imageRendering="pixelated"
              preserveAspectRatio="none"
            />
          )}

          {/* Movement range overlay */}
          {rangeDataUrl && (
            <image
              href={rangeDataUrl}
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

