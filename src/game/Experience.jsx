import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { KeyboardControls } from "@react-three/drei";
import World from "./World.jsx";
import Zones from "./Zones.jsx";
import Car from "./Car.jsx";
import CameraRig from "./CameraRig.jsx";
import { zones } from "../content/sections.js";

const controlsMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "brake", keys: ["Space"] },
];

/**
 * Top-level 3D game world: keyboard controls + physics + scene + camera.
 * Exposes teleportTo(id) via ref so the HUD menu can snap the car to any
 * zone without the player having to drive there manually.
 */
const Experience = forwardRef(function Experience({ onSectionEnter, onSectionExit }, ref) {
  const carRef = useRef();

  useImperativeHandle(ref, () => ({
    teleportTo(id) {
      const body = carRef.current;
      if (!body) return;

      if (id === "home") {
        body.setTranslation({ x: 0, y: 1, z: 10 }, true);
      } else {
        const zone = zones.find((z) => z.id === id);
        if (!zone) return;
        const [x, y, z] = zone.position;
        body.setTranslation({ x, y: y + 1, z: z + zone.radius + 3 }, true);
      }
      body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    },
  }));

  return (
    <KeyboardControls map={controlsMap}>
      <Canvas shadows camera={{ position: [0, 6, 12], fov: 50 }}>
        <Physics gravity={[0, -9.81, 0]}>
          <World />
          <Zones onEnter={onSectionEnter} onExit={onSectionExit} />
          <Car ref={carRef} />
        </Physics>
        <CameraRig target={carRef} />
      </Canvas>
    </KeyboardControls>
  );
});

export default Experience;
