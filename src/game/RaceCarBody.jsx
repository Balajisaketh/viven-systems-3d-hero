import React, { forwardRef } from "react";

const Wheel = forwardRef(function Wheel({ position }, ref) {
  return (
    <group ref={ref} position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* Tire */}
      <mesh castShadow>
        <cylinderGeometry args={[0.36, 0.36, 0.28, 20]} />
        <meshStandardMaterial color="#111111" roughness={0.9} metalness={0} />
      </mesh>
      {/* Rim */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.3, 16]} />
        <meshStandardMaterial color="#d8d8dc" metalness={0.9} roughness={0.25} />
      </mesh>
    </group>
  );
});

/**
 * A more realistic-looking sports/race car silhouette, built from carefully
 * placed primitives (no risky custom extrusions): a stepped three-tier body
 * (chassis / hood-cabin / tinted-glass roof), front splitter, rear wing on
 * struts, mirrors, headlights and taillights, plus two-part tire+rim wheels.
 *
 * NOTE: this is a generic race car, not a licensed/branded model — real
 * manufacturer badges and exact vehicle shapes are trademarked, so this
 * deliberately doesn't reproduce any specific brand's car. If you have your
 * own licensed .glb car model, swap this component out for a `useGLTF()`
 * loader instead.
 */
const RaceCarBody = forwardRef(function RaceCarBody({ color = "#e63946", wheelRefs }, ref) {
  const wheelPositions = [
    [0.85, 0.33, -1.4],
    [-0.85, 0.33, -1.4],
    [0.85, 0.33, 1.4],
    [-0.85, 0.33, 1.4],
  ];

  return (
    <group ref={ref}>
      {/* Tier 1: main chassis */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.34, 4.2]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.3} />
      </mesh>

      {/* Tier 2: hood / cabin sides */}
      <mesh position={[0, 0.62, -0.1]} castShadow>
        <boxGeometry args={[1.5, 0.3, 2.6]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.3} />
      </mesh>

      {/* Tier 3: tinted glass greenhouse / roof */}
      <mesh position={[0, 0.9, 0.05]} castShadow>
        <boxGeometry args={[1.2, 0.28, 1.3]} />
        <meshStandardMaterial color="#12141a" metalness={0.2} roughness={0.15} />
      </mesh>

      {/* Front splitter */}
      <mesh position={[0, 0.14, -2.05]}>
        <boxGeometry args={[1.6, 0.06, 0.3]} />
        <meshStandardMaterial color="#111111" roughness={0.6} />
      </mesh>

      {/* Rear wing + struts */}
      <mesh position={[0.6, 0.85, 1.9]}>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
        <meshStandardMaterial color="#111111" roughness={0.6} />
      </mesh>
      <mesh position={[-0.6, 0.85, 1.9]}>
        <cylinderGeometry args={[0.03, 0.03, 0.35, 6]} />
        <meshStandardMaterial color="#111111" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.05, 1.95]}>
        <boxGeometry args={[1.6, 0.05, 0.5]} />
        <meshStandardMaterial color="#111111" roughness={0.6} />
      </mesh>

      {/* Mirrors */}
      <mesh position={[0.95, 0.68, -0.5]}>
        <boxGeometry args={[0.12, 0.12, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[-0.95, 0.68, -0.5]}>
        <boxGeometry args={[0.12, 0.12, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.3} />
      </mesh>

      {/* Headlights */}
      <mesh position={[0.6, 0.35, -2.06]}>
        <boxGeometry args={[0.25, 0.12, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.6, 0.35, -2.06]}>
        <boxGeometry args={[0.25, 0.12, 0.05]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
      </mesh>

      {/* Taillights */}
      <mesh position={[0.6, 0.35, 2.06]}>
        <boxGeometry args={[0.25, 0.12, 0.05]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.6, 0.35, 2.06]}>
        <boxGeometry args={[0.25, 0.12, 0.05]} />
        <meshStandardMaterial color="#ff3b3b" emissive="#ff0000" emissiveIntensity={0.5} />
      </mesh>

      {wheelPositions.map((p, i) => (
        <Wheel
          key={i}
          position={p}
          ref={wheelRefs ? (el) => (wheelRefs.current[i] = el) : undefined}
        />
      ))}
    </group>
  );
});

export default RaceCarBody;
