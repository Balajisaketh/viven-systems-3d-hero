import React from "react";

/** A pole with a small checkered flag near the start/finish straight. */
export default function CheckeredFlag({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const cols = 4;
  const rows = 3;
  const tileSize = 0.4;

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 3.6, 8]} />
        <meshStandardMaterial color="#4a4a4a" flatShading />
      </mesh>

      <group position={[0.4, 3.1, 0]}>
        {new Array(rows).fill(0).map((_, r) =>
          new Array(cols).fill(0).map((_, c) => (
            <mesh key={`${r}-${c}`} position={[c * tileSize, -r * tileSize, 0]}>
              <planeGeometry args={[tileSize, tileSize]} />
              <meshStandardMaterial
                color={(r + c) % 2 === 0 ? "#111111" : "#f4f4f4"}
                side={2}
              />
            </mesh>
          ))
        )}
      </group>
    </group>
  );
}
