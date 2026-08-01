import React, { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { applyGlass, GLASS_RENDER_ORDER } from "./glass.js";

/**
 * The reception the camera ends up in, plus the two pieces of signage on the
 * outside of the building - the wordmark over the entrance and the logo at the
 * crown of the tower. All of it is modelled in the .blend under the
 * "Web_Reception" collection and exported to this file.
 *
 * The room sits inside the podium volume (Blender x -17..17, y 3.5..20.1,
 * z 0..7.28), open at the front where the doors are, so the camera can travel
 * straight through the doorway into it.
 */

const RECEPTION_URL = "/models/reception.glb";

export default function Reception() {
  const { scene } = useGLTF(RECEPTION_URL);

  // Everything the collection exports is named Rcp_*; anything else would be a
  // stray picked up by a future re-export, so drop it rather than render it.
  const room = useMemo(() => {
    const root = scene.clone(true);
    root.children
      .filter((child) => !child.name.startsWith("Rcp_"))
      .forEach((stray) => root.remove(stray));
    return root;
  }, [scene]);

  useLayoutEffect(() => {
    room.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.frustumCulled = false;
      obj.castShadow = false;
      obj.receiveShadow = true;
      // The cut copy of the facade glazing travels in this file, so it gets the
      // same glass treatment as the rest of the facade.
      applyGlass(obj);
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      mats.forEach((m) => {
        if (!m) return;
        // Blender's emission strength survives the export, but three needs the
        // tone-mapped range nudged up for the sign to read as lit rather than
        // just pale.
        if (m.emissive && m.emissive.getHex() !== 0x000000) {
          m.emissiveIntensity = Math.max(m.emissiveIntensity, 1.6);
          m.toneMapped = false;
        }
        // Room surfaces are single planes and need to be visible from both
        // sides; the doorway-cut podium shells keep their original sidedness so
        // they behave like the rest of the building from outside.
        if (!obj.name.startsWith("Rcp_HQ_")) m.side = THREE.DoubleSide;
        // Interior partitions read as glass too, and are already exported with
        // alpha - they just need sorting that lets the room behind show.
        if (/glass/i.test(m.name)) {
          m.transparent = true;
          m.depthWrite = false;
          obj.renderOrder = GLASS_RENDER_ORDER;
        }
        m.needsUpdate = true;
      });
    });
  }, [room]);

  return (
    <group name="Reception">
      <primitive object={room} />

      {/* Interior lighting. The scene's key light is outside and the podium
          shell blocks it, so the lobby carries its own. Emissive strips in the
          model do not actually light anything in three, so these stand in for
          them - local point lights with a finite range, so none of it spills
          out onto the campus. Positions are glTF (x, z-up, -y). */}
      <pointLight
        position={[-12, 7.4, -9]}
        intensity={260}
        distance={40}
        decay={2}
        color="#ffeacd"
      />
      <pointLight
        position={[-13, 6.2, -5]}
        intensity={150}
        distance={26}
        decay={2}
        color="#ffdcac"
      />
      {/* Walkway and lounge side. */}
      <pointLight
        position={[6, 7.4, -13]}
        intensity={200}
        distance={38}
        decay={2}
        color="#fff0dc"
      />
      <pointLight
        position={[15, 6.4, -14]}
        intensity={120}
        distance={30}
        decay={2}
        color="#ffe8cc"
      />
      {/* Daylight leaking back in through the entrance glazing. */}
      <pointLight
        position={[0, 5.0, -18.5]}
        intensity={90}
        distance={26}
        decay={2}
        color="#cfe0f2"
      />
    </group>
  );
}

useGLTF.preload(RECEPTION_URL);
