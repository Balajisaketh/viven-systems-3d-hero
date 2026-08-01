import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import CameraDirector from "./CameraDirector.jsx";
import TimeControl from "./TimeControl.jsx";
import SceneReady from "./SceneReady.jsx";
import BlenderModel from "./BlenderModel.jsx";
import HeroCamera from "./HeroCamera.jsx";
import Greenery from "./Greenery.jsx";
import Landscape from "./Landscape.jsx";
import Entrance from "./Entrance.jsx";
import Reception from "./Reception.jsx";
import FirstFloor from "./FirstFloor.jsx";
import Canteen from "./Canteen.jsx";
import ExecOffices from "./ExecOffices.jsx";
import Visitors from "./Visitors.jsx";
import { HERO_EYE, WIDE_FOV, HERO_NEAR, HERO_FAR } from "./heroView.js";

export default function MonolithScene({ onPhaseChange, onReady }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      gl={{ antialias: true }}
      camera={{
        position: HERO_EYE,
        fov: WIDE_FOV,
        near: HERO_NEAR,
        far: HERO_FAR,
      }}
      style={{ background: "#bcd6e8" }}
    >
      <color attach="background" args={["#bcd6e8"]} />
      {/* Haze starts past the hills so the far ridge dissolves into the sky. */}
      <fog attach="fog" args={["#bcd6e8", 700, 2600]} />

      <TimeControl />
      <HeroCamera />

      <ambientLight intensity={0.28} color="#eef4fa" />
      <hemisphereLight args={["#cfe4f5", "#3a4a38", 0.32]} />
      <directionalLight
        position={[-60, 85, -120]}
        intensity={1.1}
        color="#fff4d6"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-120}
        shadow-camera-right={120}
        shadow-camera-top={120}
        shadow-camera-bottom={-120}
        shadow-camera-near={0.5}
        shadow-camera-far={500}
        shadow-bias={-0.0005}
      />
      <directionalLight
        position={[40, 25, 60]}
        intensity={0.18}
        color="#9fc5ff"
      />

      <Landscape />

      <Suspense fallback={null}>
        <BlenderModel />
        <Entrance />
        <Reception />
        <FirstFloor />
        <Canteen />
        <ExecOffices />
        <Visitors />
        <Greenery />
        <SceneReady onReady={onReady} />
      </Suspense>

      <CameraDirector onState={(s) => onPhaseChange?.(s)} />
    </Canvas>
  );
}
