import React from "react";
import { CuboidCollider } from "@react-three/rapier";
import { Text } from "@react-three/drei";
import { zones } from "../content/sections.js";

/**
 * Colored flat markers painted on the ground, one per site section.
 * Each has an invisible sensor collider slightly larger than the disc —
 * driving into it opens the matching content panel, driving out closes it.
 */
export default function Zones({ onEnter, onExit }) {
  return (
    <>
      {zones.map((z) => (
        <group key={z.id} position={z.position}>
          <mesh position={[0, 0.01, 0]} receiveShadow>
            <cylinderGeometry args={[z.radius, z.radius, 0.05, 24]} />
            <meshStandardMaterial color={z.color} flatShading />
          </mesh>

          <Text
            position={[0, 3.2, 0]}
            fontSize={1.1}
            color="#1a1a2e"
            outlineWidth={0.04}
            outlineColor="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {z.label}
          </Text>

          <CuboidCollider
            sensor
            args={[z.radius, 2, z.radius]}
            position={[0, 1, 0]}
            onIntersectionEnter={() => onEnter(z.id)}
            onIntersectionExit={() => onExit(z.id)}
          />
        </group>
      ))}
    </>
  );
}
