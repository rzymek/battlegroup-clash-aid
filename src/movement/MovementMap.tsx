import { useState, useRef, useCallback, useEffect } from 'preact/hooks';
import mapBSvgRaw from '../../resources/mapB.svg?raw';
import mapBJpg from '../../resources/maps/mapB.jpg';
import { buildTerrainGrid } from './terrainGrid.ts';
import { findPath, findReachableCells, screenToSvg } from './findPath.ts';
import type { Point, PathResult, TerrainGrid } from './types.ts';
import { getGridDataUrl, buildRangeDataUrl } from './gridRendering.ts';

const MOVEMENT_RANGE = 20;

type FeType = 'foot' | 'wheeled' | 'tracked';
type GridKey = FeType | 'wheeled-column' | 'tracked-column';

// Costs normalised so Open terrain = 1.0 for each type.
// Formula: open_allowance / terrain_allowance (Player Aid 2 Movement Table).
// Dense Wood is No-Go for Wheeled/Tracked except via road (not modelled here).
const LAYER_COSTS: Record<GridKey, Record<string, number>> = {
  foot: {
    // Open baseline: 750 m
    road: 1.0,            // Minor Road: 750 m
    'major road': 0.75,   // 1 000 m
    lightWood: 1.5,       // 500 m
    denseWood: 3.0,       // 250 m
    'light urban': 1.0,   // 750 m
    urban: 1.0,           // 750 m
    'shallow hill': 1.5,  // 500 m
    'steep hill': 3.0,    // 250 m
    river: Infinity,
  },
  wheeled: {
    // Open baseline: 1 500 m
    road: 0.75,           // Minor Road: 2 000 m
    'major road': 0.75,   // 2 000 m
    lightWood: 1.5,       // 1 000 m
    denseWood: Infinity,  // No-Go
    'light urban': 0.75,  // 2 000 m
    urban: 1.5,           // 1 000 m
    'shallow hill': 3.0,  // 500 m
    'steep hill': 6.0,    // 250 m
    river: Infinity,
  },
  tracked: {
    // Open baseline: 2 000 m
    road: 1.0,            // Minor Road: 2 000 m
    'major road': 1.0,    // 2 000 m
    lightWood: 2.0,       // 1 000 m
    denseWood: Infinity,  // No-Go
    'light urban': 1.0,   // 2 000 m
    urban: 2.0,           // 1 000 m
    'shallow hill': 4.0,  // 500 m
    'steep hill': 8.0,    // 250 m
    river: Infinity,
  },
  // Column: Major Road only, 3 000 m allowance. defaultCost=Infinity blocks all off-road.
  'wheeled-column': {
    'major road': 0.5,    // 3 000 m (open baseline 1 500 m → 1500/3000)
  },
  'tracked-column': {
    'major road': 2 / 3,  // 3 000 m (open baseline 2 000 m → 2000/3000)
  },
};

const vbMatch = mapBSvgRaw.match(/viewBox="([^"]+)"/);
const [vbX, vbY, vbW, vbH] = (vbMatch?.[1] ?? '0 0 1000 1000').split(/[\s,]+/).map(Number);
const INITIAL_VB = { x: vbX, y: vbY, w: vbW, h: vbH };

// ── Lazy terrain grid + grid image (built once on first use) ─────────────────

const gridCache = new Map<GridKey, TerrainGrid>();
function getGrid(feType: FeType): TerrainGrid {
  if (!gridCache.has(feType)) {
    gridCache.set(feType, buildTerrainGrid(mapBSvgRaw, LAYER_COSTS[feType]));
  }
  return gridCache.get(feType)!;
}

function getColumnGrid(feType: FeType): TerrainGrid | null {
  if (feType === 'foot') return null;
  const key: GridKey = `${feType}-column`;
  if (!gridCache.has(key)) {
    gridCache.set(key, buildTerrainGrid(mapBSvgRaw, LAYER_COSTS[key], Infinity));
  }
  return gridCache.get(key)!;
}

function mergedReachable(start: Point, feType: FeType, maxCost: number): Float32Array {
  const normal = findReachableCells(start, getGrid(feType), maxCost);
  const colGrid = getColumnGrid(feType);
  if (!colGrid) return normal;
  const col = findReachableCells(start, colGrid, maxCost);
  for (let i = 0; i < normal.length; i++) {
    if (col[i] < normal[i]) normal[i] = col[i];
  }
  return normal;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MovementMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [feType, setFeType] = useState<FeType>('tracked');
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
      const dist = mergedReachable(startPt, feType, MOVEMENT_RANGE);
      rangeDistRef.current = dist;
      setRangeDataUrl(buildRangeDataUrl(dist, getGrid(feType), MOVEMENT_RANGE));
    } else {
      rangeDistRef.current = null;
      setRangeDataUrl(null);
    }
  }, [startPt, endPt, feType]);

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
        const grid = getGrid(feType);
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
        const path = findPath(startPt, pt, grid) ?? findPath(startPt, pt, getColumnGrid(feType) ?? grid);
        setResult(path);
      }
    };
  }, [startPt, endPt, feType]);

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

  const pathPoints = result?.points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0 6px' }}>
        <button onClick={reset} disabled={!startPt}>Reset</button>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: '0.9em', cursor: 'pointer' }}>
          <input type="checkbox" checked={showGrid} onChange={e => setShowGrid((e.target as HTMLInputElement).checked)} />
          Show grid
        </label>
        <span style={{ fontSize: '0.9em', color: '#666' }}>FE type:</span>
        {(['foot', 'wheeled', 'tracked'] as FeType[]).map(t => (
          <button
            key={t}
            onClick={() => { setFeType(t); setEndPt(null); setResult(null); }}
            style={{ fontWeight: feType === t ? 'bold' : 'normal', textDecoration: feType === t ? 'underline' : 'none' }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ position: 'relative', width: '100%', aspectRatio: `${vbW} / ${vbH}` }}>
        <svg
          ref={svgRef}
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'crosshair' }}
          onMouseDown={handleMouseDown}
        >
          {/* Map background */}
          <image href={mapBJpg} x={vbX} y={vbY} width={vbW} height={vbH} preserveAspectRatio="none" />

          {/* Rasterised cost grid overlay */}
          {showGrid && (
            <image
              href={getGridDataUrl(getGrid(feType))}
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

