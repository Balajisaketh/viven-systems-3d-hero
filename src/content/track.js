import * as THREE from "three";

// Closed-loop waypoints (x, z) for the racetrack, fed into a Catmull-Rom
// spline. Shared by the visual track/curbs, the AI cars that lap it, and
// (indirectly) the section zone placement, so everything lines up.
export const trackPoints = [
  [0, 8],
  [10, 6],
  [16, -2],
  [12, -8],
  [16, -14],
  [10, -24],
  [0, -27],
  [-10, -24],
  [-16, -14],
  [-16, -2],
  [-10, 6],
];

export const TRACK_WIDTH = 9;

export function getTrackCurve() {
  const points = trackPoints.map(([x, z]) => new THREE.Vector3(x, 0, z));
  return new THREE.CatmullRomCurve3(points, true, "catmullrom", 0.55);
}
