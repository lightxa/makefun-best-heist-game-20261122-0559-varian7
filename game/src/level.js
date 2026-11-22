// Level construction and geometry: walls, cover, line of sight and the
// museum state that a fresh run starts from.
import { WALLS, COVER, PAINTINGS, GUARD_PATROLS, CAMERAS, LASERS, SPAWN, TUNING } from './config.js';
import { mulberry32, jitterRandom } from './random.js';

export function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function circleHitsRect(cx, cy, r, rect) {
  const nx = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const ny = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - nx;
  const dy = cy - ny;
  return dx * dx + dy * dy < r * r;
}

export function pointHitsRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

function segmentsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const d1 = (dx - cx) * (ay - cy) - (dy - cy) * (ax - cx);
  const d2 = (dx - cx) * (by - cy) - (dy - cy) * (bx - cx);
  const d3 = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  const d4 = (bx - ax) * (dy - ay) - (by - ay) * (dx - ax);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  if (pointHitsRect(x1, y1, rect) || pointHitsRect(x2, y2, rect)) return true;
  const corners = [
    [rect.x, rect.y, rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y, rect.x + rect.w, rect.y + rect.h],
    [rect.x + rect.w, rect.y + rect.h, rect.x, rect.y + rect.h],
    [rect.x, rect.y + rect.h, rect.x, rect.y],
  ];
  return corners.some(([ax, ay, bx, by]) => segmentsCross(x1, y1, x2, y2, ax, ay, bx, by));
}

// True when nothing solid stands between the two points.
export function hasLineOfSight(x1, y1, x2, y2) {
  const solids = [...WALLS, ...COVER];
  return !solids.some((rect) => segmentHitsRect(x1, y1, x2, y2, rect));
}

// Move a circle against walls and cover, sliding along the blocked axis.
export function moveCircle(pos, dx, dy, radius) {
  const solids = [...WALLS, ...COVER];
  const tryX = { x: pos.x + dx, y: pos.y };
  if (!solids.some((rect) => circleHitsRect(tryX.x, tryX.y, radius, rect))) pos.x = tryX.x;
  const tryY = { x: pos.x, y: pos.y + dy };
  if (!solids.some((rect) => circleHitsRect(tryY.x, tryY.y, radius, rect))) pos.y = tryY.y;
}

export function buildLevel(seed) {
  const rng = mulberry32(seed);
  const guards = GUARD_PATROLS.map((patrol, i) => ({
    name: patrol.name,
    waypoints: patrol.waypoints,
    speed: patrol.speed,
    x: patrol.waypoints[0][0],
    y: patrol.waypoints[0][1],
    targetIndex: 1,
    angle: 0,
    // Small seeded jitter so patrols do not march in lockstep.
    phase: jitterRandom(rng, 0.6),
    alerted: false,
    investigateX: 0,
    investigateY: 0,
    investigateTimer: 0,
    id: i,
  }));
  const cameras = CAMERAS.map((cam) => ({ ...cam }));
  const lasers = LASERS.map((beam) => ({ ...beam, lit: true, timer: beam.phase, justHit: false }));
  const paintings = PAINTINGS.map((p) => ({ ...p, stolen: false }));
  return {
    seed,
    guards,
    cameras,
    lasers,
    paintings,
    thief: { x: SPAWN.x, y: SPAWN.y, radius: TUNING.thiefRadius },
    alarm: 0,
    score: 0,
    coins: TUNING.coinCount,
    smoke: TUNING.smokeCount,
    smokeTimer: 0,
    coin: null,
    cutProgress: 0,
    hasMainPainting: false,
    timeSeconds: 0,
    caught: false,
    caughtReason: '',
    escaped: false,
  };
}
