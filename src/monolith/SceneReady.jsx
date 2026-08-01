import { useEffect, useRef } from "react";

/**
 * Mounted as the last child inside the scene's Suspense boundary, so it only
 * renders once every glb under that boundary has resolved. That is the honest
 * signal that there is something to look at.
 *
 * The load progress reported by THREE's manager is not: it hits 100 whenever
 * the requests it happens to know about finish, which can be well before the
 * models are in the graph - and the canvas clears to sky, so lifting the
 * curtain early shows an empty blue frame.
 */
export default function SceneReady({ onReady }) {
  const latest = useRef(onReady);
  latest.current = onReady;

  useEffect(() => {
    // Two frames: one for React to commit this subtree, one for the renderer to
    // actually paint it. Lifting on the first still catches an unpainted frame.
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => latest.current?.());
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  return null;
}
