import { useFrame } from "@react-three/fiber";
import { consumeSeek } from "./clockControl.js";

/**
 * Applies pending seeks from the overlay's chapter buttons.
 *
 * Mounted as the first child of the Canvas so its frame subscription runs
 * before the camera's: at equal priority R3F calls subscribers in mount order,
 * and the clock has to be moved before HeroCamera samples the timeline off it,
 * or the jump lands a frame late showing the old pose.
 */
export default function TimeControl() {
  useFrame(({ clock }) => {
    const target = consumeSeek();
    if (target === null) return;
    // THREE.Clock advances elapsedTime by the frame delta, so assigning it is
    // all a jump takes - everything downstream reads from this one value.
    clock.elapsedTime = target;
  });

  return null;
}
