import * as THREE from "three";

/**
 * The Blender facade glass exports at alpha 1, so the entrance glazing and the
 * door leaves come through as solid panes - you approach a lit lobby and see a
 * flat green-grey wall. This turns those materials into real glass: see-through
 * enough to read the reception behind them, with the sheen kept.
 *
 * depthWrite is off so the interior draws through the pane rather than being
 * depth-rejected by it, and the glass renders after everything else so the
 * sorting lands the right way round.
 *
 * Only the facade and doors are treated. The tower glazing stays opaque - it
 * fronts a solid block with nothing behind it, and turning it to glass just
 * exposes the inside faces of the box.
 */
const FACADE_GLASS = /facade_glass/i;

export function makeGlass(material) {
  if (!material || !material.name || !FACADE_GLASS.test(material.name)) return false;

  material.transparent = true;
  material.opacity = 0.26;
  material.depthWrite = false;
  material.side = THREE.DoubleSide;
  if (material.roughness !== undefined) material.roughness = 0.04;
  if (material.metalness !== undefined) material.metalness = 0.12;
  // Slightly cooler and lighter than the exported colour, so it reads as
  // glazing rather than tinted plastic.
  if (material.color) material.color.setHex(0xa8c4cc);
  material.needsUpdate = true;
  return true;
}

/** Draw order for glass: after opaque geometry, so the lobby shows through. */
export const GLASS_RENDER_ORDER = 2;

export function applyGlass(mesh) {
  const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
  const isGlass = mats.map(makeGlass).some(Boolean);
  if (isGlass) mesh.renderOrder = GLASS_RENDER_ORDER;
  return isGlass;
}
