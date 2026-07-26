import React from "react";

export default function StartScreen({ onStart }) {
  return (
    <div className="start-screen">
      <div className="start-screen__card">
        <p className="eyebrow">Viven Systems</p>
        <h1>Take a lap around the circuit.</h1>
        <p>
          Race along the track — a few AI cars are lapping it too — and steer
          onto a colored zone to open that part of the site. Use{" "}
          <strong>WASD</strong> or the <strong>arrow keys</strong> to drive,{" "}
          <strong>space</strong> to brake.
        </p>
        <button className="btn btn--primary" onClick={onStart}>
          Start the engine
        </button>
      </div>
    </div>
  );
}
