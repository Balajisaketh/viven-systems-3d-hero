import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getTrackCurve } from "../content/track.js";
import RaceCarBody from "./RaceCarBody.jsx";

const CAR_CONFIGS = [
  { color: "#3a86ff", speed: 0.045, offset: 0, lane: -2 },
  { color: "#ffbe0b", speed: 0.052, offset: 0.22, lane: 2 },
  { color: "#8338ec", speed: 0.038, offset: 0.5, lane: -1.5 },
  { color: "#38b000", speed: 0.048, offset: 0.75, lane: 1.5 },
];

function LapCar({ curve, config }) {
  const ref = useRef();
  const wheelRefs = useRef([]);
  const tRef = useRef(config.offset);

  useFrame((_, delta) => {
    tRef.current = (tRef.current + config.speed * delta) % 1;
    const t = tRef.current;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t);
    const right = new THREE.Vector3()
      .crossVectors(tangent, new THREE.Vector3(0, 1, 0))
      .normalize();
    const lanePoint = point.clone().addScaledVector(right, config.lane);

    if (ref.current) {
      ref.current.position.set(lanePoint.x, 0.02, lanePoint.z);
      const lookTarget = lanePoint.clone().add(tangent);
      ref.current.lookAt(lookTarget.x, 0.02, lookTarget.z);
    }

    const approxSpeed = config.speed * 400; // rough visual-only conversion
    wheelRefs.current.forEach((w) => {
      if (w) w.rotation.x -= approxSpeed * delta * 0.3;
    });
  });

  return (
    <group ref={ref}>
      <RaceCarBody color={config.color} wheelRefs={wheelRefs} />
    </group>
  );
}

/**
 * Purely decorative AI cars that loop the track on their own — no physics,
 * no collisions with the player, just "race day" atmosphere.
 */
export default function AICars() {
  const curve = useMemo(() => getTrackCurve(), []);
  return (
    <>
      {CAR_CONFIGS.map((config, i) => (
        <LapCar key={i} curve={curve} config={config} />
      ))}
    </>
  );
}
