import React, { forwardRef, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import RaceCarBody from "./RaceCarBody.jsx";

/**
 * The player's car: a more realistic race-car body (see RaceCarBody.jsx),
 * driven with a simplified "arcade" rigid body (one dynamic collider,
 * rotation locked to yaw only) rather than a full multi-wheel suspension
 * rig. Much simpler/more robust than a true raycast vehicle while still
 * giving real physics-based driving + collisions.
 */
const Car = forwardRef(function Car(_props, ref) {
  const [, getKeys] = useKeyboardControls();
  const wheelRefs = useRef([]);

  useFrame((_, rawDelta) => {
    const body = ref.current;
    if (!body) return;

    const delta = Math.min(rawDelta, 0.1);
    const keys = getKeys ? getKeys() : {};
    const { forward, backward, left, right, brake } = keys;

    // Punchy arcade acceleration — needs to comfortably beat ground friction
    // and gravity, or the car just sits there feeling "stuck".
    const impulseStrength = 22 * delta;
    const torqueStrength = 14 * delta;

    const rot = body.rotation();
    const quat = new THREE.Quaternion(rot.x, rot.y, rot.z, rot.w);

    const localImpulse = new THREE.Vector3(0, 0, 0);
    if (forward) localImpulse.z -= impulseStrength;
    if (backward) localImpulse.z += impulseStrength * 0.6;

    if (forward || backward) {
      const worldImpulse = localImpulse.applyQuaternion(quat);
      body.applyImpulse({ x: worldImpulse.x, y: 0, z: worldImpulse.z }, true);
    }

    const vel = body.linvel();
    const speed = Math.hypot(vel.x, vel.z);
    // Allow some turning even from a standstill (classic arcade-car feel),
    // ramping up a bit more once moving.
    const turnFactor = Math.max(0.35, Math.min(speed / 3, 1));

    const torque = { x: 0, y: 0, z: 0 };
    if (left) torque.y += torqueStrength * turnFactor;
    if (right) torque.y -= torqueStrength * turnFactor;
    if (left || right) body.applyTorqueImpulse(torque, true);

    if (brake) {
      body.setLinvel({ x: vel.x * 0.85, y: vel.y, z: vel.z * 0.85 }, true);
    }

    const maxSpeed = 11;
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      body.setLinvel({ x: vel.x * scale, y: vel.y, z: vel.z * scale }, true);
    }

    wheelRefs.current.forEach((w) => {
      if (w) w.rotation.x -= speed * delta * 3;
    });
  });

  return (
    <RigidBody
      ref={ref}
      type="dynamic"
      colliders="cuboid"
      position={[0, 1, 10]}
      enabledRotations={[false, true, false]}
      linearDamping={0.5}
      angularDamping={2.2}
      friction={0.4}
    >
      <RaceCarBody color="#e63946" wheelRefs={wheelRefs} />
    </RigidBody>
  );
});

export default Car;
