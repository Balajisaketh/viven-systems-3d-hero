import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getSequenceState } from "./timeline.js";

const PAINT = "#7d8592";
const PAINT_DARK = "#565d68";
const CANOPY = "#4fd0ff";
const METAL = "#9aa0aa";
const GLOW_COLD = new THREE.Color("#7a2a10");
const GLOW_HOT = new THREE.Color("#fff3c2");

/** Axis helper: primitives default to a Y-up local axis; rotate -90° on Z
 * so cylinders/cones run along local +X, matching the jet's forward axis. */
const ALONG_X = [0, 0, -Math.PI / 2];

function Wing({ side = 1 }) {
  return (
    <group position={[-0.3, -0.05, side * 0.4]} rotation={[side * 0.05, side * -0.12, 0]}>
      <mesh position={[0, 0, side * 1.9]} castShadow>
        <boxGeometry args={[1.7, 0.1, 3.4]} />
        <meshStandardMaterial color={PAINT} flatShading />
      </mesh>
    </group>
  );
}

function Tailplane({ side = 1 }) {
  return (
    <mesh position={[-2.3, 0.05, side * 0.75]} rotation={[side * 0.1, side * -0.15, 0]} castShadow>
      <boxGeometry args={[0.9, 0.08, 1.4]} />
      <meshStandardMaterial color={PAINT} flatShading />
    </mesh>
  );
}

function VerticalTail({ side = 1 }) {
  return (
    <mesh
      position={[-2.15, 0.85, side * 0.42]}
      rotation={[0, 0, side * -0.28]}
      castShadow
    >
      <boxGeometry args={[1.15, 1.5, 0.1]} />
      <meshStandardMaterial color={PAINT_DARK} flatShading />
    </mesh>
  );
}

function LandingGear({ gearUpRef }) {
  const noseRef = useRef();
  const leftRef = useRef();
  const rightRef = useRef();

  useFrame(() => {
    const up = gearUpRef.current;
    const tuck = (grp, restY, restScale = 1) => {
      if (!grp.current) return;
      grp.current.position.y = restY + up * 0.85;
      const s = 1 - up * 0.9;
      grp.current.scale.setScalar(Math.max(0.001, s) * restScale);
    };
    tuck(noseRef, -0.55);
    tuck(leftRef, -0.65);
    tuck(rightRef, -0.65);
  });

  const Strut = ({ groupRef, x, z }) => (
    <group ref={groupRef} position={[x, -0.55, z]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.5, 6]} />
        <meshStandardMaterial color={METAL} flatShading />
      </mesh>
      <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.16, 8]} />
        <meshStandardMaterial color="#20222a" flatShading />
      </mesh>
    </group>
  );

  return (
    <>
      <Strut groupRef={noseRef} x={1.7} z={0} />
      <Strut groupRef={leftRef} x={-0.4} z={0.65} />
      <Strut groupRef={rightRef} x={-0.4} z={-0.65} />
    </>
  );
}

function EngineNozzle({ side = 1, glowRef }) {
  const matRef = useRef();
  const lightRef = useRef();

  useFrame(() => {
    const g = glowRef.current;
    if (matRef.current) {
      const c = GLOW_COLD.clone().lerp(GLOW_HOT, g);
      matRef.current.emissive.copy(c);
      matRef.current.emissiveIntensity = 0.6 + g * 9;
    }
    if (lightRef.current) {
      lightRef.current.intensity = g * 6;
    }
  });

  return (
    <group position={[-2.55, 0, side * 0.42]}>
      <mesh rotation={ALONG_X} castShadow>
        <cylinderGeometry args={[0.32, 0.26, 0.6, 10]} />
        <meshStandardMaterial color="#2b2d33" flatShading metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.32, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <circleGeometry args={[0.24, 12]} />
        <meshStandardMaterial ref={matRef} color="#1a1a1a" emissive="#7a2a10" flatShading />
      </mesh>
      <pointLight ref={lightRef} color="#ff8a3d" distance={4} decay={2} intensity={0} />
    </group>
  );
}

export default function Jet({ timeOffset = 0 }) {
  const rootRef = useRef();
  const glowRef = useRef(0);
  const gearUpRef = useRef(0);

  const shakeSeed = useMemo(() => Math.random() * 100, []);

  useFrame(({ clock }) => {
    const s = getSequenceState(clock.elapsedTime + timeOffset);
    glowRef.current = s.glow;
    gearUpRef.current = s.gearUp;

    if (rootRef.current) {
      const t = clock.elapsedTime;
      const jitterX = s.shake * Math.sin(t * 41 + shakeSeed) * 0.03;
      const jitterY = s.shake * Math.sin(t * 53 + shakeSeed) * 0.02;
      rootRef.current.position.set(
        s.jetPos.x + jitterX,
        s.jetPos.y + jitterY,
        s.jetPos.z
      );
      // Forward = local +X, wingspan = local +Z, up = local +Y.
      // Pitch (nose up) rotates about Z; roll (bank) rotates about X.
      rootRef.current.rotation.set(
        THREE.MathUtils.degToRad(s.jetRollDeg),
        0,
        THREE.MathUtils.degToRad(s.jetPitchDeg)
      );
    }
  });

  return (
    <group ref={rootRef}>
      {/* fuselage */}
      <mesh rotation={ALONG_X} castShadow>
        <cylinderGeometry args={[0.42, 0.5, 3.4, 10]} />
        <meshStandardMaterial color={PAINT} flatShading />
      </mesh>
      {/* nose */}
      <mesh position={[2.0, 0, 0]} rotation={ALONG_X} castShadow>
        <coneGeometry args={[0.42, 1.1, 10]} />
        <meshStandardMaterial color={PAINT_DARK} flatShading />
      </mesh>
      {/* canopy */}
      <mesh position={[0.9, 0.42, 0]} scale={[0.62, 0.4, 0.32]} castShadow>
        <sphereGeometry args={[1, 10, 8]} />
        <meshStandardMaterial
          color={CANOPY}
          transparent
          opacity={0.75}
          roughness={0.15}
          metalness={0.2}
          flatShading
        />
      </mesh>
      {/* nose LERX / intake fairings */}
      <mesh position={[0.6, -0.1, 0]} castShadow>
        <boxGeometry args={[1.6, 0.3, 1.15]} />
        <meshStandardMaterial color={PAINT_DARK} flatShading />
      </mesh>

      <Wing side={1} />
      <Wing side={-1} />
      <Tailplane side={1} />
      <Tailplane side={-1} />
      <VerticalTail side={1} />
      <VerticalTail side={-1} />

      <EngineNozzle side={1} glowRef={glowRef} />
      <EngineNozzle side={-1} glowRef={glowRef} />

      <LandingGear gearUpRef={gearUpRef} />
    </group>
  );
}
