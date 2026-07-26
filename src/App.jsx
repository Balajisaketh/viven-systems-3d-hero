import React, { useState } from "react";
import CarrierScene from "./carrier/CarrierScene.jsx";
import CinematicOverlay from "./ui/CinematicOverlay.jsx";

/**
 * Full-bleed cinematic hero: an F/A-18-style jet cold-starts, launches off
 * a stylized carrier flight deck at dawn, and climbs away into an
 * establishing shot where the Viven Systems brand/CTA fades in. `replayKey`
 * remounts the Canvas (resetting its internal clock) so "Replay Launch"
 * restarts the whole sequence from frame zero.
 */
export default function App() {
  const [replayKey, setReplayKey] = useState(0);
  const [sceneState, setSceneState] = useState(null);

  return (
    <div className="app">
      <CarrierScene key={replayKey} onPhaseChange={setSceneState} />
      <CinematicOverlay
        phase={sceneState?.phase}
        finished={sceneState?.finished}
        onReplay={() => setReplayKey((k) => k + 1)}
      />
    </div>
  );
}
