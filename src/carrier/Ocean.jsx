import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const VERTEX = /* glsl */ `
  varying float vHeight;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;
  uniform float uTime;

  // Sum-of-sines height field + its analytic gradient, so the water gets a
  // real, lit normal instead of a flat shaded plane.
  struct Wave { float freq; float amp; float speed; vec2 dir; };

  void waveField(vec2 p, out float h, out vec2 grad) {
    Wave waves[4];
    waves[0] = Wave(0.055, 0.5,  0.55, normalize(vec2(1.0, 0.35)));
    waves[1] = Wave(0.13,  0.24, 1.05, normalize(vec2(-0.6, 1.0)));
    waves[2] = Wave(0.32,  0.09, 1.7,  normalize(vec2(0.8, -0.65)));
    waves[3] = Wave(0.9,   0.03, 2.6,  normalize(vec2(-0.4, -0.9)));

    h = 0.0;
    grad = vec2(0.0);
    for (int i = 0; i < 4; i++) {
      float phase = dot(p, waves[i].dir) * waves[i].freq + uTime * waves[i].speed;
      h += sin(phase) * waves[i].amp;
      float dphase = cos(phase) * waves[i].amp * waves[i].freq;
      grad += waves[i].dir * dphase;
    }
  }

  void main() {
    vec3 pos = position;
    float h;
    vec2 grad;
    waveField(pos.xy, h, grad);
    pos.z += h;
    vHeight = h;

    vec3 localNormal = normalize(vec3(-grad.x, -grad.y, 1.0));
    vNormalW = normalize(normalMatrix * localNormal);

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vViewPos = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT = /* glsl */ `
  varying float vHeight;
  varying vec3 vNormalW;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;

  uniform vec3 uDeep;
  uniform vec3 uShallow;
  uniform vec3 uFoam;
  uniform vec3 uSunColor;
  uniform vec3 uSunDir;
  uniform vec3 uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform float uTime;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec3 N = normalize(vNormalW);
    vec3 V = normalize(vViewPos);
    vec3 L = normalize(uSunDir);

    // Base color: darker in the troughs, brighter teal on the crests.
    float crest = smoothstep(0.02, 0.42, vHeight);
    vec3 base = mix(uDeep, uShallow, crest);

    // Diffuse response to the sun so the water reads as lit, not flat.
    float diffuse = clamp(dot(N, L), 0.0, 1.0);
    base *= 0.72 + 0.4 * diffuse;

    // Broad sun-path shimmer plus tight glitter sparkle, both from the
    // same sun reflection so it lines up with the actual key light.
    vec3 R = reflect(-L, N);
    float specBroad = pow(max(dot(R, V), 0.0), 28.0);
    float specSharp = pow(max(dot(R, V), 0.0), 220.0);

    vec2 cell = floor(vWorldPos.xz * 3.2 + uTime * 0.15);
    float sparkleMask = step(0.986, hash(cell));
    float sparkle = sparkleMask * specSharp * 6.0;

    vec3 sunHighlight = uSunColor * (specBroad * 0.5 + sparkle);

    // Fresnel brightening at grazing angles.
    float fresnel = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 4.0);
    base = mix(base, uShallow * 1.4, fresnel * 0.4);

    // Foam on the sharpest crests only.
    float foamMask = smoothstep(0.34, 0.46, vHeight);
    base = mix(base, uFoam, foamMask * 0.6);

    vec3 color = base + sunHighlight;

    float viewDist = length(vViewPos);
    float fogFactor = clamp((viewDist - uFogNear) / (uFogFar - uFogNear), 0.0, 1.0);
    color = mix(color, uFogColor, fogFactor);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function Ocean() {
  const matRef = useRef();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDeep: { value: new THREE.Color("#093247") },
      uShallow: { value: new THREE.Color("#2996a8") },
      uFoam: { value: new THREE.Color("#eef7f4") },
      uSunColor: { value: new THREE.Color("#ffdca0") },
      uSunDir: { value: new THREE.Vector3(-140, 55, -90).normalize() },
      uFogColor: { value: new THREE.Color("#f2c199") },
      uFogNear: { value: 60 },
      uFogFar: { value: 220 },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (matRef.current) matRef.current.uniforms.uTime.value = clock.elapsedTime;
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
      <planeGeometry args={[600, 600, 180, 180]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
      />
    </mesh>
  );
}
