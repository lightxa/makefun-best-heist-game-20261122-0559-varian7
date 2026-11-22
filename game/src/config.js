// Museum layout and tuning for The Gilded Gallery. All coordinates are in
// the 1280x720 playfield. The plan is fixed data; the seed only jitters the
// patrol phases, so the same seed always builds the same museum.
export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const WALL = 24;

export const PALETTE = {
  floor: '#1c1626',
  floorTile: '#221a30',
  wall: '#3a2f52',
  wallTop: '#57467a',
  gold: '#e8b64c',
  goldDim: '#9a7a33',
  velvet: '#7a1f2b',
  alarmLow: '#4caf6d',
  alarmMid: '#e8b64c',
  alarmHigh: '#e63946',
  thief: '#f2e9d8',
  guard: '#8fb8d8',
  camera: '#ff5d73',
  laser: '#ff2e63',
  caseGlass: '#9fd8e8',
};

export const TUNING = {
  thiefSpeed: 175,
  thiefRadius: 13,
  guardSpeed: 55,
  guardRadius: 14,
  guardConeRange: 235,
  guardConeHalfAngle: 0.62,
  cameraRange: 285,
  cameraConeHalfAngle: 0.42,
  alarmGuardRate: 34,
  alarmCameraRate: 22,
  alarmLaserHit: 26,
  alarmDecay: 7,
  alarmCaughtAt: 100,
  cutTimeSeconds: 1.6,
  smokeSeconds: 4,
  smokeCount: 3,
  coinCount: 5,
  smallPaintingScore: 100,
  mainPaintingScore: 1000,
  escapeScore: 250,
};

// Walls are solid rectangles. Doorways are simply gaps between wall pieces.
export const WALLS = [
  // Outer shell.
  { x: 0, y: 0, w: 1280, h: 24 },
  { x: 0, y: 696, w: 1280, h: 24 },
  { x: 0, y: 0, w: 24, h: 720 },
  { x: 1256, y: 0, w: 24, h: 720 },
  // Divider between Entry Hall and Grand Gallery, doorway y 300-420.
  { x: 330, y: 24, w: 18, h: 276 },
  { x: 330, y: 420, w: 18, h: 276 },
  // Divider between Grand Gallery and East Wing, doorway y 300-420.
  { x: 950, y: 24, w: 18, h: 276 },
  { x: 950, y: 420, w: 18, h: 276 },
];

// Display cases and benches: solid cover that blocks movement and sight.
export const COVER = [
  { x: 430, y: 300, w: 92, h: 62, kind: 'case' },
  { x: 700, y: 180, w: 92, h: 62, kind: 'case' },
  { x: 560, y: 480, w: 112, h: 62, kind: 'case' },
  { x: 1040, y: 300, w: 84, h: 62, kind: 'case' },
  { x: 430, y: 520, w: 84, h: 52, kind: 'case' },
  { x: 640, y: 380, w: 124, h: 28, kind: 'bench' },
  { x: 1080, y: 520, w: 96, h: 28, kind: 'bench' },
];

// Paintings on the walls. The Gilded Sun is the main loot; the rest are
// small side loot worth points. grabX/grabY is where the thief must stand.
export const PAINTINGS = [
  { id: 'sun', title: 'THE GILDED SUN', x: 640, y: 30, w: 150, h: 74, main: true, grabX: 640, grabY: 118, score: 1000 },
  { id: 'fox', title: 'Portrait of a Fox', x: 470, y: 30, w: 84, h: 52, main: false, grabX: 470, grabY: 104, score: 100 },
  { id: 'vase', title: 'Blue Vase Study', x: 30, y: 210, w: 52, h: 84, main: false, grabX: 96, grabY: 252, score: 100 },
  { id: 'garden', title: 'The Marble Garden', x: 1100, y: 30, w: 84, h: 52, main: false, grabX: 1100, grabY: 104, score: 100 },
  { id: 'lemons', title: 'Still Life with Lemons', x: 1200, y: 420, w: 52, h: 84, main: false, grabX: 1180, grabY: 462, score: 100 },
];

export const GUARD_PATROLS = [
  { name: 'Docent Mara', waypoints: [[430, 150], [850, 150], [850, 560], [430, 560]], speed: 55 },
  { name: 'Docent Ivo', waypoints: [[1000, 150], [1200, 150], [1200, 560], [1000, 560]], speed: 48 },
  { name: 'Docent Pell', waypoints: [[90, 150], [280, 150], [280, 560], [90, 560]], speed: 50 },
];

export const CAMERAS = [
  { x: 770, y: 30, baseAngle: Math.PI / 2, sweep: 0.62, period: 5.2, phase: 0 },
  { x: 1250, y: 360, baseAngle: Math.PI, sweep: 0.55, period: 6.4, phase: 1.7 },
];

// Laser beams guarding the alcove in front of The Gilded Sun. Each beam
// blinks on its own cycle: cross it while it is lit and the alarm jumps.
export const LASERS = [
  { x1: 520, y1: 148, x2: 760, y2: 148, onSeconds: 2.2, offSeconds: 1.4, phase: 0 },
  { x1: 520, y1: 176, x2: 760, y2: 176, onSeconds: 1.8, offSeconds: 1.8, phase: 1.1 },
];

export const SPAWN = { x: 90, y: 640 };
export const EXIT_DOOR = { x: 80, y: 690, w: 110, h: 10 };
