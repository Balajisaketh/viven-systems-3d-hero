// The hero shot, as a list of beats the camera eases between.
//
// Beat 1 is the Blender viewport composition: the elevated three-quarter view
// of the campus, held while the page settles. Beat 2 is a slow push onto the
// entrance. Beat 3 carries us through the open doors into the reception, where
// the shot ends on the lit VIVEN SYSTEMS wall.
//
// Blender is Z-up and the glTF export is Y-up, so aim points are written in the
// Blender layout (readable against the .blend) and converted on the way out:
//   gltf = (bx, bz, -by)
//
// Each beat is: azimuth/elevation of the camera around the aim point (degrees,
// Blender convention), distance back along that axis, and field of view.
//
// The whole move is one physical approach - 185 units out, down to 45, to the
// doorway, to rest inside - with the lens widening as we close. Verified by
// sampling the path: the camera crosses the facade at x -0.2, z 3.3, which is
// the middle of the 8-wide doorway at 60% of its 5.4 height.

import {
  OFFICES,
  officePose,
  OFFICE_HOLD,
  OFFICE_TRAVEL,
} from "./officeTour.js";

export const HERO_NEAR = 0.5;
export const HERO_FAR = 4000;
export const HERO_FRAMED_ASPECT = 16 / 9;

export const BEATS = [
  // Wide establishing hold. These numbers are the framing verified by
  // rendering it in Blender (camera at 89.6, 151.3, 92.2 on a 38mm lens over
  // a 36mm sensor) - the whole campus in frame: tower, main volume, plaza and
  // trees. fov is three.js's *vertical* angle, so the 38mm horizontal lens
  // converts as 2*atan((36*9/16)/2 / 38) = 29.8 degrees.
  { t: 0.0, az: 58, el: 24, dist: 185, fov: 29.8, aim: [0, 8, 17] },
  { t: 2.0, az: 58, el: 24, dist: 185, fov: 29.8, aim: [0, 8, 17] },
  // Slow push onto the entrance: doors are x -4..4, 5.4 tall, at y 20.2. The
  // camera closes to 45 units out rather than staying back on a long lens -
  // a telephoto push leaves the camera 200 units away, and then the run to the
  // doorway has to cover that ground in a fraction of the shot, which reads as
  // a lunge. Approaching physically keeps the travel speed even throughout.
  { t: 6.4, az: 62, el: 8, dist: 45, fov: 30, aim: [0, 20.2, 4.5] },
  // The threshold. This beat exists to put the camera *in the doorway*: it
  // lands at Blender (0, 20.2, 3.1), which is on the door centreline and just
  // over half door height - under the 5.4 head and well under the entrance
  // canopy at 6.1. Without it the path crossed the facade at 7.4 and flew in
  // through the glass above the doors.
  // fov 55 here on purpose: wide enough that the jambs and the parted door
  // leaves sweep past the edges of frame as we go through, which is what makes
  // it feel like entering rather than cutting to an interior.
  { t: 8.7, az: 64, el: -2.5, dist: 9.13, fov: 55, aim: [-4, 12, 3.5] },
  // Settling into the lobby on the composition the reception is built for:
  // marble feature wall and desk filling the right of frame, the values wall
  // and lounge running off to the left.
  //
  // The camera holds the height it came through the door at rather than rising
  // into the room: elevation 2 over an aim at 3.4 rests it at z 3.8, against
  // 3.2 at the threshold. Walking in, not lifting off.
  //
  // Aimed down the room rather than at the feature wall, so the shot holds both
  // sides: reception right, lounge and coffee counter left. On a 60 degree lens
  // from (-2, 19) anything on the left has to sit within |x| < depth * 1.07 to
  // be in frame at all, which is what the lounge layout is built around.
  { t: 9.9, az: 85, el: 2, dist: 12, fov: 60, aim: [-3, 7, 3.4] },
];

export const HOLD_SECONDS = BEATS[1].t;
export const ARRIVAL_END = BEATS[BEATS.length - 1].t;

// Scene 2 - Floor tour: after settling in the reception, the camera backs out
// and rises past the three new rooftop floors in order - the open-plan first
// floor, the canteen above it, then the CEO/Founders' office above that -
// holding on each so they read as distinct stops rather than a blur. Unlike
// the arrival, each leg here has its own fixed duration - the whole point is
// a deliberate pause at every stop, so it uses plain per-segment easing
// instead of the arrival's single warped curve.
const RECEPTION_HOLD = 2; // seconds resting in the reception before departing
const MOVE_SECONDS = 2.6; // seconds for each move between stops
const FLOOR_HOLD = 5; // seconds held on each floor

const RECEPTION_POSE = BEATS[BEATS.length - 1];

export const TOUR_STOPS = [
  // Back out from the reception close-up to the same wide reception framing,
  // then hold - this is the "wait" on the stop we already arrived at.
  { ...RECEPTION_POSE, hold: RECEPTION_HOLD },
  // The three floors stack on the podium roof (z 15), each 4 units tall and
  // 46 x 16 on plan, fronting the plaza behind their own glazing at y 19. Aim
  // points sit at each room's centre; the camera holds outside the glass.
  // 1st floor - the Viven Systems workspace (z 15..19).
  { az: 70, el: 11, dist: 34, fov: 40, aim: [0, 11, 17.0], hold: FLOOR_HOLD },
  // 2nd floor - the canteen (z 19..23).
  { az: 72, el: 9, dist: 35, fov: 38, aim: [0, 11, 21.0], hold: FLOOR_HOLD },
  // 3rd floor - the executive offices (z 23..27). Rather than one wide hold on
  // the whole floor, the camera works along it office by office, screen-left to
  // screen-right, pausing on each so its occupants read.
  ...OFFICES.map((office) => ({
    ...officePose(office),
    hold: office.hold ?? OFFICE_HOLD,
    move: office.move ?? OFFICE_TRAVEL,
    office: office.id,
  })),
  // Pull all the way back out to the same wide establishing framing the shot
  // opened on - the whole campus in frame - so the tour bookends itself
  // instead of ending on a close interior.
  { ...BEATS[0], hold: FLOOR_HOLD },
];

function easeInOutQuad(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

// [{ startAt, endAt, from, to, holdEndsAt }] - one entry per TOUR_STOPS move+hold.
const TOUR_SCHEDULE = (() => {
  let t = ARRIVAL_END;
  const schedule = [];
  let prev = RECEPTION_POSE;
  for (const stop of TOUR_STOPS) {
    const moveStart = t;
    const moveEnd =
      t + (stop === TOUR_STOPS[0] ? 0 : stop.move ?? MOVE_SECONDS);
    const holdEnd = moveEnd + stop.hold;
    schedule.push({ moveStart, moveEnd, holdEnd, from: prev, to: stop });
    prev = stop;
    t = holdEnd;
  }
  return schedule;
})();

export const HOLD_SECONDS_PER_STOP = FLOOR_HOLD;

/**
 * Which executive office the camera is currently presenting, or null. Only
 * reported once the camera has arrived and is holding - the card should appear
 * on the stop, not while the camera is still swinging toward it.
 */
export function getActiveOffice(t) {
  for (const leg of TOUR_SCHEDULE) {
    if (!leg.to.office) continue;
    if (t >= leg.moveEnd && t < leg.holdEnd) {
      return OFFICES.find((o) => o.id === leg.to.office) || null;
    }
  }
  return null;
}

/**
 * When an office stop begins and ends, in seconds. The walking founder needs
 * this to time his move to the hold he is being presented on, rather than
 * guessing at the schedule.
 */
export function getOfficeWindow(id) {
  const leg = TOUR_SCHEDULE.find((l) => l.to.office === id);
  return leg ? { start: leg.moveEnd, end: leg.holdEnd } : null;
}

/**
 * The two cards that play on the way up. Both run from the moment the camera
 * leaves the floor below through the whole of the stop they belong to, so they
 * are on screen as the climb starts rather than arriving after it.
 *
 * TOUR_SCHEDULE[0] is the reception hold, [1] the first floor, [2] the canteen.
 * Services go on the first lift off the ground; the success story goes on the
 * next one up.
 */
const SERVICES_LEG = TOUR_SCHEDULE[1];
const SUCCESS_LEG = TOUR_SCHEDULE[2];

export function isServicesMoment(t) {
  if (!SERVICES_LEG) return false;
  return t >= SERVICES_LEG.moveStart && t < SERVICES_LEG.holdEnd;
}

// Where the chapter buttons jump to. Both land a hair after the move starts so
// the card is already up as the camera begins to travel.
export const SERVICES_AT = SERVICES_LEG ? SERVICES_LEG.moveStart + 0.05 : 0;
export const SUCCESS_AT = SUCCESS_LEG ? SUCCESS_LEG.moveStart + 0.05 : 0;

// Home: the final leg, entered at its start so the camera performs the
// zoom-out to the wide campus framing and the closing line follows it.
export const HOME_AT = TOUR_SCHEDULE[TOUR_SCHEDULE.length - 1].moveStart + 0.05;

// About us: the climb onto the executive floor, where the camera starts
// shifting from office to office across the three of them.
const ABOUT_LEG = TOUR_SCHEDULE.find((l) => l.to.office === OFFICES[0].id);
export const ABOUT_AT = ABOUT_LEG ? ABOUT_LEG.moveStart + 0.05 : 0;

export function isSuccessMoment(t) {
  if (!SUCCESS_LEG) return false;
  return t >= SUCCESS_LEG.moveStart && t < SUCCESS_LEG.holdEnd;
}
export const SHOT_END = TOUR_SCHEDULE[TOUR_SCHEDULE.length - 1].holdEnd;

// The closing line comes up a beat after the camera settles on the final wide
// framing - not at the end of that hold, which left it waiting out the whole
// stop before anything appeared.
export const CLOSING_AT =
  TOUR_SCHEDULE[TOUR_SCHEDULE.length - 1].moveEnd + 0.7;

// The doors part while the camera is still travelling, and finish well before
// we reach the threshold - so we arrive at an open door rather than waiting.
export const DOOR_OPEN_AT = 4.6;
export const DOOR_OPEN_SECONDS = 1.9;

// Clock time is warped through the ease (see sampleHeroShot), so the threshold
// beat at path-time 8.7 actually lands around 7.3s. The overlay stays off until
// just after that, once we are through and settling inside.
export const INSIDE_AT = 7.9;

export function blenderToGltf([bx, by, bz]) {
  return [bx, bz, -by];
}

/** Unit vector from the aim point back toward the camera, in glTF space. */
export function eyeDir(azimuthDeg, elevationDeg) {
  const az = (azimuthDeg * Math.PI) / 180;
  const el = (elevationDeg * Math.PI) / 180;
  return blenderToGltf([
    Math.cos(az) * Math.cos(el),
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
  ]);
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

const lerp = (a, b, k) => a + (b - a) * k;

/**
 * Samples the shot at time t. Distance is interpolated in log space: 200 -> 9
 * linearly would crawl for four seconds and then lunge, where log space reads
 * as a steady approach.
 *
 * The easing is applied once across the whole move rather than per segment.
 * Easing each segment separately brings the camera to a dead stop at every
 * beat - most visibly a two-second hover in the doorway - so instead the beat
 * times are treated as milestones along one path, and clock time is warped
 * through the ease before looking them up. One accelerate at the start, one
 * settle at the end, constant travel in between.
 */
function sampleArrival(t, out) {
  const start = BEATS[1].t;
  const end = ARRIVAL_END;
  const u = Math.min(Math.max((t - start) / (end - start), 0), 1);
  const warped = start + (end - start) * easeInOutCubic(u);

  let i = 0;
  while (i < BEATS.length - 2 && warped >= BEATS[i + 1].t) i += 1;
  const a = BEATS[i];
  const b = BEATS[i + 1];
  const span = b.t - a.t;
  const k = span > 0 ? Math.min(Math.max((warped - a.t) / span, 0), 1) : 1;

  out.az = lerp(a.az, b.az, k);
  out.el = lerp(a.el, b.el, k);
  out.fov = lerp(a.fov, b.fov, k);
  out.dist = Math.exp(lerp(Math.log(a.dist), Math.log(b.dist), k));
  out.aim = out.aim || [0, 0, 0];
  for (let axis = 0; axis < 3; axis += 1) {
    out.aim[axis] = lerp(a.aim[axis], b.aim[axis], k);
  }
  // 0 outside, 1 once the shot has come to rest in the lobby - used to stop
  // narrow-viewport framing from dollying the camera back through the wall.
  out.insideness = i >= BEATS.length - 3 ? Math.min(1, k + i - (BEATS.length - 3)) : 0;
  return out;
}

function sampleTour(t, out) {
  let leg = TOUR_SCHEDULE[0];
  for (const entry of TOUR_SCHEDULE) {
    leg = entry;
    if (t < entry.holdEnd) break;
  }
  const moveSpan = leg.moveEnd - leg.moveStart;
  const k =
    moveSpan > 0
      ? easeInOutQuad(Math.min(Math.max((t - leg.moveStart) / moveSpan, 0), 1))
      : 1;

  out.az = lerp(leg.from.az, leg.to.az, k);
  out.el = lerp(leg.from.el, leg.to.el, k);
  out.fov = lerp(leg.from.fov, leg.to.fov, k);
  out.dist = Math.exp(lerp(Math.log(leg.from.dist), Math.log(leg.to.dist), k));
  out.aim = out.aim || [0, 0, 0];
  for (let axis = 0; axis < 3; axis += 1) {
    out.aim[axis] = lerp(leg.from.aim[axis], leg.to.aim[axis], k);
  }
  // We are always "inside" during the floor tour - no outdoor narrow-viewport
  // dolly correction needed once the arrival has handed off.
  out.insideness = 1;
  return out;
}

export function sampleHeroShot(t, out = {}) {
  if (t <= ARRIVAL_END) return sampleArrival(t, out);
  return sampleTour(Math.min(t, SHOT_END), out);
}

const first = BEATS[0];
const firstDir = eyeDir(first.az, first.el);
const firstAim = blenderToGltf(first.aim);

export const HERO_EYE = [
  firstAim[0] + firstDir[0] * first.dist,
  firstAim[1] + firstDir[1] * first.dist,
  firstAim[2] + firstDir[2] * first.dist,
];
export const WIDE_FOV = first.fov;
