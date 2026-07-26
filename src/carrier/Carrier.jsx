import React, { useMemo } from "react";
import { Instances, Instance } from "@react-three/drei";
import { DECK, CATAPULT_Z } from "./timeline.js";

const COLORS = {
  deck: "#565a63",
  deckDark: "#3d4048",
  stripeYellow: "#f4c542",
  stripeWhite: "#eef1f4",
  hull: "#2f333c",
  island: "#4b4f58",
  islandDark: "#33363d",
  windowGlow: "#ffd9a0",
  light: "#ffb066",
};

function Island() {
  const z = -6;
  return (
    <group position={[4, DECK.y, z]}>
      {/* main island block */}
      <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[15, 9, 6]} />
        <meshStandardMaterial color={COLORS.island} flatShading />
      </mesh>
      {/* bridge windows band, facing the deck (+Z) */}
      <mesh position={[0, 6.6, 3.02]}>
        <boxGeometry args={[13, 1.4, 0.06]} />
        <meshStandardMaterial
          color={COLORS.windowGlow}
          emissive={COLORS.windowGlow}
          emissiveIntensity={0.9}
          flatShading
        />
      </mesh>
      {/* roof */}
      <mesh position={[0, 9.1, 0]} castShadow>
        <boxGeometry args={[15.4, 0.5, 6.4]} />
        <meshStandardMaterial color={COLORS.islandDark} flatShading />
      </mesh>
      {/* radar mast */}
      <mesh position={[-3, 11, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 4, 6]} />
        <meshStandardMaterial color={COLORS.islandDark} flatShading />
      </mesh>
      <mesh position={[-3, 13.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 2.4, 5]} />
        <meshStandardMaterial color={COLORS.islandDark} flatShading />
      </mesh>
      {/* smokestack */}
      <mesh position={[4.5, 10.4, -0.5]} castShadow>
        <cylinderGeometry args={[0.9, 1.1, 3, 8]} />
        <meshStandardMaterial color={COLORS.hull} flatShading />
      </mesh>
    </group>
  );
}

function CatapultTrack() {
  return (
    <group position={[1, DECK.y + 0.505, CATAPULT_Z]}>
      <mesh receiveShadow>
        <boxGeometry args={[58, 0.02, 2.4]} />
        <meshStandardMaterial color={COLORS.stripeWhite} flatShading />
      </mesh>
      <mesh position={[0, 0.005, 0]}>
        <boxGeometry args={[58, 0.02, 0.35]} />
        <meshStandardMaterial
          color={COLORS.stripeYellow}
          emissive={COLORS.stripeYellow}
          emissiveIntensity={0.15}
          flatShading
        />
      </mesh>
    </group>
  );
}

function DeckMarkings() {
  return (
    <group position={[0, DECK.y + 0.505, 0]}>
      {/* deck-edge safety stripes */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 0, side * (DECK.width / 2 - 1)]}>
          <boxGeometry args={[DECK.length - 3, 0.02, 0.3]} />
          <meshStandardMaterial color={COLORS.stripeYellow} flatShading />
        </mesh>
      ))}
    </group>
  );
}

function DeckLights() {
  const spots = useMemo(() => {
    const list = [];
    const step = 4;
    for (let x = -DECK.length / 2 + 2; x <= DECK.length / 2 - 2; x += step) {
      list.push([x, DECK.y + 0.15, DECK.width / 2 - 0.6]);
      list.push([x, DECK.y + 0.15, -(DECK.width / 2 - 0.6)]);
    }
    return list;
  }, []);

  return (
    <Instances limit={spots.length} castShadow={false}>
      <sphereGeometry args={[0.14, 6, 6]} />
      <meshStandardMaterial
        color={COLORS.light}
        emissive={COLORS.light}
        emissiveIntensity={1.6}
        flatShading
      />
      {spots.map((p, i) => (
        <Instance key={i} position={p} />
      ))}
    </Instances>
  );
}

function HullSkirt() {
  // Suggests the hull dropping to the waterline beneath the deck edge,
  // so the carrier doesn't look like a floating slab from the wide shots.
  return (
    <mesh position={[0, -6, 0]} receiveShadow>
      <boxGeometry args={[DECK.length - 4, 12, DECK.width - 2]} />
      <meshStandardMaterial color={COLORS.hull} flatShading />
    </mesh>
  );
}

export default function Carrier() {
  return (
    <group>
      <mesh position={[0, DECK.y - 0.5, 0]} receiveShadow castShadow>
        <boxGeometry args={[DECK.length, 1, DECK.width]} />
        <meshStandardMaterial color={COLORS.deck} flatShading roughness={0.95} />
      </mesh>

      <HullSkirt />
      <CatapultTrack />
      <DeckMarkings />
      <DeckLights />
      <Island />
    </group>
  );
}
