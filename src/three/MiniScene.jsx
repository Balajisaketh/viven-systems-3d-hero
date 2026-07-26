import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Wireframe } from "@react-three/drei";

function Shape({ geometry, color, speed }) {
  const ref = useRef();

  useFrame((_, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * speed * 0.6;
    ref.current.rotation.y += delta * speed;
  });

  return (
    <mesh ref={ref}>
      {geometry}
      <meshStandardMaterial color="#050508" metalness={0.9} roughness={0.2} />
      <Wireframe stroke={color} thickness={0.012} squeeze={0} dash={false} />
    </mesh>
  );
}

/**
 * Small, self-contained rotating 3D icon/thumbnail.
 * Used for service cards and portfolio thumbnails so each section
 * carries its own bit of the "AI + Web synergy" motif without the
 * cost of a full page-wide scene.
 */
export default function MiniScene({
  geometry,
  color = "#00F0FF",
  speed = 0.6,
  height = 160,
}) {
  return (
    <div className="mini-scene" style={{ height }}>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 40 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.5} color="#0a1030" />
        <pointLight position={[2, 2, 2]} color={color} intensity={40} />
        <pointLight position={[-2, -1, -2]} color="#9D00FF" intensity={15} />
        <Shape geometry={geometry} color={color} speed={speed} />
      </Canvas>
    </div>
  );
}
