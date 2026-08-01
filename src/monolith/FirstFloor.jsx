import React, { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { applyGlass } from "./glass.js";

/**
 * The open-plan "first floor" - desks, dual monitors, LED ceiling strips and
 * the "INNOVATE. BUILD. TRANSFORM." wall display - sitting directly on top of
 * the podium roof (Blender z ~15..19), with the canteen stacked above it.
 * Modelled and exported separately, same as Canteen/ExecOffices - everything
 * here is named Flr_*.
 */

const FIRST_FLOOR_URL = "/models/first-floor.glb";

export default function FirstFloor() {
  const { scene } = useGLTF(FIRST_FLOOR_URL);

  const room = useMemo(() => {
    const root = scene.clone(true);
    root.children
      .filter((child) => !child.name.startsWith("Flr_"))
      .forEach((stray) => root.remove(stray));
    return root;
  }, [scene]);

  useLayoutEffect(() => {
    room.traverse((obj) => {
      if (obj.isLight) {
        if (obj.isPointLight) {
          obj.intensity = Math.min(obj.intensity, 6);
          obj.distance = obj.distance > 0 ? Math.min(obj.distance, 14) : 9;
          obj.decay = Math.max(obj.decay, 2);
        }
        return;
      }
      if (!obj.isMesh) return;
      obj.frustumCulled = false;
      obj.castShadow = true;
      obj.receiveShadow = true;
      applyGlass(obj);
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m) return;
        if (m.emissive && m.emissive.getHex() !== 0x000000) {
          m.emissiveIntensity = Math.max(m.emissiveIntensity, 1.6);
          m.toneMapped = false;
        }
        if (/Text|WallDisplay_Panel/i.test(obj.name)) m.side = THREE.DoubleSide;
        m.needsUpdate = true;
      });
    });
  }, [room]);

  return (
    <group name="FirstFloor">
      <primitive object={room} />
    </group>
  );
}

useGLTF.preload(FIRST_FLOOR_URL);
