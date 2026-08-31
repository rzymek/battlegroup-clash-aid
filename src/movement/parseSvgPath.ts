import type { Point } from './types.ts';

/**
 * Parse an SVG path `d` attribute and return an approximated polyline/polygon.
 * Handles M, m, C, c, S, s, Z, z, L, l, H, h, V, v commands.
 * Bezier curves are linearized at `stepsPerSegment`.
 * `isClosed` is true when the path contains a Z/z command.
 */
export function flattenSvgPath(d: string, stepsPerSegment = 12): { points: Point[]; isClosed: boolean } {
  const points: Point[] = [];
  let x = 0, y = 0;
  let lastCpX = 0, lastCpY = 0;
  let isClosed = false;

  for (const { cmd, args } of tokenize(d)) {
    switch (cmd) {
      case 'M': {
        x = args[0]; y = args[1];
        points.push({ x, y });
        lastCpX = x; lastCpY = y;
        for (let i = 2; i < args.length; i += 2) {
          x = args[i]; y = args[i + 1];
          points.push({ x, y });
        }
        break;
      }
      case 'm': {
        x += args[0]; y += args[1];
        points.push({ x, y });
        lastCpX = x; lastCpY = y;
        for (let i = 2; i < args.length; i += 2) {
          x += args[i]; y += args[i + 1];
          points.push({ x, y });
        }
        break;
      }
      case 'L': {
        for (let i = 0; i < args.length; i += 2) {
          x = args[i]; y = args[i + 1];
          points.push({ x, y });
          lastCpX = x; lastCpY = y;
        }
        break;
      }
      case 'l': {
        for (let i = 0; i < args.length; i += 2) {
          x += args[i]; y += args[i + 1];
          points.push({ x, y });
          lastCpX = x; lastCpY = y;
        }
        break;
      }
      case 'C': {
        for (let i = 0; i < args.length; i += 6) {
          const p0 = { x, y };
          const p1 = { x: args[i], y: args[i + 1] };
          const p2 = { x: args[i + 2], y: args[i + 3] };
          const p3 = { x: args[i + 4], y: args[i + 5] };
          appendCubic(points, p0, p1, p2, p3, stepsPerSegment);
          lastCpX = p2.x; lastCpY = p2.y;
          x = p3.x; y = p3.y;
        }
        break;
      }
      case 'c': {
        for (let i = 0; i < args.length; i += 6) {
          const p0 = { x, y };
          const p1 = { x: x + args[i], y: y + args[i + 1] };
          const p2 = { x: x + args[i + 2], y: y + args[i + 3] };
          const p3 = { x: x + args[i + 4], y: y + args[i + 5] };
          appendCubic(points, p0, p1, p2, p3, stepsPerSegment);
          lastCpX = p2.x; lastCpY = p2.y;
          x = p3.x; y = p3.y;
        }
        break;
      }
      case 'S': {
        for (let i = 0; i < args.length; i += 4) {
          const p0 = { x, y };
          const p1 = { x: 2 * x - lastCpX, y: 2 * y - lastCpY };
          const p2 = { x: args[i], y: args[i + 1] };
          const p3 = { x: args[i + 2], y: args[i + 3] };
          appendCubic(points, p0, p1, p2, p3, stepsPerSegment);
          lastCpX = p2.x; lastCpY = p2.y;
          x = p3.x; y = p3.y;
        }
        break;
      }
      case 's': {
        for (let i = 0; i < args.length; i += 4) {
          const p0 = { x, y };
          const p1 = { x: 2 * x - lastCpX, y: 2 * y - lastCpY };
          const p2 = { x: x + args[i], y: y + args[i + 1] };
          const p3 = { x: x + args[i + 2], y: y + args[i + 3] };
          appendCubic(points, p0, p1, p2, p3, stepsPerSegment);
          lastCpX = p2.x; lastCpY = p2.y;
          x = p3.x; y = p3.y;
        }
        break;
      }
      case 'H': {
        for (let i = 0; i < args.length; i++) {
          x = args[i];
          points.push({ x, y });
          lastCpX = x; lastCpY = y;
        }
        break;
      }
      case 'h': {
        for (let i = 0; i < args.length; i++) {
          x += args[i];
          points.push({ x, y });
          lastCpX = x; lastCpY = y;
        }
        break;
      }
      case 'V': {
        for (let i = 0; i < args.length; i++) {
          y = args[i];
          points.push({ x, y });
          lastCpX = x; lastCpY = y;
        }
        break;
      }
      case 'v': {
        for (let i = 0; i < args.length; i++) {
          y += args[i];
          points.push({ x, y });
          lastCpX = x; lastCpY = y;
        }
        break;
      }
      case 'z':
      case 'Z':
        isClosed = true;
        break;
    }
  }

  return { points, isClosed };
}

function appendCubic(
  out: Point[],
  p0: Point, p1: Point, p2: Point, p3: Point,
  steps: number,
) {
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const u = 1 - t;
    out.push({
      x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
      y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
    });
  }
}

interface Token { cmd: string; args: number[] }

function tokenize(d: string): Token[] {
  const tokens: Token[] = [];
  const re = /([MmCcSsZzLlHhVvQqTtAa])([^MmCcSsZzLlHhVvQqTtAa]*)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(d)) !== null) {
    const raw = match[2].trim();
    tokens.push({
      cmd: match[1],
      args: raw.length > 0 ? raw.split(/[\s,]+/).filter(Boolean).map(Number) : [],
    });
  }
  return tokens;
}
