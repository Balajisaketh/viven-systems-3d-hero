import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { getMonolithState } from "./timeline.js";

/**
 * The actual camera move now comes from the Blender-exported animation
 * (played back by BlenderModel via drei's useAnimations). This component
 * just watches the same timeline for phase transitions so the HTML overlay
 * can react, without touching the camera itself.
 */
export default function CameraDirector({ onState }) {
  const lastPhase = useRef(null);
  const lastFinished = useRef(false);
  const lastOffice = useRef(null);
  const lastServices = useRef(false);
  const lastSuccess = useRef(false);

  useFrame(({ clock }) => {
    const s = getMonolithState(clock.elapsedTime);
    const officeId = s.office?.id ?? null;
    if (
      s.phase !== lastPhase.current ||
      s.finished !== lastFinished.current ||
      officeId !== lastOffice.current ||
      s.services !== lastServices.current ||
      s.success !== lastSuccess.current
    ) {
      lastPhase.current = s.phase;
      lastFinished.current = s.finished;
      lastOffice.current = officeId;
      lastServices.current = s.services;
      lastSuccess.current = s.success;
      onState?.(s);
    }
  });

  return null;
}
