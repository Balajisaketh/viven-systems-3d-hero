import React, { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";

/**
 * The city the campus sits in: an asphalt ground plane, a road grid running out
 * to the horizon, and belts of towers that climb in height with distance so the
 * skyline reads as a tech district rather than open country.
 *
 * The GLB ships a flat 400x400 terrain plate which ends in a hard edge against
 * the sky; BlenderModel hides it (see the Terrain_ handling there) and this
 * replaces it.
 *
 * All distances are in scene units (glTF frame: x right, y up, z back) measured
 * from the campus centre. The compound wall in Greenery reaches x +/-49,
 * z -89..29, so nothing built here comes closer than CITY_INNER_RADIUS and
 * everything is additionally held out of KEEP_CLEAR.
 */

const ASPHALT = "#3c4045";
const ROAD = "#2b2e33";
const ROAD_MARKING = "#8e9298";

// Concrete, glass and steel rather than the old hill greens.
const NEAR_TINTS = ["#6c737c", "#5b636d", "#7a828c", "#4f565f", "#68727e"];
const FAR_TINTS = ["#7d8794", "#6d7784", "#8a94a1", "#5f6a77"];

// Nothing is planted inside this rect - it covers the plaza pad and the
// compound wall around it, with margin.
const KEEP_CLEAR = { x0: -72, x1: 72, z0: -112, z1: 52 };

const CITY_INNER_RADIUS = 132;

function mulberry32(seed) {
  let a = seed;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isClear(x, z) {
  if (
    x > KEEP_CLEAR.x0 &&
    x < KEEP_CLEAR.x1 &&
    z > KEEP_CLEAR.z0 &&
    z < KEEP_CLEAR.z1
  ) {
    return false;
  }
  // The named offices below are placed by hand; keep the scattered belts from
  // growing through them.
  return !NAMED_OFFICES.some(
    (o) =>
      Math.abs(x - o.x) < o.w / 2 + 30 && Math.abs(z - o.z) < o.d / 2 + 30
  );
}

/**
 * A ring of boxes standing on the ground - one instanced draw call. Footprints
 * are squarish and axis-aligned in blocks, which is what makes a scatter of
 * boxes read as a city rather than as crates: they line up with the roads.
 */
function TowerBelt({
  seed,
  count,
  minRadius,
  maxRadius,
  minFootprint,
  maxFootprint,
  minHeight,
  maxHeight,
  palette,
  gridSnap,
}) {
  const ref = useRef();

  const items = useMemo(() => {
    const rng = mulberry32(seed);
    const out = [];
    let guard = 0;
    while (out.length < count && guard < count * 40) {
      guard += 1;
      const angle = rng() * Math.PI * 2;
      const radius = minRadius + Math.pow(rng(), 0.75) * (maxRadius - minRadius);
      // Snapping to a coarse grid puts the towers into blocks that agree with
      // the road grid below, instead of a uniform sprinkle.
      const x = Math.round((Math.cos(angle) * radius) / gridSnap) * gridSnap;
      const z = Math.round((Math.sin(angle) * radius) / gridSnap) * gridSnap;
      if (!isClear(x, z)) continue;
      const w = minFootprint + rng() * (maxFootprint - minFootprint);
      out.push({
        x: x + (rng() - 0.5) * gridSnap * 0.3,
        z: z + (rng() - 0.5) * gridSnap * 0.3,
        w,
        d: w * (0.7 + rng() * 0.6),
        height: minHeight + Math.pow(rng(), 1.5) * (maxHeight - minHeight),
        tint: palette[Math.floor(rng() * palette.length)],
      });
    }
    return out;
  }, [
    seed,
    count,
    minRadius,
    maxRadius,
    minFootprint,
    maxFootprint,
    minHeight,
    maxHeight,
    palette,
    gridSnap,
  ]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const color = new THREE.Color();

    items.forEach((it, i) => {
      // Box geometry is unit-sized centred on its middle, so lift by half the
      // height to stand it on the ground.
      pos.set(it.x, it.height * 0.5 - 0.5, it.z);
      scl.set(it.w, it.height, it.d);
      ref.current.setMatrixAt(i, m.compose(pos, q, scl));
      ref.current.setColorAt(i, color.set(it.tint));
    });

    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, [items]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, items.length]}
      frustumCulled={false}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.62} metalness={0.18} />
    </instancedMesh>
  );
}

/**
 * The road grid. Strips sit just under the plaza pad (which is at y 0) so the
 * stretch that passes beneath the campus is hidden rather than cutting through
 * it, and the centre lines sit a hair above the asphalt.
 */
function Roads() {
  const SPACING = 165;
  const REACH = 1750;
  const WIDTH = 22;

  const lines = useMemo(() => {
    const out = [];
    for (let d = -REACH; d <= REACH; d += SPACING) out.push(d);
    return out;
  }, [REACH, SPACING]);

  return (
    <group name="Roads">
      {lines.map((z, i) => (
        <mesh key={`ew-${i}`} position={[0, -0.035, z]} receiveShadow>
          <boxGeometry args={[REACH * 2, 0.04, WIDTH]} />
          <meshStandardMaterial color={ROAD} roughness={0.95} />
        </mesh>
      ))}
      {lines.map((x, i) => (
        <mesh key={`ns-${i}`} position={[x, -0.03, 0]} receiveShadow>
          <boxGeometry args={[WIDTH, 0.04, REACH * 2]} />
          <meshStandardMaterial color={ROAD} roughness={0.95} />
        </mesh>
      ))}
      {/* Dashed-look centre lines, one per road, as a single thin strip. */}
      {lines.map((z, i) => (
        <mesh key={`ewm-${i}`} position={[0, -0.008, z]}>
          <boxGeometry args={[REACH * 2, 0.02, 0.7]} />
          <meshStandardMaterial color={ROAD_MARKING} roughness={0.8} />
        </mesh>
      ))}
      {lines.map((x, i) => (
        <mesh key={`nsm-${i}`} position={[x, -0.006, 0]}>
          <boxGeometry args={[0.7, 0.02, REACH * 2]} />
          <meshStandardMaterial color={ROAD_MARKING} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Named tech offices in the near belt. These are individual meshes rather than
 * instances, because each carries its own sign - the name is drawn to a canvas
 * and used as an emissive texture, which keeps the whole thing self-contained
 * (no font files to fetch) and costs one small texture per building.
 *
 * Positions are hand-placed rather than scattered: every one of these needs to
 * face the campus to be legible, and only the arc behind and beside the
 * building is ever in shot.
 */
const NAMED_OFFICES = [
  { name: "NEXORA", x: -168, z: -210, w: 46, d: 34, h: 40 },
  { name: "BYTEFORGE", x: -60, z: -252, w: 52, d: 36, h: 52 },
  { name: "QUANTLY", x: 62, z: -246, w: 44, d: 34, h: 34 },
  { name: "HELIXWORKS", x: 176, z: -196, w: 50, d: 38, h: 46 },
  { name: "CODENOVA", x: -244, z: -96, w: 42, d: 44, h: 36 },
  { name: "SYNAPTIQ", x: 246, z: -104, w: 46, d: 42, h: 44 },
  { name: "DATAVERSE", x: -232, z: 66, w: 44, d: 40, h: 30 },
  { name: "ORBITAL LABS", x: 238, z: 74, w: 48, d: 40, h: 38 },
  { name: "CIPHERWAVE", x: -150, z: -340, w: 54, d: 40, h: 62 },
  { name: "NEURALIS", x: 152, z: -334, w: 50, d: 40, h: 58 },
  { name: "STACKLANE", x: 12, z: -368, w: 56, d: 42, h: 70 },
];

const SIGN_TINT = "#69737f";

function makeSignTexture(label) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0d1218";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#cfe4ff";
  ctx.font = "bold 62px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Squeeze long names to fit rather than letting them run off the sign.
  const maxWidth = canvas.width - 40;
  ctx.fillText(label, canvas.width / 2, canvas.height / 2 + 4, maxWidth);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function NamedOffice({ name, x, z, w, d, h }) {
  const tex = useMemo(() => makeSignTexture(name), [name]);
  useLayoutEffect(() => () => tex.dispose(), [tex]);

  // The sign sits near the top of the face that looks back toward the campus,
  // which for everything in the belt behind the building is the +z face.
  const signW = Math.min(w * 0.8, 34);
  const signH = signW / 4;

  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color={SIGN_TINT} roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0, h - signH * 1.1, d / 2 + 0.3]}>
        <planeGeometry args={[signW, signH]} />
        <meshStandardMaterial
          map={tex}
          emissiveMap={tex}
          emissive="#ffffff"
          emissiveIntensity={1.5}
          toneMapped={false}
          roughness={0.5}
        />
      </mesh>
    </group>
  );
}

export default function Landscape() {
  return (
    <group name="Landscape">
      {/* The ground: asphalt running out past the far towers. */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.06} receiveShadow>
        <circleGeometry args={[2600, 96]} />
        <meshStandardMaterial color={ASPHALT} roughness={1} />
      </mesh>

      <Roads />

      {/* The neighbours: named tech offices ringing the campus. */}
      {NAMED_OFFICES.map((o) => (
        <NamedOffice key={o.name} {...o} />
      ))}

      {/* Low-rise blocks immediately around the compound. */}
      <TowerBelt
        seed={11}
        count={70}
        minRadius={CITY_INNER_RADIUS}
        maxRadius={330}
        minFootprint={26}
        maxFootprint={54}
        minHeight={14}
        maxHeight={52}
        palette={NEAR_TINTS}
        gridSnap={55}
      />

      {/* Mid-rise district. */}
      <TowerBelt
        seed={29}
        count={78}
        minRadius={350}
        maxRadius={760}
        minFootprint={34}
        maxFootprint={72}
        minHeight={38}
        maxHeight={125}
        palette={NEAR_TINTS}
        gridSnap={82}
      />

      {/* The far skyline - tall, and hazed out by the scene fog. */}
      <TowerBelt
        seed={53}
        count={86}
        minRadius={800}
        maxRadius={1650}
        minFootprint={48}
        maxFootprint={110}
        minHeight={90}
        maxHeight={300}
        palette={FAR_TINTS}
        gridSnap={120}
      />
    </group>
  );
}
