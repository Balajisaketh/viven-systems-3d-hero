import React, { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { applyGlass } from "./glass.js";

/**
 * Rooftop canteen, added on top of the podium roof (the same volume the
 * reception lobby sits inside, Blender z ~15..19). Modelled and exported
 * separately from campus-01-arrival.glb so the existing campus/reception
 * export is untouched. Everything in the file is named Cnt_*.
 */

const CANTEEN_URL = "/models/canteen.glb";

export default function Canteen() {
  const { scene } = useGLTF(CANTEEN_URL);

  const room = useMemo(() => {
    const root = scene.clone(true);
    root.children
      .filter((child) => !child.name.startsWith("Cnt_"))
      .forEach((stray) => root.remove(stray));
    return root;
  }, [scene]);

  useLayoutEffect(() => {
    room.traverse((obj) => {
      if (obj.isLight) {
        // Pendant point lights come in through KHR_lights_punctual at their
        // Blender wattage; tame them the same way BlenderModel does for the
        // campus GLB's own lights so they don't blow out the room.
        if (obj.isPointLight) {
          obj.intensity = Math.min(obj.intensity, 6);
          obj.distance = obj.distance > 0 ? Math.min(obj.distance, 12) : 8;
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
        // Wall-mounted signage - safe against any residual sign error in the
        // Blender-side rotation math that aims each sign at its wall.
        if (/Text|FeatureWall_Panel/i.test(obj.name)) m.side = THREE.DoubleSide;
        m.needsUpdate = true;
      });
    });
  }, [room]);

  return (
    <group name="Canteen">
      <primitive object={room} />
    </group>
  );
}

useGLTF.preload(CANTEEN_URL);
