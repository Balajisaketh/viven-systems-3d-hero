// Scene 1 - Arrival: a wide establishing beat on the campus, a slow push onto
// the entrance, the doors parting, and a move through them into the reception.
// The camera lives in HeroCamera.jsx / heroView.js and the doors in
// Entrance.jsx; this just tracks elapsed time so the HTML overlay knows when to
// reveal the "Engineering Tomorrow" title - which is held back until we are
// through the doorway and inside the building.
import {
  INSIDE_AT,
  SHOT_END,
  CLOSING_AT,
  getActiveOffice,
  isServicesMoment,
  isSuccessMoment,
} from "./heroView.js";

export const TOTAL_DURATION = SHOT_END;

export function getMonolithState(tRaw) {
  const inside = tRaw >= INSIDE_AT;
  return {
    phase: inside ? "doors-open" : "approach",
    // 'finished' drives the closing line, so it fires when the camera has
    // arrived on the final wide framing rather than when the hold expires.
    finished: tRaw >= CLOSING_AT,
    // Set while the camera is holding on an executive office, so the overlay
    // can name whose office we are looking into.
    office: getActiveOffice(tRaw),
    // The two climb cards: services on the first lift, the success story on
    // the next one up.
    services: isServicesMoment(tRaw),
    success: isSuccessMoment(tRaw),
  };
}
