import React, { useMemo, useRef, useLayoutEffect } from "react";
import * as THREE from "three";

/**
 * Planting around the HQ: tree rows along the plaza edges, hedge beds flanking
 * the building, and a loose grove out on the terrain beyond the pad. The GLB
 * only plants 24 trees either side of the reflecting pool, which leaves the
 * campus bare once the camera pushes in.
 *
 * Coordinates below are written in the Blender layout the model was built in
 * (Z-up: plaza x -45..45, y -25..85; HQ block x -26..26, y 2..20; tower
 * x -6.5..10.5, y -16..0; reflecting pool x -16..16, y 32..52) and converted to
 * the glTF Y-up frame on the way out, so they can be read against the .blend.
 */

const TRUNK_COLOR = "#3a3227";
const HEDGE_COLOR = "#44643c";

/**
 * Three species, so the planting does not read as one shape stamped out. Each
 * is its own pair of instanced draws (trunk + canopy), picked per tree.
 *   broadleaf - the original faceted dome, the bulk of the planting
 *   conifer   - tall narrow cone, used as vertical accents
 *   ornamental- small round-headed tree on a short trunk, for the avenue rows
 */
const SPECIES = {
  broadleaf: { canopy: "#3f5f38", trunkH: 3.2, canopyY: 4.2, canopyR: 1.7 },
  conifer: { canopy: "#2f4a33", trunkH: 2.4, canopyY: 4.6, canopyR: 1.35 },
  ornamental: { canopy: "#557c46", trunkH: 2.2, canopyY: 3.1, canopyR: 1.25 },
};
const SPECIES_KEYS = Object.keys(SPECIES);
const WALL_COLOR = "#8b8d8a";
const PIER_COLOR = "#6e716f";
const RAIL_COLOR = "#2f3237";

/**
 * The compound that separates the campus from the city around it (see
 * Landscape, which builds the tech district outside). Blender x/y, matching the
 * plaza pad at x -45..45, y -25..85 with a small margin. The gate sits in the
 * front wall on the approach side, centred on the entrance axis.
 */
const COMPOUND = { x0: -49, x1: 49, y0: -29, y1: 89 };
const WALL_H = 2.4;
const WALL_T = 0.6;
const GATE_HALF = 8;

// Planting is held inside the wall - everything beyond it is city now, so the
// old grove that ran out across open terrain has nowhere to stand.
const COMPOUND_INSET = 3;

// Keeps the layout identical on every load - a random scatter that reshuffles
// each refresh reads as a glitch in a hero shot.
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

// Clipped hedge beds hugging the sides of the HQ, in Blender x/y with width
// along x and depth along y.
const HEDGES = [
  { x: -37, y: 11, w: 11, d: 26 },
  { x: 37, y: 11, w: 11, d: 26 },
  { x: -37, y: 66, w: 11, d: 22 },
  { x: 37, y: 66, w: 11, d: 22 },
  { x: 0, y: 78, w: 46, d: 8 },
];

// The approach corridor: the camera runs from the plaza to the doors down the
// x=0 axis, and anything planted in that band ends up crowding the entrance and
// swiping across the lens on the way in. Nothing gets planted here.
const ENTRANCE_CORRIDOR = { x0: -16, x1: 16, y0: 18, y1: 78 };

// Footprints new trees must stay clear of, in Blender x/y (already padded).
const KEEP_CLEAR = [
  ENTRANCE_CORRIDOR,
  { x0: -30, x1: 30, y0: -2, y1: 24 }, // HQ main volume
  { x0: -11, x1: 15, y0: -20, y1: 4 }, // tower
  { x0: -20, x1: 20, y0: 28, y1: 56 }, // reflecting pool
  { x0: -34, x1: 34, y0: 42, y1: 52 }, // the GLB's existing tree rows
  ...HEDGES.map((h) => ({
    x0: h.x - h.w / 2 - 2,
    x1: h.x + h.w / 2 + 2,
    y0: h.y - h.d / 2 - 2,
    y1: h.y + h.d / 2 + 2,
  })),
];

function isClear(x, y) {
  return !KEEP_CLEAR.some((b) => x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1);
}

function inCompound(x, y, inset = COMPOUND_INSET) {
  return (
    x > COMPOUND.x0 + inset &&
    x < COMPOUND.x1 - inset &&
    y > COMPOUND.y0 + inset &&
    y < COMPOUND.y1 - inset
  );
}

function buildTrees() {
  const rng = mulberry32(20260801);
  const trees = [];
  // Planting is laid out, not scattered: fixed spacings, exact lines, and only
  // a few percent of size variation so the rows read as deliberate landscaping
  // rather than undergrowth. `i` seeds that variation per tree so it stays
  // identical on every load.
  let i = 0;
  const push = (x, y, scale, species, vary = 0.06) => {
    i += 1;
    if (!isClear(x, y)) return;
    // Nothing plants outside the wall - that ground belongs to the city.
    if (!inCompound(x, y)) return;
    const wobble = 1 + ((i * 37) % 100) / 100 * vary * 2 - vary;
    trees.push({
      x,
      y,
      scale: scale * wobble,
      species: species || SPECIES_KEYS[i % SPECIES_KEYS.length],
      spin: rng() * Math.PI * 2,
      lean: rng(),
    });
  };

  // The avenue: two straight ranks either side of the approach, evenly spaced
  // and squared to the plaza, so the walk to the doors is framed symmetrically.
  for (let y = -20; y <= 80; y += 8.5) {
    for (const side of [-1, 1]) {
      push(side * 38, y, 1.05, "broadleaf");
    }
  }
  // An inner rank of the smaller ornamental, offset half a bay so the two ranks
  // read as one composition rather than a doubled line.
  for (let y = -15.75; y <= 78; y += 8.5) {
    for (const side of [-1, 1]) {
      push(side * 33, y, 0.8, "ornamental");
    }
  }

  // Ranks flanking the HQ block (x -30..30, y -2..24), filling the ground
  // between facade and wall.
  for (let y = -4; y <= 26; y += 5.5) {
    for (const side of [-1, 1]) {
      push(side * 32.5, y, 0.9, "conifer");
      push(side * 42, y, 1.0, "broadleaf");
    }
  }

  // Conifer accents marking the four corners of the pool court.
  for (const sx of [-1, 1]) {
    for (const sy of [0, 1]) {
      push(sx * 25, sy ? 58 : 26, 1.2, "conifer");
    }
  }

  // An even band behind the tower so the back of the campus is not bald.
  for (let x = -42; x <= 42; x += 7) {
    push(x, -22, 0.95, "broadleaf");
  }

  // The grounds: a regular orchard grid on an 11-unit module, aligned to the
  // building axis. Species alternate on the diagonal, which keeps the rows
  // legible from the air without turning into a chequerboard.
  const STEP = 11;
  for (let x = COMPOUND.x0 + STEP; x < COMPOUND.x1; x += STEP) {
    for (let y = COMPOUND.y0 + STEP; y < COMPOUND.y1; y += STEP) {
      const parity = (Math.round(x / STEP) + Math.round(y / STEP)) % 3;
      push(x, y, 0.95, SPECIES_KEYS[parity % SPECIES_KEYS.length], 0.04);
    }
  }

  return trees;
}

/** Trunk + canopy for one species, as a pair of instanced draws. */
function SpeciesGroup({ name, trees }) {
  const trunkRef = useRef();
  const canopyRef = useRef();
  const spec = SPECIES[name];

  useLayoutEffect(() => {
    if (!trees.length) return;
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const pos = new THREE.Vector3();
    const scl = new THREE.Vector3();
    const euler = new THREE.Euler();

    trees.forEach((t, i) => {
      // Blender (x, y, z-up) -> glTF (x, z-up becomes y, -y becomes z)
      const gx = t.x;
      const gz = -t.y;
      const s = t.scale;

      euler.set(0, t.spin, 0);
      q.setFromEuler(euler);

      pos.set(gx, (spec.trunkH / 2) * s, gz);
      scl.set(s, s, s);
      trunkRef.current.setMatrixAt(i, m.compose(pos, q, scl));

      pos.set(gx, spec.canopyY * s, gz);
      scl.set(s * (0.9 + t.lean * 0.3), s * (1.05 + t.lean * 0.35), s);
      canopyRef.current.setMatrixAt(i, m.compose(pos, q, scl));
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    canopyRef.current.instanceMatrix.needsUpdate = true;
  }, [trees, spec]);

  if (!trees.length) return null;

  return (
    <group name={`Trees_${name}`}>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, trees.length]}
        castShadow
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.16, 0.24, spec.trunkH, 6]} />
        <meshStandardMaterial color={TRUNK_COLOR} roughness={0.95} />
      </instancedMesh>

      <instancedMesh
        ref={canopyRef}
        args={[undefined, undefined, trees.length]}
        castShadow
        frustumCulled={false}
      >
        {name === "conifer" ? (
          <coneGeometry args={[spec.canopyR, spec.canopyR * 3.4, 7]} />
        ) : (
          <icosahedronGeometry args={[spec.canopyR, 1]} />
        )}
        <meshStandardMaterial color={spec.canopy} roughness={0.9} flatShading />
      </instancedMesh>
    </group>
  );
}

function Trees() {
  const trees = useMemo(buildTrees, []);
  const bySpecies = useMemo(() => {
    const groups = {};
    for (const key of SPECIES_KEYS) groups[key] = [];
    for (const t of trees) groups[t.species].push(t);
    return groups;
  }, [trees]);

  return (
    <group>
      {SPECIES_KEYS.map((key) => (
        <SpeciesGroup key={key} name={key} trees={bySpecies[key]} />
      ))}
    </group>
  );
}

function Hedges() {
  return (
    <group>
      {HEDGES.map((h, i) => (
        <mesh
          key={i}
          position={[h.x, 0.7, -h.y]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[h.w, 1.4, h.d]} />
          <meshStandardMaterial color={HEDGE_COLOR} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * The compound wall, in Blender x/y converted to glTF on the way out
 * ([x, height/2, -y]). The front run is split either side of the gate so the
 * approach stays open on the entrance axis, with piers marking the opening and
 * a low rail spanning it.
 */
function Compound() {
  const spanX = COMPOUND.x1 - COMPOUND.x0;
  const spanY = COMPOUND.y1 - COMPOUND.y0;
  const midX = (COMPOUND.x0 + COMPOUND.x1) / 2;
  const midY = (COMPOUND.y0 + COMPOUND.y1) / 2;

  // Pier positions along the side and back runs, for the buttressed look.
  const piers = [];
  for (let y = COMPOUND.y0; y <= COMPOUND.y1; y += 14.75) {
    piers.push([COMPOUND.x0, y]);
    piers.push([COMPOUND.x1, y]);
  }
  for (let x = COMPOUND.x0 + 14; x < COMPOUND.x1; x += 14) {
    piers.push([x, COMPOUND.y0]);
  }

  return (
    <group name="Compound">
      {/* Back run. */}
      <mesh position={[midX, WALL_H / 2, -COMPOUND.y0]} castShadow receiveShadow>
        <boxGeometry args={[spanX, WALL_H, WALL_T]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
      </mesh>

      {/* Side runs. */}
      {[COMPOUND.x0, COMPOUND.x1].map((x) => (
        <mesh
          key={x}
          position={[x, WALL_H / 2, -midY]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[WALL_T, WALL_H, spanY]} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
        </mesh>
      ))}

      {/* Front run, split either side of the gate opening. */}
      {[-1, 1].map((side) => {
        const outer = side * COMPOUND.x1;
        const inner = side * GATE_HALF;
        const run = Math.abs(outer - inner);
        return (
          <mesh
            key={side}
            position={[(outer + inner) / 2, WALL_H / 2, -COMPOUND.y1]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[run, WALL_H, WALL_T]} />
            <meshStandardMaterial color={WALL_COLOR} roughness={0.95} />
          </mesh>
        );
      })}

      {/* Gate piers - taller than the wall, so the opening reads as an entrance. */}
      {[-GATE_HALF, GATE_HALF].map((x) => (
        <mesh
          key={x}
          position={[x, (WALL_H + 1.5) / 2, -COMPOUND.y1]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.6, WALL_H + 1.5, 1.6]} />
          <meshStandardMaterial color={PIER_COLOR} roughness={0.9} />
        </mesh>
      ))}

      {/* Buttress piers down the side and back runs. */}
      {piers.map(([x, y], i) => (
        <mesh
          key={`pier-${i}`}
          position={[x, (WALL_H + 0.5) / 2, -y]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1.1, WALL_H + 0.5, 1.1]} />
          <meshStandardMaterial color={PIER_COLOR} roughness={0.9} />
        </mesh>
      ))}

      {/* Dark coping along the top of each run, which is what stops a plain box
          reading as a kerb rather than a wall. */}
      <mesh position={[midX, WALL_H + 0.06, -COMPOUND.y0]}>
        <boxGeometry args={[spanX, 0.12, WALL_T + 0.16]} />
        <meshStandardMaterial color={RAIL_COLOR} roughness={0.8} />
      </mesh>
      {[COMPOUND.x0, COMPOUND.x1].map((x) => (
        <mesh key={`cope-${x}`} position={[x, WALL_H + 0.06, -midY]}>
          <boxGeometry args={[WALL_T + 0.16, 0.12, spanY]} />
          <meshStandardMaterial color={RAIL_COLOR} roughness={0.8} />
        </mesh>
      ))}
      {[-1, 1].map((side) => {
        const outer = side * COMPOUND.x1;
        const inner = side * GATE_HALF;
        return (
          <mesh
            key={`copef-${side}`}
            position={[(outer + inner) / 2, WALL_H + 0.06, -COMPOUND.y1]}
          >
            <boxGeometry args={[Math.abs(outer - inner), 0.12, WALL_T + 0.16]} />
            <meshStandardMaterial color={RAIL_COLOR} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Greenery() {
  return (
    <group name="Greenery">
      <Compound />
      <Trees />
      <Hedges />
    </group>
  );
}
