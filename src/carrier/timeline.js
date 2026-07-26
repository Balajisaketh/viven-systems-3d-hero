import * as THREE from "three";

// ---------------------------------------------------------------------------
// Easing
// ---------------------------------------------------------------------------
const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeInCubic = (t) => t * t * t;
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
export const smoothstep = (t) => t * t * (3 - 2 * t);

/** Remap global time into a local 0-1 progress for a [start,end] window, eased. */
function windowProgress(t, start, end, ease = easeInOutCubic) {
  if (t <= start) return 0;
  if (t >= end) return 1;
  return ease(clamp01((t - start) / (end - start)));
}

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lerpV = (a, b, k) => a.clone().lerp(b, k);

// ---------------------------------------------------------------------------
// Scene-space keyframe positions (arbitrary "meters", stylized not to-scale)
// Deck runs along X (stern -X, bow +X). Island sits on -Z side. Catapult
// track runs down the +Z lane, clear of the island.
// ---------------------------------------------------------------------------
export const DECK = { length: 62, width: 18, y: 0 };
export const CATAPULT_Z = 3.2;

const JET_START = V(-24, 0.95, CATAPULT_Z);
const JET_CATAPULT_END = V(22, 1.05, CATAPULT_Z);
const JET_TAKEOFF = V(34, 4.5, CATAPULT_Z - 0.4);
const JET_CLIMB = V(58, 15, CATAPULT_Z - 2.5);
const JET_HERO_FAR = V(95, 34, CATAPULT_Z - 6);

// ---------------------------------------------------------------------------
// Timeline segments (seconds)
// ---------------------------------------------------------------------------
export const T = {
  deckHoldEnd: 3.2,
  spoolEnd: 6.2,
  launchEnd: 10.2,
  climbEnd: 13.6,
  establishEnd: 16.8,
};
export const TOTAL_DURATION = T.establishEnd;

/**
 * Returns the full scene state for a given elapsed time `t` (seconds),
 * looping gracefully into a slow idle drift once the sequence finishes.
 */
export function getSequenceState(tRaw) {
  const looping = tRaw > TOTAL_DURATION;
  const idleT = looping ? tRaw - TOTAL_DURATION : 0;
  const t = Math.min(tRaw, TOTAL_DURATION);

  // ---- Jet position / rotation ----
  let jetPos, jetPitch, jetRoll, glow, gearUp, shake;

  if (t <= T.deckHoldEnd) {
    jetPos = JET_START.clone();
    jetPitch = 0;
    jetRoll = 0;
    glow = 0.08 + 0.1 * smoothstep(clamp01(t / T.deckHoldEnd));
    gearUp = 0;
    shake = 0;
  } else if (t <= T.spoolEnd) {
    const p = windowProgress(t, T.deckHoldEnd, T.spoolEnd, smoothstep);
    jetPos = JET_START.clone();
    jetPitch = 0;
    jetRoll = 0;
    glow = 0.18 + p * 0.82;
    gearUp = 0;
    shake = p * 0.06;
  } else if (t <= T.launchEnd) {
    const p = windowProgress(t, T.spoolEnd, T.launchEnd, easeInCubic);
    jetPos = lerpV(JET_START, JET_CATAPULT_END, p);
    // Nose stays level until the very end of the stroke, then a gentle lift
    const liftP = smoothstep(clamp01((p - 0.82) / 0.18));
    jetPos.y += liftP * 0.6;
    jetPitch = liftP * 4; // degrees, level -> slight nose-up as it leaves the shuttle
    jetRoll = 0;
    glow = 1.0;
    gearUp = 0;
    shake = 0.08 * (1 - p * 0.5);
  } else if (t <= T.climbEnd) {
    const p = windowProgress(t, T.launchEnd, T.climbEnd, easeOutCubic);
    const mid = lerpV(JET_CATAPULT_END, JET_TAKEOFF, Math.min(1, p * 2));
    jetPos = p < 0.5 ? mid : lerpV(JET_TAKEOFF, JET_CLIMB, (p - 0.5) * 2);
    jetPitch = 4 + p * 14; // climbing away
    jetRoll = p * 5; // slight bank into the establishing pull-back
    glow = 1.0;
    gearUp = smoothstep(clamp01((t - T.launchEnd) / 1.4));
    shake = 0;
  } else {
    const p = windowProgress(t, T.climbEnd, T.establishEnd, easeOutCubic);
    jetPos = lerpV(JET_CLIMB, JET_HERO_FAR, p);
    jetPitch = 18 - p * 4;
    jetRoll = 5 - p * 5;
    glow = 1.0;
    gearUp = 1;
    shake = 0;
  }

  if (looping) {
    // Slow ambient drift once parked in the final establishing frame, so the
    // hero shot never looks frozen while waiting for a replay.
    jetPos = JET_HERO_FAR.clone();
    jetPos.x += Math.sin(idleT * 0.08) * 1.2;
    jetPos.y += Math.sin(idleT * 0.11) * 0.6;
    jetPitch = 14;
    jetRoll = Math.sin(idleT * 0.07) * 2;
    glow = 1.0;
    gearUp = 1;
    shake = 0;
  }

  // ---- Camera ----
  let camPos, camLook, camFov = 45;

  if (t <= T.spoolEnd) {
    // Camera_02 "Deck" — low, close, framing the nozzles/cockpit.
    const push = windowProgress(t, 0, T.spoolEnd, smoothstep);
    camPos = lerpV(V(-27, 1.6, CATAPULT_Z + 5.5), V(-25.5, 1.4, CATAPULT_Z + 3.8), push);
    camLook = jetPos.clone().add(V(2, 0.4, 0));
    camFov = 38;
  } else if (t <= T.launchEnd) {
    // Camera_03 "Chase" — behind and low, tracking the shuttle stroke.
    camPos = jetPos.clone().add(V(-9, 1.4, -3.5));
    camLook = jetPos.clone().add(V(4, 0.3, 0));
    camFov = 42;
  } else if (t <= T.climbEnd) {
    // Camera_04 "Hero" — front three-quarter, looking back at the aircraft.
    const p = windowProgress(t, T.launchEnd, T.climbEnd, easeInOutCubic);
    camPos = lerpV(V(30, 8, 12), V(66, 22, 16), p);
    camLook = jetPos.clone();
    camFov = 40;
  } else {
    // Camera_01 "Establishing" — wide pull-back revealing the whole carrier.
    const p = windowProgress(t, T.climbEnd, T.establishEnd, easeInOutCubic);
    camPos = lerpV(V(66, 22, 16), V(-10, 26, 70), p);
    camLook = lerpV(jetPos, V(10, 6, 0), p * 0.8);
    camFov = 32 + p * 10;
  }

  if (looping) {
    const p = clamp01((idleT % 20) / 20);
    camPos = V(-10, 26, 70).clone().add(
      V(Math.sin(idleT * 0.05) * 6, Math.sin(idleT * 0.035) * 2, Math.cos(idleT * 0.05) * 4)
    );
    camLook = lerpV(V(10, 6, 0), jetPos, 0.35);
    camFov = 34;
  }

  return {
    jetPos,
    jetPitchDeg: jetPitch,
    jetRollDeg: jetRoll,
    glow,
    gearUp,
    shake,
    camPos,
    camLook,
    camFov,
    phase:
      t <= T.deckHoldEnd
        ? "deck-hold"
        : t <= T.spoolEnd
        ? "spool"
        : t <= T.launchEnd
        ? "launch"
        : t <= T.climbEnd
        ? "climb"
        : "establish",
    finished: looping,
  };
}
