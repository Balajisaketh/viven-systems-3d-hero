import React from "react";
import MiniScene from "../three/MiniScene.jsx";

const projects = [
  {
    name: "NeuralCommerce",
    tag: "AI Recommendation Engine",
    stack: "React · Node · Python · LLM",
    color: "#9D00FF",
    geometry: <torusKnotGeometry args={[0.7, 0.24, 100, 16]} />,
  },
  {
    name: "FinEdge Dashboard",
    tag: "Real-Time Analytics Platform",
    stack: "Next.js · WebSockets · D3",
    color: "#00F0FF",
    geometry: <icosahedronGeometry args={[1, 1]} />,
  },
  {
    name: "MedSync",
    tag: "Healthcare AI Assistant",
    stack: "React Native · FastAPI · ML",
    color: "#9D00FF",
    geometry: <dodecahedronGeometry args={[1, 0]} />,
  },
  {
    name: "Quantum Retail",
    tag: "Headless Commerce Platform",
    stack: "Next.js · GraphQL · Stripe",
    color: "#00F0FF",
    geometry: <octahedronGeometry args={[1.1, 0]} />,
  },
];

export default function Portfolio() {
  return (
    <section id="work" className="section work">
      <div className="section__inner">
        <p className="eyebrow">Selected Work</p>
        <h2>A few things we&rsquo;ve built recently.</h2>

        <div className="work__grid">
          {projects.map((p) => (
            <div className="project-card" key={p.name}>
              <div className="project-card__visual">
                <MiniScene geometry={p.geometry} color={p.color} height={200} speed={0.4} />
              </div>
              <div className="project-card__body">
                <h3>{p.name}</h3>
                <p className="project-card__tag">{p.tag}</p>
                <p className="project-card__stack">{p.stack}</p>
                <a href="#contact" className="project-card__link">
                  View case study &rarr;
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
