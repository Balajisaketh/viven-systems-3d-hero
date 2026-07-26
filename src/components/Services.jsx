import React from "react";
import MiniScene from "../three/MiniScene.jsx";

const services = [
  {
    title: "Web Application Development",
    desc: "High-performance React/Next.js applications built for scale, speed, and long-term maintainability.",
    color: "#00F0FF",
    geometry: <icosahedronGeometry args={[1, 1]} />,
  },
  {
    title: "Bespoke AI Solutions",
    desc: "Custom ML pipelines, LLM integrations, and intelligent automation tailored to your product and data.",
    color: "#9D00FF",
    geometry: <octahedronGeometry args={[1.1, 0]} />,
  },
  {
    title: "Cloud Architecture & DevOps",
    desc: "Resilient, cost-aware infrastructure with CI/CD pipelines that ship with confidence, not fear.",
    color: "#00F0FF",
    geometry: <torusGeometry args={[0.8, 0.3, 8, 24]} />,
  },
  {
    title: "Product & UI/UX Engineering",
    desc: "Interface design and front-end engineering fused into one process, so nothing gets lost in handoff.",
    color: "#9D00FF",
    geometry: <dodecahedronGeometry args={[1, 0]} />,
  },
];

export default function Services() {
  return (
    <section id="services" className="section services">
      <div className="section__inner">
        <p className="eyebrow">What We Do</p>
        <h2>Services built for teams that ship.</h2>

        <div className="services__grid">
          {services.map((s) => (
            <div className="service-card" key={s.title}>
              <MiniScene geometry={s.geometry} color={s.color} height={140} />
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
