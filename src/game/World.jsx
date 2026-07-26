import React, { useMemo } from "react";
import { RigidBody } from "@react-three/rapier";
import Track from "./Track.jsx";
import AICars from "./AICars.jsx";
import Grandstand from "./Grandstand.jsx";
import CheckeredFlag from "./CheckeredFlag.jsx";

function Tree({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.2, 1.2, 6]} />
        <meshStandardMaterial color="#8a5a34" flatShading />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.9, 1.6, 7]} />
        <meshStandardMaterial color="#3fa34d" flatShading />
      </mesh>
    </group>
  );
}

function Rock({ position, scale = 1 }) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <icosahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#9a9a9a" flatShading />
    </mesh>
  );
}

/**
 * The playful low-poly F1-style world: sky, sun, ocean rim, one big grassy
 * island (single physics ground so the car can never fall through a gap),
 * a racetrack loop with curbs/AI cars/grandstands on top of it, plus
 * scattered toy trees/rocks out beyond the track footprint for flavor.
 */
export default function World() {
  const decor = useMemo(() => {
    const items = [];
    // Kept well outside the track's bounding area (~x:-16..16, z:8..-27)
    // so nothing visually clips through the road.
    const treeSpots = [
      [25, 0, 5], [28, 0, -10], [-25, 0, 5], [-28, 0, -10],
      [20, 0, -32], [-20, 0, -32], [30, 0, -20], [-30, 0, -20],
      [10, 0, 22], [18, 0, 14],
    ];
    treeSpots.forEach((p, i) => items.push({ type: "tree", position: p, key: `t${i}` }));

    const rockSpots = [
      [24, 0.25, -5], [-24, 0.25, -5], [22, 0.25, -25], [-22, 0.25, -25],
    ];
    rockSpots.forEach((p, i) => items.push({ type: "rock", position: p, key: `r${i}` }));

    return items;
  }, []);

  return (
    <>
      <color attach="background" args={["#bfe8ff"]} />
      <fog attach="fog" args={["#bfe8ff", 30, 75]} />

      <hemisphereLight args={["#bfe8ff", "#3fa34d", 0.65]} />
      <directionalLight
        position={[15, 22, 10]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />

      {/* Ocean rim beneath/around the island */}
      <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#2a9df4" flatShading />
      </mesh>

      {/* Single connected island ground (one physics collider, no gaps) */}
      <RigidBody type="fixed" colliders="cuboid" friction={0.5}>
        <mesh receiveShadow position={[0, -0.5, 0]}>
          <cylinderGeometry args={[45, 45, 1, 10]} />
          <meshStandardMaterial color="#7ed957" flatShading />
        </mesh>
      </RigidBody>

      {decor.map((d) =>
        d.type === "tree" ? (
          <Tree key={d.key} position={d.position} />
        ) : (
          <Rock key={d.key} position={d.position} scale={1} />
        )
      )}

      <Track />
      <AICars />

      <Grandstand position={[-14, 0, 8]} rotation={[0, Math.PI / 2, 0]} />
      <Grandstand position={[14, 0, 8]} rotation={[0, -Math.PI / 2, 0]} />
      <CheckeredFlag position={[5, 0, 8]} />
    </>
  );
}
