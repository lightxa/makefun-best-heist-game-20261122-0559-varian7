// Stealth rules: vision cones, camera sweeps, laser trips and the alarm
// meter. Every detection path is a pure function of level state, so a
// replay with the same inputs gives the same alarm.
import { TUNING } from './config.js';
import { hasLineOfSight, circleHitsRect } from './level.js';

export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function seenByCone(eyeX, eyeY, eyeAngle, range, halfAngle, targetX, targetY) {
  const dx = targetX - eyeX;
  const dy = targetY - eyeY;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return false;
  if (dist < 18) return true;
  const angle = Math.atan2(dy, dx);
  if (Math.abs(angleDifference(angle, eyeAngle)) > halfAngle) return false;
  return hasLineOfSight(eyeX, eyeY, targetX, targetY);
}

export function guardConeAngle(guard) {
  return guard.angle;
}

export function cameraAngleAt(camera, timeSeconds) {
  const t = (timeSeconds + camera.phase) % camera.period;
  const swing = Math.sin((t / camera.period) * Math.PI * 2);
  return camera.baseAngle + swing * camera.sweep;
}

export function laserIsLit(beam, timeSeconds) {
  const cycle = beam.onSeconds + beam.offSeconds;
  const t = (timeSeconds + beam.phase) % cycle;
  return t < beam.onSeconds;
}

// Distance from a point to a line segment; the thief trips a lit beam by
// touching it.
export function distanceToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  let t = lenSq === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const cx = x1 + t * dx;
  const cy = y1 + t * dy;
  return Math.hypot(px - cx, py - cy);
}

// One simulation step. Returns a list of events the main loop can announce.
export function stepStealth(level, dt) {
  const events = [];
  const thief = level.thief;
  const blinded = level.smokeTimer > 0;
  let seen = false;

  for (const guard of level.guards) {
    if (!blinded && seenByCone(guard.x, guard.y, guard.angle, TUNING.guardConeRange, TUNING.guardConeHalfAngle, thief.x, thief.y)) {
      seen = true;
      level.alarm = Math.min(TUNING.alarmCaughtAt, level.alarm + TUNING.alarmGuardRate * dt);
      if (!guard.alerted) {
        guard.alerted = true;
        events.push({ type: 'spotted', by: guard.name });
      }
    } else if (guard.alerted) {
      guard.alerted = false;
    }
    const dist = Math.hypot(thief.x - guard.x, thief.y - guard.y);
    if (dist < TUNING.guardRadius + thief.radius + 2) {
      level.caught = true;
      level.caughtReason = `Caught by ${guard.name} in the gallery.`;
      events.push({ type: 'caught', by: guard.name });
    }
  }

  for (const camera of level.cameras) {
    const angle = cameraAngleAt(camera, level.timeSeconds);
    if (!blinded && seenByCone(camera.x, camera.y, angle, TUNING.cameraRange, TUNING.cameraConeHalfAngle, thief.x, thief.y)) {
      seen = true;
      level.alarm = Math.min(TUNING.alarmCaughtAt, level.alarm + TUNING.alarmCameraRate * dt);
      events.push({ type: 'camera' });
    }
  }

  for (const beam of level.lasers) {
    const lit = laserIsLit(beam, level.timeSeconds);
    beam.lit = lit;
    if (lit && distanceToSegment(thief.x, thief.y, beam.x1, beam.y1, beam.x2, beam.y2) < thief.radius + 3) {
      if (!beam.justHit) {
        level.alarm = Math.min(TUNING.alarmCaughtAt, level.alarm + TUNING.alarmLaserHit);
        events.push({ type: 'laser' });
        beam.justHit = true;
      }
    } else if (!lit || distanceToSegment(thief.x, thief.y, beam.x1, beam.y1, beam.x2, beam.y2) > thief.radius + 12) {
      beam.justHit = false;
    }
  }

  if (!seen) {
    level.alarm = Math.max(0, level.alarm - TUNING.alarmDecay * dt);
  }
  if (level.alarm >= TUNING.alarmCaughtAt && !level.caught) {
    level.caught = true;
    level.caughtReason = 'The alarm hit 100 — the museum locked down and the guards closed in.';
    events.push({ type: 'alarm' });
  }
  return events;
}

// The thief stands by a painting and holds still to cut it from its frame.
export function paintingInReach(level) {
  return level.paintings.find((p) => {
    if (p.stolen) return false;
    const dist = Math.hypot(level.thief.x - p.grabX, level.thief.y - p.grabY);
    return dist < 46;
  });
}

export function coinLuresGuard(level, coinX, coinY) {
  let best = null;
  let bestDist = Infinity;
  for (const guard of level.guards) {
    const d = Math.hypot(guard.x - coinX, guard.y - coinY);
    if (d < bestDist) {
      bestDist = d;
      best = guard;
    }
  }
  if (best && bestDist < 320) {
    best.investigateX = coinX;
    best.investigateY = coinY;
    best.investigateTimer = 5;
    return best;
  }
  return null;
}

export { circleHitsRect };
