import React from "react";
import MiniScene from "../three/MiniScene.jsx";

export default function About() {
  return (
    <section id="about" className="section about">
      <div className="section__inner about__grid">
        <div className="about__text">
          <p className="eyebrow">About Us</p>
          <h2>Engineering the synergy between web and intelligence.</h2>
          <p>
            Viven Systems is a small, senior team of engineers and designers
            who build the technical core of ambitious products: fast,
            resilient web applications wired directly into bespoke machine
            learning and AI systems. We don&rsquo;t hand strategy to one team
            and execution to another &mdash; the same people who design the
            architecture ship it to production.
          </p>
          <p>
            We work with founders and product teams who need something that
            looks and performs like it was built by an in-house team of ten
            &mdash; without the overhead of hiring one.
          </p>
          <div className="about__stats">
            <div>
              <strong>40+</strong>
              <span>Products shipped</span>
            </div>
            <div>
              <strong>12</strong>
              <span>AI systems in production</span>
            </div>
            <div>
              <strong>98%</strong>
              <span>Client retention</span>
            </div>
          </div>
        </div>

        <div className="about__visual">
          <MiniScene
            geometry={<icosahedronGeometry args={[1.1, 2]} />}
            color="#00F0FF"
            speed={0.5}
            height={340}
          />
        </div>
      </div>
    </section>
  );
}
