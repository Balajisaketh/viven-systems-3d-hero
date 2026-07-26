import React, { useMemo } from "react";
import * as THREE from "three";
import { Instances, Instance } from "@react-three/drei";
import { getTrackCurve, TRACK_WIDTH } from "../content/track.js";

const SEGMENTS = 220;

function buildRoadGeometry(curve) {
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= SEGMENTS; i++) {
    const t = i / SEGMENTS;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const right = new THREE.Vector3()
      .crossVectors(tangent, new THREE.Vector3(0, 1, 0))
      .normalize();

    const left = point.clone().addScaledVector(right, -TRACK_WIDTH / 2);
    const rightEdge = point.clone().addScaledVector(right, TRACK_WIDTH / 2);

    positions.push(left.x, left.y, left.z, rightEdge.x, rightEdge.y, rightEdge.z);
    uvs.push(0, t * 40, 1, t * 40);
  }

  for (let i = 0; i < SEGMENTS; i++) {
    const a = i * 2;
    const b = i * 2 + 1;
    const c = (i + 1) * 2;
    const d = (i + 1) * 2 + 1;
    indices.push(a, b, c, b, d, c);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function buildCurbSpots(curve, count) {
  const spots = [];
  for (let i = 0; i < count; i++) {
    const t = i / count;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const right = new THREE.Vector3()
      .crossVectors(tangent, new THREE.Vector3(0, 1, 0))
      .normalize();
    const angle = Math.atan2(tangent.x, tangent.z);

    ["left", "right"].forEach((side) => {
      const offset = side === "left" ? -(TRACK_WIDTH / 2 + 0.4) : TRACK_WIDTH / 2 + 0.4;
      const pos = point.clone().addScaledVector(right, offset);
      spots.push({ position: [pos.x, 0.06, pos.z], angle, alt: i % 2 === 0 });
    });
  }
  return spots;
}

/** Procedural asphalt texture (grain/noise) so the road isn't flat grey. */
function buildAsphaltTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#303236";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 3500; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const shade = 30 + Math.random() * 70;
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade + 4}, ${0.12 + Math.random() * 0.22})`;
    const r = Math.random() * 1.3 + 0.3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function StartFinishLine({ curve }) {
  const point = curve.getPointAt(0);
  const tangent = curve.getTangentAt(0);
  const angle = Math.atan2(tangent.x, tangent.z);
  const tiles = 8;
  const tileWidth = TRACK_WIDTH / tiles;

  return (
    <group position={[point.x, 0.08, point.z]} rotation={[0, angle, 0]}>
      {new Array(tiles).fill(0).map((_, i) => (
        <mesh
          key={i}
          position={[-TRACK_WIDTH / 2 + i * tileWidth + tileWidth / 2, 0, 0]}
        >
          <boxGeometry args={[tileWidth - 0.05, 0.05, 1.2]} />
          <meshStandardMaterial color={i % 2 === 0 ? "#111111" : "#f4f4f4"} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The racetrack: a closed asphalt ribbon following a Catmull-Rom curve,
 * red/white curb segments along both edges, and a checkered start/finish
 * line. Purely visual — the car's physics still drives on the single flat
 * ground collider underneath, so there's no risk of falling through gaps.
 */
export default function Track() {
  const curve = useMemo(() => getTrackCurve(), []);
  const roadGeometry = useMemo(() => buildRoadGeometry(curve), [curve]);
  const curbSpots = useMemo(() => buildCurbSpots(curve, 70), [curve]);
  const asphaltTexture = useMemo(() => buildAsphaltTexture(), []);

  return (
    <group position={[0, 0.02, 0]}>
      <mesh geometry={roadGeometry} receiveShadow>
        <meshStandardMaterial
          map={asphaltTexture}
          bumpMap={asphaltTexture}
          bumpScale={0.03}
          color="#9a9a9a"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      <Instances limit={curbSpots.length}>
        <boxGeometry args={[0.6, 0.12, 1.4]} />
        <meshStandardMaterial flatShading />
        {curbSpots.map((c, i) => (
          <Instance
            key={i}
            position={c.position}
            rotation={[0, c.angle, 0]}
            color={c.alt ? "#e63946" : "#f1faee"}
          />
        ))}
      </Instances>

      <StartFinishLine curve={curve} />
    </group>
  );
}
