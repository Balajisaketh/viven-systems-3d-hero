import React, { useEffect, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { applyGlass } from "./glass.js";

export const MODEL_URL = "/models/campus-01-arrival.glb";

// Replaced by doorway-cut copies shipped in reception.glb (Rcp_HQ_*).
const CUT_FOR_DOORWAY = new Set([
  "HQ_MainVolume",
  "HQ_BaseBand",
  "HQ_FrontGlass",
]);

export default function BlenderModel() {
  const gltf = useGLTF(MODEL_URL);
  const { actions, names } = useAnimations(gltf.animations, gltf.scene);

  const sceneInfo = useMemo(() => {
    if (!gltf || !gltf.scene) return null;
    const bounds = new THREE.Box3();
    let meshCount = 0;
    const meshNames = [];
    gltf.scene.updateMatrixWorld(true);
    gltf.scene.traverse((obj) => {
      if (obj.isMesh) {
        meshCount++;
        if (meshNames.length < 40) meshNames.push(obj.name);
        const geom = obj.geometry;
        if (geom) {
          if (!geom.boundingBox) geom.computeBoundingBox();
          const worldBox = geom.boundingBox.clone();
          worldBox.applyMatrix4(obj.matrixWorld);
          bounds.union(worldBox);
        }
      }
    });
    const size3 = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size3);
    bounds.getCenter(center);
    const radius = Math.max(size3.x, size3.y, size3.z) * 0.5;
    return { bounds, size: size3, center, radius, meshCount, meshNames };
  }, [gltf]);

  useEffect(() => {
    if (!gltf || !sceneInfo) return;
    console.log("[BlenderModel] animation clips:", names.length, names);
    console.log(
      "[BlenderModel] scene graph (top-level):",
      gltf.scene.children.map((c) => c.name + "(" + c.type + ")")
    );
    console.log(
      `[BlenderModel] Scene AABB: center=${sceneInfo.center.toArray().map(n => n.toFixed(1)).join(",")} | size=${sceneInfo.size.toArray().map(n => n.toFixed(1)).join(",")} | radius≈${sceneInfo.radius.toFixed(1)} | meshes=${sceneInfo.meshCount}`
    );

    let actualLights = 0;
    let justObjects = 0;
    let materialsWithIssues = 0;
    const allCameras = [];
    const allTargets = {};
    const glbLights = [];
    gltf.scene.traverse((obj) => {
      if (obj.isCamera) allCameras.push(obj);
      if (obj.name && obj.name.includes("Target")) {
        allTargets[obj.name] = obj;
      }
      if (obj.isLight) {
        actualLights++;
        glbLights.push(obj);
      } else if (obj.name.startsWith("Light_")) {
        justObjects++;
      }
      if (obj.isMesh) {
        obj.frustumCulled = false;
        // The GLB's flat terrain plate stops dead at 400x400 and shows its edge
        // against the sky; Landscape.jsx draws the ground instead.
        if (obj.name.startsWith("Terrain")) obj.visible = false;
        // The podium is a solid box whose front face sits at y=20, right behind
        // the doors - so they slid open onto a wall. Reception.glb ships copies
        // of these three with the doorway booleaned out of them; use those.
        if (CUT_FOR_DOORWAY.has(obj.name)) obj.visible = false;
        // reception.glb is the only source for the interior. A whole-scene
        // re-export of the campus picks up the Web_Reception collection too,
        // which would draw a stale second copy of the lobby inside this one.
        if (obj.name.startsWith("Rcp_")) obj.visible = false;
        // The GLB plants its own trees either side of the entrance; they crowd
        // the doors and sweep the lens as the camera goes in. Anything in the
        // approach corridor comes out. glTF is Y-up, so Blender y is -z here.
        if (obj.name.startsWith("Tree_")) {
          const p = new THREE.Vector3();
          obj.getWorldPosition(p);
          const by = -p.z;
          if (Math.abs(p.x) < 16 && by > 18 && by < 78) obj.visible = false;
        }
        obj.castShadow = obj.castShadow || obj.name.includes("Tree_") || obj.name.includes("HQ_") || obj.name.includes("Canopy");
        obj.receiveShadow = obj.receiveShadow || obj.name.includes("Plaza") || obj.name.includes("Floor") || obj.name.includes("Pool") || obj.name.includes("Terrain");
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        mats.forEach((m) => {
          if (m) {
            if (m.opacity === 0 || m.transparent && m.opacity < 0.05) {
              materialsWithIssues++;
            }
            if (m.color && m.color.r === 0 && m.color.g === 0 && m.color.b === 0 && m.metalness !== undefined && m.roughness !== undefined) {
              m.metalness = Math.min(m.metalness, 0.9);
              m.roughness = Math.max(m.roughness, 0.15);
            }
            m.needsUpdate = true;
          }
        });
        // Facade glazing and the door leaves become see-through, so the lit
        // reception reads from outside as you approach.
        applyGlass(obj);
      }
    });

    glbLights.forEach((light) => {
      if (light.isDirectionalLight) {
        light.intensity = Math.max(0, Math.min(light.intensity, 0.45));
        if (light.shadow) {
          light.castShadow = false;
        }
      } else if (light.isSpotLight) {
        light.intensity = Math.max(0, Math.min(light.intensity, 0.35));
        light.distance = light.distance > 0 ? Math.min(light.distance, 80) : 60;
        light.decay = Math.max(light.decay, 1.5);
        if (light.shadow) {
          light.castShadow = false;
        }
      } else if (light.isPointLight) {
        light.intensity = Math.max(0, Math.min(light.intensity, 0.25));
        light.decay = Math.max(light.decay, 2);
      }
    });
    console.log(
      `[BlenderModel] Light diagnostics: actual=${actualLights}, justObject3Ds=${justObjects}, suspectMaterials=${materialsWithIssues}`
    );
    console.log(
      `[BlenderModel] GLB lights tamed: ${glbLights.map(l => l.name + ":" + l.type + "@int" + l.intensity.toFixed(2)).join(", ")}`
    );
    console.log(
      `[BlenderModel] Cameras found: ${allCameras.map(c => c.name + "@" + c.position.toArray().map(n => n.toFixed(1)).join(",")).join(" | ")}`
    );

    Object.entries(actions).forEach(([clipName, action]) => {
      // The door clips are keyed to the old 15s cinematic (frames 360-450) and
      // would open the doors long after this hero settles. Entrance.jsx drives
      // them against the camera push instead.
      if (/door/i.test(clipName)) return;
      if (action) {
        action.reset().play();
        action.paused = false;
        action.enabled = true;
        action.setLoop(THREE.LoopOnce, 1);
        action.clampWhenFinished = true;
      }
    });

    // The GLB's own cameras are left untouched: the hero framing comes from
    // HeroCamera (see heroView.js), which reproduces the Blender viewport
    // composition rather than the exported camera animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gltf, sceneInfo]);

  useFrame(({ camera, size }) => {
    if (camera && camera.isCamera) {
      const expected = size.width / size.height;
      if (Math.abs((camera.aspect || 0) - expected) > 0.01) {
        camera.aspect = expected;
        camera.updateProjectionMatrix?.();
      }
    }
  });

  return <primitive object={gltf.scene} />;
}

useGLTF.preload(MODEL_URL);
