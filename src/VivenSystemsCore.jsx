/**
 * VivenSystemsCore.jsx
 * ----------------------------------------------------------------------------
 * "AI Intelligence & Web Synergy" hero visual for the Viven Systems landing page.
 * Recreates the Blender previz scene: an obsidian icosphere core wrapped in a
 * glowing cyan wireframe, three orbiting rings (cyan / violet / obsidian),
 * six server pillars, and a field of floating data nodes — under moody
 * three-point tech lighting with neon bloom.
 *
 * Install:
 *   npm install three @react-three/fiber @react-three/drei @react-three/postprocessing
 *
 * Usage:
 *   import VivenSystemsCore from "./VivenSystemsCore";
 *   export default function Hero() {
 *     return <div style={{ width: "100%", height: "100vh" }}>
 *       <VivenSystemsCore />
 *     </div>;
 *   }
 *
 * Axis note: Blender is Z-up (core spins on Z, hovers on Z). Three.js is Y-up,
 * so the same motion here is: spin on rotation.y (vertical axis), hover on
 * position.y (up/down).
 */

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Wireframe } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

const CYAN = "#00F0FF";
const VIOLET = "#9D00FF";
const OBSIDIAN = "#050508";

/** Central icosahedron core + glowing wireframe shell. Spins + hovers. */
function AICore() {
  const group = useRef();
  const baseY = 1.5;

  useFrame((state, delta) => {
    if (!group.current) return;
    // Continuous vertical-axis spin (loops seamlessly, ~8s per revolution)
    group.current.rotation.y += delta * 0.55;
    // Subtle weightless hover
    group.current.position.y =
      baseY + Math.sin(state.clock.elapsedTime * 0.8) * 0.4;
  });

  return (
    <group ref={group} position={[0, baseY, 0]}>
      {/* Solid obsidian core */}
      <mesh castShadow receiveShadow>
        <icosahedronGeometry args={[1.2, 4]} />
        <meshStandardMaterial
          color={OBSIDIAN}
          metalness={0.95}
          roughness={0.15}
        />
        {/* Glowing circuit-line overlay, mirrors the Blender wireframe modifier */}
        <Wireframe stroke={CYAN} thickness={0.015} squeeze={0} dash={false} />
      </mesh>

      {/* Orbiting rings */}
      <mesh rotation={[Math.PI * 0.39, 0, Math.PI * 0.11]}>
        <torusGeometry args={[2.0, 0.03, 16, 100]} />
        <meshBasicMaterial color={CYAN} toneMapped={false} />
      </mesh>
      <mesh rotation={[Math.PI * 0.11, Math.PI * 0.33, 0]}>
        <torusGeometry args={[2.3, 0.03, 16, 100]} />
        <meshBasicMaterial color={VIOLET} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, Math.PI * 0.5, Math.PI * 0.25]}>
        <torusGeometry args={[2.6, 0.05, 16, 100]} />
        <meshStandardMaterial color={OBSIDIAN} metalness={0.95} roughness={0.15} />
      </mesh>
    </group>
  );
}

/** Elongated obsidian pillars in a ring, each with a glowing accent band. */
function ServerPillars() {
  const pillars = useMemo(() => {
    const count = 6;
    const radius = 4.2;
    return new Array(count).fill(0).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const height = 1.2 + ((i * 37) % 100) / 100; // deterministic pseudo-random 1.2–2.2
      return {
        key: i,
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        height,
        color: i % 2 === 0 ? CYAN : VIOLET,
      };
    });
  }, []);

  return (
    <>
      {pillars.map((p) => (
        <group key={p.key} position={[p.x, 0, p.z]}>
          <mesh position={[0, p.height / 2, 0]}>
            <boxGeometry args={[0.5, p.height, 0.5]} />
            <meshStandardMaterial color={OBSIDIAN} metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, p.height * 0.85, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.28, 0.02, 12, 40]} />
            <meshBasicMaterial color={p.color} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

/** Field of small floating data nodes, each bobbing on its own phase. */
function DataNodes() {
  const nodes = useMemo(() => {
    const count = 14;
    return new Array(count).fill(0).map((_, i) => {
      const angle = (i / count) * Math.PI * 2 * 1.7; // scattered, not a perfect ring
      const dist = 3.2 + ((i * 53) % 100) / 100 / 0.43; // 3.2–5.5
      return {
        key: i,
        x: Math.cos(angle) * dist,
        z: Math.sin(angle) * dist,
        y: 0.5 + ((i * 29) % 100) / 100 * 3,
        size: 0.08 + ((i * 17) % 100) / 100 * 0.12,
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
      mesh.position.y = n.y + Math.sin(state.clock.elapsedTime * 0.6 + n.phase) * 0.25;
    });
  });

  return (
    <>
      {nodes.map((n, i) => (
        <mesh
          key={n.key}
          ref={(el) => (refs.current[i] = el)}
          position={[n.x, n.y, n.z]}
        >
          <icosahedronGeometry args={[n.size, 1]} />
          <meshBasicMaterial color={n.color} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/** Three-point tech lighting: cyan key (top-left), violet accent (bottom-right), soft fill. */
function LightingRig() {
  return (
    <>
      <ambientLight color="#0a1030" intensity={0.6} />
      <pointLight position={[-6, 6, -4]} color={CYAN} intensity={60} distance={20} decay={2} />
      <pointLight position={[6, 1, 4]} color={VIOLET} intensity={35} distance={20} decay={2} />
      <pointLight position={[0, 3, -8]} color="#99aaff" intensity={12} distance={20} decay={2} />
    </>
  );
}

export default function VivenSystemsCore() {
  return (
    <Canvas
      shadows
      camera={{ position: [6.5, 4.5, 7], fov: 45 }}
      style={{ background: "#01030a" }}
    >
      <color attach="background" args={["#01030a"]} />
      <fog attach="fog" args={["#01030a", 8, 22]} />

      <LightingRig />
      <AICore />
      <ServerPillars />
      <DataNodes />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
        autoRotate
        autoRotateSpeed={0.4}
      />

      <EffectComposer>
        <Bloom
          intensity={1.1}
          luminanceThreshold={0.15}
          luminanceSmoothing={0.4}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}
