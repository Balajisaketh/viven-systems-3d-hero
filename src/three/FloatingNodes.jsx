import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

const CYAN = "#00F0FF";
const VIOLET = "#9D00FF";

function Nodes() {
  const nodes = useMemo(() => {
    const count = 22;
    return new Array(count).fill(0).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 * 2.3;
      const dist = 2 + ((i * 53) % 100) / 100 * 4;
      return {
        key: i,
        x: Math.cos(angle) * dist,
        y: -2 + ((i * 29) % 100) / 100 * 4,
        z: Math.sin(angle) * dist - 3,
        size: 0.05 + ((i * 17) % 100) / 100 * 0.09,
        color: i % 2 === 0 ? CYAN : VIOLET,
        phase: (i * 0.37) % (Math.PI * 2),
      };
    });
  }, []);

  const refs = useRef([]);

  useFrame((state) => {
    nodes.forEach((n, i) => {
      const mesh = refs.current[i];
      if (!mesh) return;
      mesh.position.y = n.y + Math.sin(state.clock.elapsedTime * 0.5 + n.phase) * 0.3;
    });
  });

  return (
    <>
      {nodes.map((n, i) => (
        <mesh key={n.key} ref={(el) => (refs.current[i] = el)} position={[n.x, n.y, n.z]}>
          <icosahedronGeometry args={[n.size, 1]} />
          <meshBasicMaterial color={n.color} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/** Subtle drifting particle field used behind the Contact section. */
export default function FloatingNodes() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      style={{ pointerEvents: "none" }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <Nodes />
    </Canvas>
  );
}
