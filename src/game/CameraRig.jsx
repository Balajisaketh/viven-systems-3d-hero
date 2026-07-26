import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/** Smooth third-person camera that follows the car's rigid body. */
export default function CameraRig({ target }) {
  const { camera } = useThree();

  useFrame(() => {
    const body = target.current;
    if (!body) return;

    const t = body.translation();
    const r = body.rotation();
    const quat = new THREE.Quaternion(r.x, r.y, r.z, r.w);

    const offset = new THREE.Vector3(0, 3.5, 7).applyQuaternion(quat);
    const desired = new THREE.Vector3(t.x, t.y, t.z).add(offset);

    camera.position.lerp(desired, 0.06);
    camera.lookAt(t.x, t.y + 1, t.z);
  });

  return null;
}
