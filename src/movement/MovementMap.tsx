import { useState, useRef, useEffect, useMemo } from 'preact/hooks';
import mapBSvgRaw from '../../resources/mapB.svg?raw';
import mapBJpg from '../../resources/maps/mapB.jpg';
import { buildTerrainGrid } from './terrainGrid.ts';
import { findPath, findReachableCells, screenToSvg } from './findPath.ts';
import type { Point, PathResult, TerrainGrid } from './types.ts';
import { getGridDataUrl, buildRangeDataUrl } from './gridRendering.ts';
import { useMapPan } from './useMapPan.ts';

type FeType = 'foot' | 'wheeled' | 'tracked';
type GridKey = FeType | 'wheeled-column' | 'tracked-column';

// Movement allowance in metres (SVG units = metres) for open terrain.
const MOVEMENT_RANGE_M: Record<FeType, number> = {
  foot: 750,
  wheeled: 1500,
  tracked: 2000,
};

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

const ENEMY_SIZE_M = 200;

function applyEnemies(grid: TerrainGrid, enemies: Point[]): TerrainGrid {
  if (enemies.length === 0) return grid;
  const { rows, cols, viewBox, metersPerUnit } = grid;
  const costs = new Float32Array(grid.costs);
  const halfSvg = (ENEMY_SIZE_M / metersPerUnit) / 2;
  const cellW = viewBox.width / cols;
  const cellH = viewBox.height / rows;
  for (const enemy of enemies) {
    const c0 = Math.max(0, Math.floor((enemy.x - halfSvg - viewBox.x) / cellW));
    const c1 = Math.min(cols - 1, Math.floor((enemy.x + halfSvg - viewBox.x) / cellW));
    const r0 = Math.max(0, Math.floor((enemy.y - halfSvg - viewBox.y) / cellH));
    const r1 = Math.min(rows - 1, Math.floor((enemy.y + halfSvg - viewBox.y) / cellH));
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        costs[r * cols + c] = Infinity;
      }
    }
  }
  return { ...grid, costs };
}

/** Grid columns — rows are derived from the map aspect ratio so cells are square. */
const GRID_RESOLUTION = 400;

// ── Lazy terrain grid + grid image (built once on first use) ─────────────────

const gridCache = new Map<GridKey, TerrainGrid>();
function getGrid(feType: FeType): TerrainGrid {
  if (!gridCache.has(feType)) {
    gridCache.set(feType, buildTerrainGrid(mapBSvgRaw, LAYER_COSTS[feType], 1, GRID_RESOLUTION));
  }
  return gridCache.get(feType)!;
}

function getColumnGrid(feType: FeType): TerrainGrid | null {
  if (feType === 'foot') return null;
  const key: GridKey = `${feType}-column`;
  if (!gridCache.has(key)) {
    gridCache.set(key, buildTerrainGrid(mapBSvgRaw, LAYER_COSTS[key], Infinity, GRID_RESOLUTION));
  }
  return gridCache.get(key)!;
}

function mergedReachable(start: Point, normalGrid: TerrainGrid, colGrid: TerrainGrid | null, maxCost: number, noEnemyInLos: boolean): Float32Array {
  const normal = findReachableCells(start, normalGrid, maxCost);
  if (!noEnemyInLos || !colGrid) return normal;
  // Column movement (all-on-major-road) is a separate mode: show its reach on top of normal range.
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
  const [suppressed, setSuppressed] = useState(false);
  const [gpsDisrupted, setGpsDisrupted] = useState(false);
  const [noEnemyInLos, setNoEnemyInLos] = useState(true);
  const [enemies, setEnemies] = useState<Point[]>([]);
  const [placingEnemy, setPlacingEnemy] = useState(false);
  const [rangeDataUrl, setRangeDataUrl] = useState<string | null>(null);
  const clickHandlerRef = useRef<(e: MouseEvent) => void>(() => {});
  const { vb, isDragging, handleMouseDown, resetPan } = useMapPan(svgRef, clickHandlerRef, INITIAL_VB);
  const rangeDistRef = useRef<Float32Array | null>(null);

  const enemyBaseGrid = useMemo(() => applyEnemies(getGrid(feType), enemies), [feType, enemies]);
  const enemyColGrid = useMemo(() => {
    const col = getColumnGrid(feType);
    return col ? applyEnemies(col, enemies) : null;
  }, [feType, enemies]);

  // Pre-warm all terrain grids after first paint so the first click is instant.
  useEffect(() => {
    const id = setTimeout(() => {
      getGrid('foot'); getGrid('wheeled'); getGrid('tracked');
      getColumnGrid('wheeled'); getColumnGrid('tracked');
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const movementMultiplier = (suppressed ? 0.5 : 1) * (gpsDisrupted ? 0.75 : 1);

  useEffect(() => {
    if (startPt && !endPt) {
      const maxMove = MOVEMENT_RANGE_M[feType] * movementMultiplier;
      const dist = mergedReachable(startPt, enemyBaseGrid, noEnemyInLos ? enemyColGrid : null, maxMove, noEnemyInLos);
      rangeDistRef.current = dist;
      setRangeDataUrl(buildRangeDataUrl(dist, enemyBaseGrid, maxMove));
    } else {
      rangeDistRef.current = null;
      setRangeDataUrl(null);
    }
  }, [startPt, endPt, feType, movementMultiplier, noEnemyInLos, enemyBaseGrid, enemyColGrid]);

  // Keep click logic up-to-date without stale closures in window handler.
  useEffect(() => {
    clickHandlerRef.current = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const pt = screenToSvg({ x: e.clientX, y: e.clientY }, svgRef.current);
      if (placingEnemy) {
        setEnemies(prev => [...prev, pt]);
        return;
      }
      if (!startPt || endPt) {
        setStartPt(pt);
        setEndPt(null);
        setResult(null);
      } else {
        const { rows, cols, viewBox } = enemyBaseGrid;
        const row = Math.max(0, Math.min(rows - 1, Math.floor((pt.y - viewBox.y) / viewBox.height * rows)));
        const col = Math.max(0, Math.min(cols - 1, Math.floor((pt.x - viewBox.x) / viewBox.width * cols)));
        const maxMove = MOVEMENT_RANGE_M[feType] * movementMultiplier;
        if (rangeDistRef.current && rangeDistRef.current[row * cols + col] > maxMove) {
          setStartPt(pt);
          setEndPt(null);
          setResult(null);
          return;
        }
        setEndPt(pt);
        const path = (noEnemyInLos && enemyColGrid ? findPath(startPt, pt, enemyColGrid) : null) ?? findPath(startPt, pt, enemyBaseGrid);
        setResult(path);
      }
    };
  }, [startPt, endPt, feType, movementMultiplier, noEnemyInLos, placingEnemy, enemyBaseGrid, enemyColGrid]);

  const reset = () => {
    setStartPt(null);
    setEndPt(null);
    setResult(null);
    resetPan();
  };

  const pathPoints = result?.points.map(p => `${p.x},${p.y}`).join(' ');

  const pathLabelProps = (() => {
    if (!result || result.points.length < 2) return null;
    const pts = result.points;
    let totalLen = 0;
    const segs: number[] = [0];
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i].x - pts[i - 1].x;
      const dy = pts[i].y - pts[i - 1].y;
      totalLen += Math.sqrt(dx * dx + dy * dy);
      segs.push(totalLen);
    }
    const half = totalLen / 2;
    let idx = segs.findIndex(s => s >= half);
    if (idx < 1) idx = 1;
    const t = (half - segs[idx - 1]) / (segs[idx] - segs[idx - 1]);
    const x = pts[idx - 1].x + t * (pts[idx].x - pts[idx - 1].x);
    const y = pts[idx - 1].y + t * (pts[idx].y - pts[idx - 1].y);
    const meters = totalLen * getGrid(feType).metersPerUnit;
    const label = meters >= 1000
      ? `${(meters / 1000).toFixed(1)} km`
      : `${Math.round(meters)} m`;
    return { x, y, label };
  })();

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0 6px', flexWrap: 'wrap' }}>
        <button onClick={reset}>Reset</button>
        <button
          onClick={() => setPlacingEnemy(v => !v)}
          style={{ fontWeight: placingEnemy ? 'bold' : 'normal', outline: placingEnemy ? '2px solid darkred' : 'none' }}
        >
          Enemy
        </button>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: '0.9em', cursor: 'pointer' }}>
          <input type="checkbox" checked={showGrid} onChange={e => setShowGrid((e.target as HTMLInputElement).checked)} />
          Debug
        </label>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: '0.9em', cursor: 'pointer' }}>
          <input type="checkbox" checked={suppressed} onChange={e => { setSuppressed((e.target as HTMLInputElement).checked); setEndPt(null); setResult(null); }} />
          Suppressed
        </label>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: '0.9em', cursor: 'pointer' }}>
          <input type="checkbox" checked={gpsDisrupted} onChange={e => { setGpsDisrupted((e.target as HTMLInputElement).checked); setEndPt(null); setResult(null); }} />
          GPS disrupted
        </label>
        <label style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: '0.9em', cursor: feType === 'foot' ? 'not-allowed' : 'pointer', opacity: feType === 'foot' ? 0.4 : 1 }}>
          <input type="checkbox" checked={noEnemyInLos} disabled={feType === 'foot'} onChange={e => { setNoEnemyInLos((e.target as HTMLInputElement).checked); setEndPt(null); setResult(null); }} />
          No enemy in LoS
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
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : placingEnemy ? 'cell' : 'crosshair' }}
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

          {/* Path length label */}
          {pathLabelProps && (
            <g>
              <rect
                x={pathLabelProps.x - 90} y={pathLabelProps.y - 19}
                width={180} height={38}
                rx={6}
                fill="rgba(0,0,0,0.65)"
              />
              <text
                x={pathLabelProps.x} y={pathLabelProps.y}
                dominantBaseline="central"
                textAnchor="middle"
                fill="white"
                fontSize={26}
                fontWeight="bold"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {pathLabelProps.label}
              </text>
            </g>
          )}

          {/* Enemy markers */}
          {enemies.map((e, i) => (
            <EnemyMarker key={i} pt={e} metersPerUnit={enemyBaseGrid.metersPerUnit} />
          ))}

          {/* Start marker */}
          {startPt && <Marker pt={startPt} color="#1565c0" label="S" />}

          {/* End marker */}
          {endPt && <Marker pt={endPt} color="#b71c1c" label="E" />}
        </svg>
      </div>
    </div>
  );
}

function EnemyMarker({ pt, metersPerUnit }: { pt: Point; metersPerUnit: number }) {
  const half = (ENEMY_SIZE_M / metersPerUnit) / 2;
  return (
    <g>
      <rect x={pt.x - half} y={pt.y - half} width={half * 2} height={half * 2}
        fill="rgba(160,0,0,0.75)" stroke="darkred" strokeWidth={4} />
      <line x1={pt.x - half} y1={pt.y - half} x2={pt.x + half} y2={pt.y + half} stroke="darkred" strokeWidth={4} />
      <line x1={pt.x + half} y1={pt.y - half} x2={pt.x - half} y2={pt.y + half} stroke="darkred" strokeWidth={4} />
    </g>
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

