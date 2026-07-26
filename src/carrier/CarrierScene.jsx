import React from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import Carrier from "./Carrier.jsx";
import Jet from "./Jet.jsx";
import Ocean from "./Ocean.jsx";
import Sky from "./Sky.jsx";
import CameraDirector from "./CameraDirector.jsx";

export default function CarrierScene({ onPhaseChange }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.6]}
      gl={{ antialias: true }}
      camera={{ position: [-27, 1.6, 8.7], fov: 38, near: 0.1, far: 900 }}
    >
      <color attach="background" args={["#ffcf9e"]} />
      <fog attach="fog" args={["#f2c199", 70, 240]} />

      <hemisphereLight args={["#ffdcb0", "#2c3542", 0.55]} />
      <directionalLight
        position={[-140, 55, -90]}
        intensity={2.4}
        color="#ffb066"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-camera-far={300}
      />
      <directionalLight position={[40, 30, 60]} intensity={0.35} color="#8fb8ff" />

      <Sky />
      <Ocean />
      <Carrier />
      <Jet />
      <CameraDirector onPhaseChange={onPhaseChange} />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.55}
          luminanceThreshold={0.65}
          luminanceSmoothing={0.2}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.15} darkness={0.6} />
      </EffectComposer>
    </Canvas>
  );
}
