import React from "react";
import { zones } from "../content/sections.js";

export default function HUD({ onTeleport }) {
  return (
    <>
      <div className="hud hud--logo">
        Viven<span className="accent">Systems</span>
      </div>

      <div className="hud hud--hint">WASD / arrows to drive · space to brake</div>

      <div className="hud hud--menu">
        <button onClick={() => onTeleport("home")}>Home</button>
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => onTeleport(z.id)}
            style={{ "--dot": z.color }}
          >
            {z.label}
          </button>
        ))}
      </div>
    </>
  );
}
