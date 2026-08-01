import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  sampleHeroShot,
  blenderToGltf,
  eyeDir,
  HERO_FRAMED_ASPECT,
  HERO_NEAR,
  HERO_FAR,
} from "./heroView.js";

/**
 * Drives the camera through the hero beats (see heroView.js): the wide campus
 * hold, the push onto the entrance, and the move through the doors into the
 * reception. Aim, orbit angle, distance and lens all ease together, so the
 * whole thing reads as one continuous arrival.
 *
 * The shot is composed for a wide viewport. On narrower ones the camera dollies
 * back to keep the campus in frame - but only while we are outside; once the
 * shot is in the lobby, backing up would put the camera through the wall, so
 * the correction moves into the lens instead.
 */
export default function HeroCamera() {
  const shot = useRef({});
  const aim = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());

  useFrame(({ camera, clock, size }) => {
    const s = sampleHeroShot(clock.elapsedTime, shot.current);

    aim.current.set(...blenderToGltf(s.aim));
    dir.current.set(...eyeDir(s.az, s.el));

    const aspect = size.width / size.height;
    const squeeze =
      aspect < HERO_FRAMED_ASPECT ? HERO_FRAMED_ASPECT / aspect : 1;
    const dolly = 1 + (squeeze - 1) * (1 - s.insideness);
    const widen = 1 + (squeeze - 1) * s.insideness * 0.6;

    camera.position
      .copy(aim.current)
      .addScaledVector(dir.current, s.dist * dolly);
    camera.up.set(0, 1, 0);
    camera.lookAt(aim.current);

    const fov = s.fov * widen;
    if (
      Math.abs(camera.fov - fov) > 0.001 ||
      Math.abs(camera.aspect - aspect) > 0.001
    ) {
      camera.fov = fov;
      camera.aspect = aspect;
      camera.near = HERO_NEAR;
      camera.far = HERO_FAR;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
