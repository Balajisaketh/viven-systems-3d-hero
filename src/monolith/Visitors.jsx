import React, { useLayoutEffect, useMemo } from "react";
import { useGLTF } from "@react-three/drei";

/**
 * People arriving at work: stylised men and women walking down the plaza toward
 * the entrance doors, posed mid-stride. Modelled and exported separately from
 * the campus, same as the floors above - everything here is named Vis_*.
 *
 * They stand on the plaza pad (Blender z 0) between y 30 and y 79, converging
 * on the doorway at y 20.2, so they read during the arrival push and are behind
 * the camera by the time it crosses the threshold.
 */

const VISITORS_URL = "/models/visitors.glb";

export default function Visitors() {
  const { scene } = useGLTF(VISITORS_URL);

  const crowd = useMemo(() => {
    const root = scene.clone(true);
    root.children
      .filter((child) => !child.name.startsWith("Vis_"))
      .forEach((stray) => root.remove(stray));
    return root;
  }, [scene]);

  useLayoutEffect(() => {
    crowd.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.frustumCulled = false;
      obj.castShadow = true;
      obj.receiveShadow = true;
    });
  }, [crowd]);

  return (
    <group name="Visitors">
      <primitive object={crowd} />
    </group>
  );
}

useGLTF.preload(VISITORS_URL);
