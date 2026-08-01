import React, { useCallback, useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import MonolithScene from "./monolith/MonolithScene.jsx";
import MonolithOverlay from "./ui/MonolithOverlay.jsx";
import { seekTo } from "./monolith/clockControl.js";

/**
 * Full-bleed cinematic hero: arrival at the campus, in through the doors, up
 * through the floors, and a stop at each executive office.
 *
 * Replay is a seek to zero, not a remount. It used to swap a key on the Canvas,
 * which threw away the WebGL context and every scene graph with it, and the
 * scene graph is not disposable state: BlenderModel renders drei's *shared*
 * cached gltf, and Entrance mutates the door nodes on it while recording their
 * base positions at mount. Remounting after a jump raced the old instance's
 * teardown against the new one's capture, so the doors could take their open
 * position as home. Everything animated here - camera, doors, the walking
 * figures, the overlay cards - derives from clock.elapsedTime, so putting the
 * clock back to zero restarts the film exactly, and costs nothing.
 *
 * The scene is held behind a dark curtain until the models are in. The canvas
 * clears to sky, so an unfaded load showed a flat blue screen on every refresh
 * while several megabytes of glb arrived - the film should open from black, not
 * from an empty sky.
 */
export default function App() {
  const [sceneState, setSceneState] = useState(null);
  const { active, progress } = useProgress();

  // The curtain lifts on SceneReady - which renders inside the scene's Suspense
  // boundary, so it only exists once the models do. `progress` drives the bar
  // but must not gate the curtain: it reaches 100 whenever the requests the
  // manager knows about finish, which is often before the models are in the
  // graph, and the canvas clears to sky - so trusting it showed a blue frame.
  const [sceneReady, setSceneReady] = useState(false);
  const handleReady = useCallback(() => setSceneReady(true), []);

  // Last resort only: if a model 404s or the boundary never resolves, the film
  // is broken anyway and a black screen forever is the worse failure.
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 20000);
    return () => clearTimeout(t);
  }, []);

  const ready = sceneReady || timedOut;

  return (
    <div className="app">
      <div className={`scene ${ready ? "is-ready" : ""}`}>
        <MonolithScene onPhaseChange={setSceneState} onReady={handleReady} />
      </div>

      <div className={`boot ${ready ? "is-done" : ""}`} aria-hidden={ready}>
        <p className="boot__mark">Viven Systems</p>
        <span className="boot__track">
          <span className="boot__fill" style={{ width: `${progress}%` }} />
        </span>
      </div>

      <MonolithOverlay
        phase={sceneState?.phase}
        finished={sceneState?.finished}
        office={sceneState?.office}
        services={sceneState?.services}
        success={sceneState?.success}
        onReplay={() => seekTo(0)}
      />
    </div>
  );
}
