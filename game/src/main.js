// The Gilded Gallery — game loop, input, tools, win/lose and the screenshot
// staging used to take the entry's pictures. The game runs from a seeded,
// deterministic level: the same seed and the same inputs replay the same
// night.
import { GAME_WIDTH, GAME_HEIGHT, TUNING, SPAWN, EXIT_DOOR } from './config.js';
import { buildLevel, moveCircle } from './level.js';
import { stepStealth, paintingInReach, coinLuresGuard, cameraAngleAt } from './stealth.js';
import { createGalleryAudio } from './audio.js';
import {
  drawFloor, drawWalls, drawCover, drawPaintings, drawGuards, drawCameras,
  drawLasers, drawCoin, drawThief, drawHud, drawOverlay, drawTitleCard,
} from './render.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const audio = createGalleryAudio();
const params = new URLSearchParams(window.location.search);
const seed = Number(params.get('seed') || '7');
const shotName = params.get('shot') || '';

const level = buildLevel(seed);
let phase = 'title'; // title | playing | caught | escaped
let keys = {};
let lastTime = performance.now();
let flashTimer = 0;
let flashMessage = '';
let cutSoundTimer = 0;

function showFlash(message, seconds = 1.6) {
  flashMessage = message;
  flashTimer = seconds;
}

function resetGame() {
  const fresh = buildLevel(seed);
  Object.assign(level, fresh);
  level.thief.x = SPAWN.x;
  level.thief.y = SPAWN.y;
  phase = 'playing';
}

function moveGuard(guard, dt) {
  if (guard.investigateTimer > 0) {
    guard.investigateTimer -= dt;
    const dx = guard.investigateX - guard.x;
    const dy = guard.investigateY - guard.y;
    const dist = Math.hypot(dx, dy);
    if (dist > 6) {
      const step = Math.min(dist, guard.speed * 1.5 * dt);
      guard.x += (dx / dist) * step;
      guard.y += (dy / dist) * step;
      guard.angle = Math.atan2(dy, dx);
    }
    if (guard.investigateTimer <= 0) guard.alerted = false;
    return;
  }
  const target = guard.waypoints[guard.targetIndex];
  const dx = target[0] - guard.x;
  const dy = target[1] - guard.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) {
    guard.targetIndex = (guard.targetIndex + 1) % guard.waypoints.length;
    return;
  }
  const step = Math.min(dist, guard.speed * dt);
  guard.x += (dx / dist) * step;
  guard.y += (dy / dist) * step;
  guard.angle = Math.atan2(dy, dx);
}

function stepGame(dt) {
  level.timeSeconds += dt;
  if (level.smokeTimer > 0) level.smokeTimer -= dt;
  if (flashTimer > 0) flashTimer -= dt;

  // Thief movement from keyboard.
  let mx = 0;
  let my = 0;
  if (keys['arrowleft'] || keys['a']) mx -= 1;
  if (keys['arrowright'] || keys['d']) mx += 1;
  if (keys['arrowup'] || keys['w']) my -= 1;
  if (keys['arrowdown'] || keys['s']) my += 1;
  if (mx !== 0 || my !== 0) {
    const len = Math.hypot(mx, my);
    moveCircle(level.thief, (mx / len) * TUNING.thiefSpeed * dt, (my / len) * TUNING.thiefSpeed * dt, level.thief.radius);
    level.cutProgress = 0;
  }

  for (const guard of level.guards) moveGuard(guard, dt);

  const events = stepStealth(level, dt);
  for (const event of events) {
    if (event.type === 'spotted') {
      showFlash(`${event.by} spotted you!`);
      audio.spotted();
    } else if (event.type === 'laser') {
      showFlash('Laser tripped! Alarm +26');
      audio.laser();
    } else if (event.type === 'camera') {
      showFlash('Camera has you in frame!');
    }
  }

  // Cutting a painting out of its frame takes holding still beside it.
  const near = paintingInReach(level);
  if (near && (mx === 0 && my === 0)) {
    level.cutProgress += dt / TUNING.cutTimeSeconds;
    cutSoundTimer -= dt;
    if (cutSoundTimer <= 0) {
      audio.cut();
      cutSoundTimer = 0.4;
    }
    if (level.cutProgress >= 1) {
      near.stolen = true;
      level.score += near.score;
      level.cutProgress = 0;
      audio.steal();
      if (near.main) {
        level.hasMainPainting = true;
        showFlash('THE GILDED SUN is yours! Get to the EXIT!', 2.4);
      } else {
        showFlash(`Stole "${near.title}" (+${near.score})`);
      }
    }
  } else {
    level.cutProgress = 0;
  }

  // Escape through the EXIT door with the Sun in hand.
  if (level.hasMainPainting
    && level.thief.x > EXIT_DOOR.x && level.thief.x < EXIT_DOOR.x + EXIT_DOOR.w
    && level.thief.y > EXIT_DOOR.y - 8) {
    level.score += TUNING.escapeScore;
    level.escaped = true;
    phase = 'escaped';
    audio.win();
  }

  if (level.caught) {
    phase = 'caught';
    audio.caught();
  }
}

function drawGame() {
  drawFloor(ctx);
  drawWalls(ctx);
  drawCover(ctx);
  drawPaintings(ctx, level.paintings);
  drawLasers(ctx, level.lasers);
  drawCameras(ctx, level.cameras, level.timeSeconds);
  drawGuards(ctx, level.guards);
  drawCoin(ctx, level.coin);
  drawThief(ctx, level.thief, level.smokeTimer, level.cutProgress);
  drawHud(ctx, level);
  if (flashTimer > 0) {
    ctx.fillStyle = '#ff5d73';
    ctx.font = 'bold 17px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(flashMessage, 640, 652);
  }
  if (phase === 'title') drawTitleCard(ctx);
  if (phase === 'caught') {
    drawOverlay(ctx, 'CAUGHT!', [level.caughtReason, `Score ${level.score} — the Sun stays on the wall.`], '#e63946');
  }
  if (phase === 'escaped') {
    drawOverlay(ctx, 'CLEAN GETAWAY!', [`The Gilded Sun hangs in a private collection now.`, `Final score ${level.score} — alarm peaked and fell, but you were gone.`], '#e8b64c');
  }
}

function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (phase === 'playing') stepGame(dt);
  drawGame();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault();
  if (phase === 'title') {
    audio.unlock();
    audio.startMusic();
    phase = 'playing';
    return;
  }
  if (key === 'r' && (phase === 'caught' || phase === 'escaped')) resetGame();
  if (key === 'm') audio.toggleMute();
  if (phase !== 'playing') return;
  if (key === 'q' && level.smoke > 0 && level.smokeTimer <= 0) {
    level.smoke -= 1;
    level.smokeTimer = TUNING.smokeSeconds;
    showFlash('Smoke! The docents cannot see you for a moment.');
    audio.smoke();
  }
});

window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener('mousedown', (event) => {
  audio.unlock();
  if (phase === 'title') {
    audio.startMusic();
    phase = 'playing';
    return;
  }
  if (phase !== 'playing' || level.coins <= 0) return;
  const rect = canvas.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * GAME_WIDTH;
  const y = ((event.clientY - rect.top) / rect.height) * GAME_HEIGHT;
  level.coins -= 1;
  level.coin = { x, y, timer: 6 };
  const lured = coinLuresGuard(level, x, y);
  if (lured) showFlash(`${lured.name} heard the coin and wanders over…`);
  audio.coin();
});

// A coin on the floor fades after a while.
setInterval(() => {
  if (level.coin) {
    level.coin.timer -= 0.25;
    if (level.coin.timer <= 0) level.coin = null;
  }
}, 250);

// Screenshot staging: ?shot=<name> drops the game into a fixed, readable
// moment so the entry's pictures are real renders of the game's own code.
function stageShot(name) {
  phase = 'playing';
  const setThief = (x, y) => { level.thief.x = x; level.thief.y = y; };
  if (name === 'cover') {
    setThief(640, 300);
    level.alarm = 42;
    level.timeSeconds = 96;
    level.guards[0].x = 470; level.guards[0].y = 210; level.guards[0].angle = 0.5;
    level.guards[1].x = 1120; level.guards[1].y = 430; level.guards[1].angle = -2.2;
    level.guards[2].x = 200; level.guards[2].y = 480; level.guards[2].angle = -0.4;
  } else if (name === 'laser') {
    setThief(560, 162);
    level.alarm = 18;
    level.timeSeconds = 150;
    level.guards[0].x = 850; level.guards[0].y = 200; level.guards[0].angle = 2.6;
    level.guards[1].x = 1010; level.guards[1].y = 180; level.guards[1].angle = 1.4;
    level.guards[2].x = 120; level.guards[2].y = 300; level.guards[2].angle = 0.2;
    level.lasers[0].lit = true;
    level.lasers[1].lit = true;
  } else if (name === 'grab') {
    setThief(640, 118);
    level.alarm = 78;
    level.timeSeconds = 210;
    level.cutProgress = 0.7;
    level.guards[0].x = 500; level.guards[0].y = 260; level.guards[0].angle = -0.9;
    level.guards[0].alerted = true;
    level.guards[1].x = 1060; level.guards[1].y = 500; level.guards[1].angle = -2.8;
    level.guards[2].x = 260; level.guards[2].y = 560; level.guards[2].angle = -1.2;
    showFlash('Cutting THE GILDED SUN from its frame…', 60);
  } else if (name === 'escape') {
    setThief(150, 640);
    level.alarm = 55;
    level.timeSeconds = 262;
    level.hasMainPainting = true;
    level.score = 1350;
    level.paintings.find((p) => p.id === 'sun').stolen = true;
    level.paintings.find((p) => p.id === 'fox').stolen = true;
    level.guards[0].x = 420; level.guards[0].y = 560; level.guards[0].angle = -2.4;
    level.guards[0].alerted = true;
    level.guards[1].x = 1000; level.guards[1].y = 430; level.guards[1].angle = 3.0;
    level.guards[2].x = 260; level.guards[2].y = 620; level.guards[2].angle = 2.6;
    level.guards[2].alerted = true;
    showFlash('THE GILDED SUN is yours! Get to the EXIT!', 60);
  }
  drawGame();
}

// Debug hook for play-testing: the page exposes its live state so a test
// can move the thief, read the alarm and check win/lose without guessing.
window.__gallery = {
  level,
  get phase() { return phase; },
  reset: resetGame,
  start() { phase = 'playing'; },
  setThief(x, y) { level.thief.x = x; level.thief.y = y; },
  keys(k) { keys = k; },
  cameraAngle: (i) => cameraAngleAt(level.cameras[i], level.timeSeconds),
  stage: stageShot,
};

if (shotName) {
  stageShot(shotName);
  // Keep staged shots still: the loop would otherwise walk the guards away.
  level.guards.forEach((g) => { g.speed = 0; });
} else {
  requestAnimationFrame(loop);
}
