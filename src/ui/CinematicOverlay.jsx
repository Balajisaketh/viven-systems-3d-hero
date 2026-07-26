import React from "react";

const PHASE_CAPTIONS = {
  "deck-hold": "Dawn Flight Deck — Pre-Launch",
  spool: "Engines Spooling",
  launch: "Catapult Launch",
  climb: "Climb-Out",
  establish: "",
};

export default function CinematicOverlay({ phase, finished, onReplay }) {
  const showCaption = phase && PHASE_CAPTIONS[phase] && !finished;
  const showHero = finished;

  return (
    <>
      <div className="cine-logo">
        Viven<span className="accent">Systems</span>
      </div>

      <div className={`cine-caption ${showCaption ? "is-visible" : ""}`}>
        {phase ? PHASE_CAPTIONS[phase] : ""}
      </div>

      <div className={`cine-hero ${showHero ? "is-visible" : ""}`}>
        <p className="eyebrow">AI Intelligence &amp; Web Synergy</p>
        <h1>Engineered for launch conditions.</h1>
        <p className="cine-hero__sub">
          Viven Systems builds the technical core of ambitious products —
          web applications and AI systems held to the same standard as a
          carrier launch: precise, tested, and ready the moment it matters.
        </p>
        <div className="cine-hero__actions">
          <button className="btn btn--primary" onClick={onReplay}>
            Replay Launch
          </button>
          <a className="btn btn--ghost" href="mailto:hello@vivensystems.com">
            Start a project
          </a>
        </div>
      </div>
    </>
  );
}
