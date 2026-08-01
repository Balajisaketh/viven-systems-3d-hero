import React, { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { applyGlass } from "./glass.js";
import FounderWalk from "./FounderWalk.jsx";

/**
 * CEO office and Founders' office (Gopi Krishna, Venkatnarayana), stacked on
 * top of the canteen roof. Modelled and exported separately from
 * campus-01-arrival.glb, same as Canteen - everything here is named Exo_*.
 */

const EXEC_URL = "/models/exec-offices.glb";

export default function ExecOffices() {
  const { scene } = useGLTF(EXEC_URL);

  const room = useMemo(() => {
    const root = scene.clone(true);
    root.children
      .filter((child) => !child.name.startsWith("Exo_"))
      .forEach((stray) => root.remove(stray));
    return root;
  }, [scene]);

  useLayoutEffect(() => {
    room.traverse((obj) => {
      if (obj.isLight) {
        if (obj.isPointLight) {
          obj.intensity = Math.min(obj.intensity, 5);
          obj.distance = obj.distance > 0 ? Math.min(obj.distance, 10) : 7;
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
        // The frosted partition and desk nameplates are single planes; the
        // partition needs to read from both offices and the nameplates from
        // above and from the meeting-table side.
        if (/FrostedGlass|Nameplate/i.test(obj.name)) m.side = THREE.DoubleSide;
        m.needsUpdate = true;
      });
    });
  }, [room]);

  return (
    <group name="ExecOffices">
      <primitive object={room} />
      {/* Drives the founder out from behind his desk on his stop. It has to be
          handed the cloned root - the source gltf scene is not what renders. */}
      <FounderWalk root={room} />
    </group>
  );
}

useGLTF.preload(EXEC_URL);
