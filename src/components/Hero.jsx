import React from "react";
import VivenSystemsCore from "../VivenSystemsCore.jsx";

export default function Hero() {
  return (
    <section id="hero" className="hero">
      <div className="hero__canvas">
        <VivenSystemsCore />
      </div>

      <div className="hero__content">
        <p className="eyebrow">AI Intelligence &amp; Web Synergy</p>
        <h1>
          We build <span className="accent-cyan">high-end web applications</span>{" "}
          and <span className="accent-violet">bespoke AI solutions</span>.
        </h1>
        <p className="hero__sub">
          Viven Systems designs and engineers digital products for teams who
          refuse to ship anything ordinary.
        </p>
        <div className="hero__cta">
          <a href="#work" className="btn btn--primary">
            See our work
          </a>
          <a href="#contact" className="btn btn--ghost">
            Start a project
          </a>
        </div>
      </div>

      <div className="hero__scroll-cue">Scroll</div>
    </section>
  );
}
