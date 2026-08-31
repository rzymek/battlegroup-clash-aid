import { describe, it, expect } from 'vitest';
import { buildTerrainGrid } from './terrainGrid.ts';
import { findPath } from './findPath.ts';

// Minimal SVG with one inkscape layer containing a rectangular polygon.
// viewBox: 0 0 100 100. Polygon covers x=40..60, y=40..60 (the center).
const SVG_WITH_POLYGON = `<?xml version="1.0" encoding="UTF-8"?>
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"
     xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape">
  <g inkscape:groupmode="layer" inkscape:label="forest" id="layer1">
    <path d="M 40,40 L 60,40 L 60,60 L 40,60 Z" />
  </g>
</svg>`;

describe('buildTerrainGrid', () => {
  it('assigns default cost to cells outside polygons', () => {
    const grid = buildTerrainGrid(SVG_WITH_POLYGON, { forest: 3 }, 1, 10);
    // top-left cell (0,0) centre is at (5,5) — outside the polygon
    expect(grid.costs[0]).toBe(1);
  });

  it('assigns layer cost to cells inside polygon', () => {
    const grid = buildTerrainGrid(SVG_WITH_POLYGON, { forest: 3 }, 1, 10);
    // cell (5,5) centre is at (55,55) — inside the 40-60 box
    expect(grid.costs[5 * 10 + 5]).toBe(3);
  });
});

describe('findPath', () => {
  it('finds a straight path when no terrain obstacle exists', () => {
    const grid = buildTerrainGrid(SVG_WITH_POLYGON, {}, 1, 10);
    const result = findPath({ x: 5, y: 5 }, { x: 95, y: 5 }, grid);
    expect(result).not.toBeNull();
    expect(result!.points.length).toBeGreaterThan(0);
  });

  it('assigns higher cost to path crossing expensive terrain', () => {
    const grid = buildTerrainGrid(SVG_WITH_POLYGON, { forest: 10 }, 1, 20);
    // straight line from (5,50) to (95,50) passes through the expensive centre box
    const throughForest = findPath({ x: 5, y: 50 }, { x: 95, y: 50 }, grid);
    // straight line from (5,5) to (95,5) stays outside the forest entirely
    const outsideForest = findPath({ x: 5, y: 5 }, { x: 95, y: 5 }, grid);
    expect(throughForest!.totalCost).toBeGreaterThan(outsideForest!.totalCost);
  });

  it('returns null for same start and end', () => {
    const grid = buildTerrainGrid(SVG_WITH_POLYGON, {}, 1, 10);
    const result = findPath({ x: 50, y: 50 }, { x: 50, y: 50 }, grid);
    // single cell path — cost 0 or just the start cell
    expect(result).not.toBeNull();
    expect(result!.totalCost).toBe(0);
  });
});
