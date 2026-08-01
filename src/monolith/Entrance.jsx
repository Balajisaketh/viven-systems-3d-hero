import React, { useMemo, useRef, useLayoutEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { MODEL_URL } from "./BlenderModel.jsx";
import { DOOR_OPEN_AT, DOOR_OPEN_SECONDS } from "./heroView.js";

/**
 * The entrance beat: the doors part just as the push-in settles, so the arrival
 * and the opening read as one gesture - we walk up, the doors open for us.
 *
 * The GLB keyframes the doors at frames 360-450 (12-15s), which is timed to the
 * old 15s Blender cinematic and lands long after this hero's 4.5s push. So
 * BlenderModel leaves the door clips unplayed and they are driven here instead.
 *
 * Also hides Entrance_Reveal: a 9 x 6 concrete plate the model parks in the
 * doorway. It sits square to camera at the end of the push and reads as a flat
 * tan card blocking the door - and the camera now flies straight through where
 * it stood.
 */

// Doors are 3.95 wide each, hinged apart from the centre at Blender x = 0.
const DOOR_SLIDE = 3.9;

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

export default function Entrance() {
  const { scene } = useGLTF(MODEL_URL);
  const openedRef = useRef(0);

  const parts = useMemo(() => {
    const left = scene.getObjectByName("Campus_Door_Left");
    const right = scene.getObjectByName("Campus_Door_Right");
    const reveal = scene.getObjectByName("Entrance_Reveal");
    return {
      left,
      right,
      reveal,
      leftBaseX: left ? left.position.x : 0,
      rightBaseX: right ? right.position.x : 0,
    };
  }, [scene]);

  useLayoutEffect(() => {
    if (parts.reveal) parts.reveal.visible = false;
    return () => {
      if (parts.reveal) parts.reveal.visible = true;
      if (parts.left) parts.left.position.x = parts.leftBaseX;
      if (parts.right) parts.right.position.x = parts.rightBaseX;
    };
  }, [parts]);

  useFrame(({ clock }) => {
    const k = easeOutCubic(
      THREE.MathUtils.clamp(
        (clock.elapsedTime - DOOR_OPEN_AT) / DOOR_OPEN_SECONDS,
        0,
        1
      )
    );
    if (k === openedRef.current) return;
    openedRef.current = k;

    // Blender x maps straight through to glTF x, so the slide axis is the same.
    if (parts.left) parts.left.position.x = parts.leftBaseX - DOOR_SLIDE * k;
    if (parts.right) parts.right.position.x = parts.rightBaseX + DOOR_SLIDE * k;
  });

  // What is behind the doors is the reception itself (Reception.jsx) - the
  // camera travels into it, so there is nothing to fake here.
  return null;
}
