// All drawing for The Gilded Gallery: the museum floor, the paintings, the
// guards and their vision cones, the cameras, the lasers, the thief and the
// HUD with its alarm meter. Nothing here loads an image; every picture is
// drawn with canvas shapes.
import { GAME_WIDTH, GAME_HEIGHT, WALLS, COVER, PALETTE, TUNING, EXIT_DOOR } from './config.js';
import { cameraAngleAt } from './stealth.js';

export function drawFloor(ctx) {
  ctx.fillStyle = PALETTE.floor;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = PALETTE.floorTile;
  for (let x = 24; x < GAME_WIDTH - 24; x += 64) {
    for (let y = 24; y < GAME_HEIGHT - 24; y += 64) {
      if (((x + y) / 64) % 2 === 0) ctx.fillRect(x, y, 64, 64);
    }
  }
  // A red carpet runner down the Grand Gallery.
  ctx.fillStyle = 'rgba(122,31,43,0.55)';
  ctx.fillRect(560, 24, 160, 672);
  ctx.strokeStyle = 'rgba(232,182,76,0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(560, 24, 160, 672);
}

export function drawWalls(ctx) {
  for (const wall of WALLS) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.fillStyle = PALETTE.wallTop;
    ctx.fillRect(wall.x, wall.y, wall.w, Math.min(4, wall.h));
  }
  ctx.fillStyle = '#e8dcc0';
  ctx.font = 'bold 15px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE GILDED GALLERY', 640, 20);
  ctx.fillStyle = '#4caf6d';
  ctx.font = 'bold 13px Verdana, sans-serif';
  ctx.fillText('EXIT', EXIT_DOOR.x + EXIT_DOOR.w / 2, 692);
}

export function drawCover(ctx) {
  for (const item of COVER) {
    ctx.fillStyle = item.kind === 'bench' ? '#5a3d24' : '#2c2338';
    ctx.fillRect(item.x, item.y, item.w, item.h);
    ctx.strokeStyle = PALETTE.goldDim;
    ctx.lineWidth = 2;
    ctx.strokeRect(item.x, item.y, item.w, item.h);
    if (item.kind === 'case') {
      ctx.fillStyle = 'rgba(159,216,232,0.16)';
      ctx.fillRect(item.x + 4, item.y + 4, item.w - 8, item.h - 8);
      ctx.fillStyle = PALETTE.caseGlass;
      ctx.beginPath();
      ctx.arc(item.x + item.w / 2, item.y + item.h / 2, 9, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawSunPainting(ctx, x, y, w, h) {
  ctx.fillStyle = '#3d0f1e';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 3;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(x + w / 2 + Math.cos(a) * 22, y + h / 2 + Math.sin(a) * 22);
    ctx.lineTo(x + w / 2 + Math.cos(a) * 32, y + h / 2 + Math.sin(a) * 32);
    ctx.stroke();
  }
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2, 20, 0, Math.PI * 2);
  ctx.fill();
}

function drawFoxPainting(ctx, x, y, w, h) {
  ctx.fillStyle = '#1e2b1a';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#d97b2f';
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 14);
  ctx.lineTo(x + 30, y + 34);
  ctx.lineTo(x + 14, y + 34);
  ctx.closePath();
  ctx.moveTo(x + w - 14, y + 14);
  ctx.lineTo(x + w - 30, y + 34);
  ctx.lineTo(x + w - 14, y + 34);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 + 4, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#f2e9d8';
  ctx.beginPath();
  ctx.arc(x + w / 2, y + h / 2 + 10, 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawVasePainting(ctx, x, y, w, h) {
  ctx.fillStyle = '#12283d';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#4f8fd0';
  ctx.beginPath();
  ctx.moveTo(x + w / 2 - 7, y + 12);
  ctx.lineTo(x + w / 2 + 7, y + 12);
  ctx.lineTo(x + w / 2 + 12, y + 30);
  ctx.lineTo(x + w / 2 + 14, y + 58);
  ctx.lineTo(x + w / 2 - 14, y + 58);
  ctx.lineTo(x + w / 2 - 12, y + 30);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9fd8e8';
  ctx.fillRect(x + w / 2 - 12, y + 38, 24, 4);
}

function drawGardenPainting(ctx, x, y, w, h) {
  ctx.fillStyle = '#14261a';
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = '#4caf6d';
  ctx.lineWidth = 4;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + 18 + i * 24, y + h - 6, 14, Math.PI, 0);
    ctx.stroke();
  }
  ctx.fillStyle = '#e8b64c';
  ctx.beginPath();
  ctx.arc(x + w - 16, y + 14, 8, 0, Math.PI * 2);
  ctx.fill();
}

function drawLemonsPainting(ctx, x, y, w, h) {
  ctx.fillStyle = '#1a2b12';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = '#e8d44c';
  for (const [lx, ly, r] of [[18, 30, 10], [34, 52, 12], [20, 66, 9]]) {
    ctx.beginPath();
    ctx.ellipse(x + lx, y + ly, r, r * 0.75, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.strokeStyle = '#4caf6d';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 14);
  ctx.lineTo(x + 34, y + 8);
  ctx.stroke();
}

const PAINTING_ARTISTS = { sun: drawSunPainting, fox: drawFoxPainting, vase: drawVasePainting, garden: drawGardenPainting, lemons: drawLemonsPainting };

export function drawPaintings(ctx, paintings) {
  for (const p of paintings) {
    if (p.stolen) {
      // An empty gold frame marks where the painting hung.
      ctx.strokeStyle = PALETTE.goldDim;
      ctx.lineWidth = 4;
      ctx.strokeRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#241a30';
      ctx.fillRect(p.x + 4, p.y + 4, p.w - 8, p.h - 8);
      continue;
    }
    ctx.save();
    ctx.beginPath();
    ctx.rect(p.x, p.y, p.w, p.h);
    ctx.clip();
    (PAINTING_ARTISTS[p.id] || drawSunPainting)(ctx, p.x, p.y, p.w, p.h);
    ctx.restore();
    ctx.strokeStyle = p.main ? PALETTE.gold : PALETTE.goldDim;
    ctx.lineWidth = p.main ? 5 : 3;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
    if (p.main) {
      ctx.fillStyle = PALETTE.gold;
      ctx.font = 'bold 12px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ THE GILDED SUN ★', p.x + p.w / 2, p.y + p.h + 16);
    }
  }
}

export function drawVisionCone(ctx, x, y, angle, range, halfAngle, color, alpha) {
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

export function drawGuards(ctx, guards) {
  for (const guard of guards) {
    const color = guard.alerted ? 'rgba(230,57,70,0.30)' : 'rgba(255,220,120,0.20)';
    drawVisionCone(ctx, guard.x, guard.y, guard.angle, TUNING.guardConeRange, TUNING.guardConeHalfAngle, color, 1);
    ctx.fillStyle = '#1a2436';
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, TUNING.guardRadius + 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.guard;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y, TUNING.guardRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b0a12';
    ctx.beginPath();
    ctx.arc(guard.x + Math.cos(guard.angle) * 6, guard.y + Math.sin(guard.angle) * 6, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8dcc0';
    ctx.font = '11px Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(guard.name, guard.x, guard.y - TUNING.guardRadius - 6);
  }
}

export function drawCameras(ctx, cameras, timeSeconds) {
  for (const camera of cameras) {
    const angle = cameraAngleAt(camera, timeSeconds);
    drawVisionCone(ctx, camera.x, camera.y, angle, TUNING.cameraRange, TUNING.cameraConeHalfAngle, 'rgba(255,93,115,0.20)', 1);
    ctx.fillStyle = '#2a2a33';
    ctx.fillRect(camera.x - 9, camera.y - 7, 18, 14);
    ctx.fillStyle = PALETTE.camera;
    ctx.beginPath();
    ctx.arc(camera.x + Math.cos(angle) * 8, camera.y + Math.sin(angle) * 8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ff8fa0';
    ctx.font = '10px Verdana, sans-serif';
    if (camera.x > 1200) {
      ctx.textAlign = 'right';
      ctx.fillText('CAM', camera.x - 12, camera.y + 3);
    } else {
      ctx.textAlign = 'left';
      ctx.fillText('CAM', camera.x + 12, camera.y + 3);
    }
  }
}

export function drawLasers(ctx, lasers) {
  for (const beam of lasers) {
    if (!beam.lit) {
      ctx.fillStyle = '#3a2f52';
      ctx.fillRect(beam.x1 - 4, beam.y1 - 3, 8, 6);
      ctx.fillRect(beam.x2 - 4, beam.y2 - 3, 8, 6);
      continue;
    }
    ctx.strokeStyle = 'rgba(255,46,99,0.25)';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(beam.x1, beam.y1);
    ctx.lineTo(beam.x2, beam.y2);
    ctx.stroke();
    ctx.strokeStyle = PALETTE.laser;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(beam.x1, beam.y1);
    ctx.lineTo(beam.x2, beam.y2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.laser;
    ctx.fillRect(beam.x1 - 4, beam.y1 - 4, 8, 8);
    ctx.fillRect(beam.x2 - 4, beam.y2 - 4, 8, 8);
  }
}

export function drawCoin(ctx, coin) {
  if (!coin) return;
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a5c14';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(coin.x, coin.y, 6, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawThief(ctx, thief, smokeTimer, cutProgress) {
  if (smokeTimer > 0) {
    ctx.fillStyle = 'rgba(200,200,210,0.35)';
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, 34, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#0b0a12';
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, thief.radius + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.thief;
  ctx.beginPath();
  ctx.arc(thief.x, thief.y, thief.radius, 0, Math.PI * 2);
  ctx.fill();
  // A black domino mask and a flat cap: the thief at a glance.
  ctx.fillStyle = '#0b0a12';
  ctx.fillRect(thief.x - 9, thief.y - 4, 18, 6);
  ctx.fillRect(thief.x - 8, thief.y - thief.radius, 16, 5);
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.arc(thief.x - 4, thief.y - 1, 1.8, 0, Math.PI * 2);
  ctx.arc(thief.x + 4, thief.y - 1, 1.8, 0, Math.PI * 2);
  ctx.fill();
  if (cutProgress > 0) {
    ctx.strokeStyle = PALETTE.gold;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, thief.radius + 8, -Math.PI / 2, -Math.PI / 2 + cutProgress * Math.PI * 2);
    ctx.stroke();
  }
}

export function drawAlarmMeter(ctx, alarm, x, y, w) {
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  ctx.fillRect(x - 6, y - 6, w + 12, 34);
  ctx.fillStyle = '#e8dcc0';
  ctx.font = 'bold 12px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('ALARM', x, y + 4);
  const color = alarm < 40 ? PALETTE.alarmLow : alarm < 70 ? PALETTE.alarmMid : PALETTE.alarmHigh;
  ctx.fillStyle = '#241a30';
  ctx.fillRect(x + 62, y - 4, w - 62, 14);
  ctx.fillStyle = color;
  ctx.fillRect(x + 62, y - 4, (w - 62) * (alarm / 100), 14);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 62, y - 4, w - 62, 14);
  ctx.fillStyle = '#e8dcc0';
  ctx.font = '11px Verdana, sans-serif';
  ctx.fillText(`${Math.round(alarm)}%`, x + w + 8, y + 8);
}

export function drawHud(ctx, level) {
  drawAlarmMeter(ctx, level.alarm, 24, 28, 300);
  ctx.fillStyle = '#e8dcc0';
  ctx.font = 'bold 13px Verdana, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE ${level.score}`, 24, 66);
  ctx.font = '12px Verdana, sans-serif';
  ctx.fillText(`◉ coins ${level.coins}   ☁ smoke ${level.smoke}`, 24, 86);
  const objective = !level.hasMainPainting
    ? 'Steal THE GILDED SUN, then reach the EXIT'
    : 'Got the Sun! Reach the EXIT door';
  ctx.textAlign = 'center';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.fillStyle = PALETTE.gold;
  ctx.fillText(objective, 640, 712);
  ctx.fillStyle = '#8f86a8';
  ctx.font = '11px Verdana, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`night ${Math.floor(level.timeSeconds / 60)}:${String(Math.floor(level.timeSeconds % 60)).padStart(2, '0')}`, 1240, 712);
}

export function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5,4,10,0.72)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = accent;
  ctx.font = 'bold 44px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(title, 640, 300);
  ctx.fillStyle = '#e8dcc0';
  ctx.font = '18px Georgia, serif';
  lines.forEach((line, i) => ctx.fillText(line, 640, 350 + i * 30));
  ctx.fillStyle = '#8f86a8';
  ctx.font = '14px Verdana, sans-serif';
  ctx.fillText('Press R to play again', 640, 350 + lines.length * 30 + 24);
}

export function drawTitleCard(ctx) {
  ctx.fillStyle = 'rgba(5,4,10,0.78)';
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 54px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('THE GILDED GALLERY', 640, 240);
  ctx.fillStyle = '#e8dcc0';
  ctx.font = '20px Georgia, serif';
  ctx.fillText('One thief. Three docents. Two cameras. One priceless sun.', 640, 290);
  ctx.font = '16px Georgia, serif';
  ctx.fillText('Steal THE GILDED SUN from the Grand Gallery and slip out the EXIT.', 640, 330);
  ctx.fillText('Stay out of the yellow cones and the pink camera sweeps.', 640, 360);
  ctx.fillText('Time the red lasers. Toss coins to lead a guard away.', 640, 390);
  ctx.fillText('WASD or arrows move · click tosses a coin · Q smoke · hold still by a painting to cut it free · R restart', 640, 420);
  ctx.fillStyle = PALETTE.gold;
  ctx.font = 'bold 18px Verdana, sans-serif';
  ctx.fillText('Click or press any key to begin', 640, 480);
}
