import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { getOfficeWindow } from "./heroView.js";
import { OFFICES, WALK_FROM, WALK_TO } from "./officeTour.js";

/**
 * On each office stop its occupant comes out from behind the desk and walks
 * toward the camera, which sits outside the floor's glazing - as if stepping up
 * to speak to the viewer while their line is on screen.
 *
 * The figures are sets of sibling meshes, not rigged characters, so the gait is
 * built by hand from the parts: legs and feet swing in opposition, arms
 * counter-swing against them, the body rises twice per stride, and there is a
 * slight lateral sway onto the loaded leg. Everything is driven off one stride
 * phase so the parts stay in step. Blender +y (toward the glazing) is glTF -z.
 */
// Pace is fixed and the duration falls out of it, rather than the distance
// being crammed into whatever the hold happens to be - that is what made the
// earlier version look hurried. At 1.25 m/s and 0.92 strides/sec the stride
// works out at 1.36 m, which is what an unhurried adult walk measures.
const WALK_SPEED = 1.25; // metres per second
const WALK_FRACTION = 0.85; // most of the hold may be spent walking
const STRIDE_HZ = 0.92; // full stride cycles per second (~1.8 steps/sec)
const STEP_REACH = 0.26; // how far each leg swings, metres
const ARM_SWING = 0.19;
const BODY_BOB = 0.028;
const SWAY = 0.022;
const LEAN = 0.03; // torso pitched forward while moving

function easeInOutSine(x) {
  return -(Math.cos(Math.PI * x) - 1) / 2;
}

function roleOf(name) {
  if (/_leg([LR])$/.test(name)) return { kind: "leg", sign: name.endsWith("L") ? 1 : -1 };
  if (/_shoe([LR])$/.test(name)) return { kind: "foot", sign: name.endsWith("L") ? 1 : -1 };
  if (/_(arm|hand)([LR])$/.test(name))
    return { kind: "arm", sign: name.endsWith("L") ? -1 : 1 }; // opposite the leg
  if (/_(head|neck)$/.test(name)) return { kind: "head", sign: 0 };
  return { kind: "body", sign: 0 };
}

function collect(root, walker) {
  const prefix = `Exo_Person_${walker}_`;
  const parts = [];
  root.traverse((obj) => {
    if (!obj.isMesh || !obj.name.startsWith(prefix)) return;
    const { kind, sign } = roleOf(obj.name);
    parts.push({
      node: obj,
      kind,
      sign,
      base: obj.position.clone(),
    });
  });
  return parts;
}

export default function FounderWalk({ root }) {
  const walkers = useMemo(() => {
    if (!root) return [];
    return OFFICES.filter((o) => o.walker)
      .map((office) => {
        const window_ = getOfficeWindow(office.id);
        if (!window_) return null;
        const budget = (window_.end - window_.start) * WALK_FRACTION;
        const duration = Math.min(budget, (WALK_TO - WALK_FROM) / WALK_SPEED);
        return {
          office,
          window: window_,
          duration,
          distance: duration * WALK_SPEED,
          parts: collect(root, office.walker),
        };
      })
      .filter((w) => w && w.parts.length > 0);
  }, [root]);

  const last = useRef(new Map());

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;

    for (const w of walkers) {
      // Walk at a fixed pace, then stand and deliver for the rest of the hold.
      // If a hold is too short for the full distance, the walk is shortened -
      // the pace is not.
      const k = THREE.MathUtils.clamp(
        (t - w.window.start) / w.duration,
        0,
        1
      );
      const moving = k > 0 && k < 1;
      if (!moving && last.current.get(w.office.id) === k) continue;
      last.current.set(w.office.id, k);

      const advance = -w.distance * easeInOutSine(k);
      const phase = t * Math.PI * 2 * STRIDE_HZ;
      const swing = moving ? Math.sin(phase) : 0;
      const bob = moving ? Math.abs(Math.sin(phase)) * BODY_BOB : 0;
      const sway = moving ? Math.cos(phase) * SWAY : 0;

      for (const p of w.parts) {
        let z = p.base.z + advance;
        let y = p.base.y + bob;
        let x = p.base.x + sway;

        if (p.kind === "leg" || p.kind === "foot") {
          z += swing * STEP_REACH * p.sign;
          // the swinging foot lifts, the planted one stays down
          if (p.kind === "foot") {
            y += Math.max(0, swing * p.sign) * 0.05;
          }
        } else if (p.kind === "arm") {
          z += swing * ARM_SWING * p.sign;
        } else if (p.kind === "body") {
          z += moving ? -LEAN : 0;
        } else if (p.kind === "head") {
          // the head stays the steadiest part of a walking body
          y = p.base.y + bob * 0.55;
          z += moving ? -LEAN * 0.5 : 0;
        }

        p.node.position.set(x, y, z);
      }
    }
  });

  return null;
}
