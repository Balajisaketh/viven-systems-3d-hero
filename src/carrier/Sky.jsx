import React, { useMemo } from "react";
import * as THREE from "three";
import { Billboard } from "@react-three/drei";

const SKY_VERTEX = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SKY_FRAGMENT = /* glsl */ `
  varying vec3 vWorldPos;
  uniform vec3 uHorizon;
  uniform vec3 uMid;
  uniform vec3 uZenith;

  void main() {
    float h = normalize(vWorldPos).y;
    vec3 color = mix(uHorizon, uMid, smoothstep(0.0, 0.25, h));
    color = mix(color, uZenith, smoothstep(0.2, 0.85, h));
    gl_FragColor = vec4(color, 1.0);
  }
`;

function CloudPuff({ position, scale = 1, opacity = 0.5 }) {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    grad.addColorStop(0, "rgba(255,255,255,0.9)");
    grad.addColorStop(0.6, "rgba(255,255,255,0.35)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }, []);

  return (
    <Billboard position={position}>
      <mesh scale={[scale * 14, scale * 6, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent
          opacity={opacity}
          color="#ffdfc2"
          depthWrite={false}
        />
      </mesh>
    </Billboard>
  );
}

const CLOUD_SPOTS = [
  [-90, 24, -140, 1.4, 0.5],
  [60, 30, -170, 1.8, 0.45],
  [140, 20, -80, 1.2, 0.4],
  [-140, 34, -60, 1.6, 0.35],
  [10, 18, -200, 2.2, 0.5],
  [-40, 40, -190, 1.3, 0.3],
];

export default function Sky() {
  const uniforms = useMemo(
    () => ({
      uHorizon: { value: new THREE.Color("#ffb27a") },
      uMid: { value: new THREE.Color("#ffd9b0") },
      uZenith: { value: new THREE.Color("#5b7fb8") },
    }),
    []
  );

  return (
    <>
      <mesh scale={[1, 1, 1]}>
        <sphereGeometry args={[450, 24, 16]} />
        <shaderMaterial
          side={THREE.BackSide}
          uniforms={uniforms}
          vertexShader={SKY_VERTEX}
          fragmentShader={SKY_FRAGMENT}
          depthWrite={false}
        />
      </mesh>

      {/* sun disc, low on the horizon, additionally bloomed by postprocessing.
          Billboarded so it reads correctly from every camera cut. */}
      <Billboard position={[-220, 26, -260]}>
        <mesh>
          <circleGeometry args={[16, 24]} />
          <meshBasicMaterial color="#fff1c2" toneMapped={false} />
        </mesh>
      </Billboard>

      {CLOUD_SPOTS.map((c, i) => (
        <CloudPuff key={i} position={[c[0], c[1], c[2]]} scale={c[3]} opacity={c[4]} />
      ))}
    </>
  );
}
