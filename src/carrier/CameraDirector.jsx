import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { getSequenceState } from "./timeline.js";

/**
 * Drives the default R3F camera through the cinematic timeline each frame.
 * Position/look-at/FOV are smoothed with a lerp so the per-segment camera
 * cuts still read as deliberate framing changes rather than teleports,
 * while motion *within* a segment stays buttery.
 */
export default function CameraDirector({ onPhaseChange }) {
  const { camera } = useThree();
  const lookTarget = useRef(new THREE.Vector3(0, 4, 0));
  const lastPhase = useRef(null);
  const lastFinished = useRef(false);

  useFrame(({ clock }) => {
    const s = getSequenceState(clock.elapsedTime);

    if (s.phase !== lastPhase.current || s.finished !== lastFinished.current) {
      lastPhase.current = s.phase;
      lastFinished.current = s.finished;
      onPhaseChange?.(s);
    }

    camera.position.lerp(s.camPos, 0.09);
    lookTarget.current.lerp(s.camLook, 0.12);
    camera.lookAt(lookTarget.current);

    if (camera.isPerspectiveCamera) {
      camera.fov += (s.camFov - camera.fov) * 0.08;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
