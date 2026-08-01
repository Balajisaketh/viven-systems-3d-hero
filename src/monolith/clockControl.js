// Lets the HTML overlay jump the film to a moment - the chapter buttons - by
// handing a target time to the render loop rather than reaching into the clock
// from outside it. TimeControl (mounted first inside the Canvas) applies the
// value at the top of the next frame, before the camera samples the timeline,
// so a seek lands on exactly the pose that moment holds.

let pending = null;

export function seekTo(seconds) {
  pending = seconds;
}

export function consumeSeek() {
  const value = pending;
  pending = null;
  return value;
}
