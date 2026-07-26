import React from "react";

/** A simple stepped bleacher with a roof canopy — trackside atmosphere. */
export default function Grandstand({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {[0, 1, 2, 3].map((row) => (
        <mesh key={row} position={[0, 0.4 + row * 0.55, -row * 0.9]} castShadow receiveShadow>
          <boxGeometry args={[9, 0.5, 1.6]} />
          <meshStandardMaterial color={row % 2 === 0 ? "#3d5a80" : "#293241"} flatShading />
        </mesh>
      ))}

      <mesh position={[0, 2.9, -2.2]} castShadow>
        <boxGeometry args={[9.6, 0.25, 3.4]} />
        <meshStandardMaterial color="#ee6c4d" flatShading />
      </mesh>

      <mesh position={[-4.5, 1.6, -2.2]}>
        <cylinderGeometry args={[0.12, 0.12, 3, 6]} />
        <meshStandardMaterial color="#293241" flatShading />
      </mesh>
      <mesh position={[4.5, 1.6, -2.2]}>
        <cylinderGeometry args={[0.12, 0.12, 3, 6]} />
        <meshStandardMaterial color="#293241" flatShading />
      </mesh>
    </group>
  );
}
