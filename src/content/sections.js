// Central data for the drivable world: where each colored zone sits,
// and the content shown in the popup panel when the car drives into it.
// Positions sit just off the racetrack (like pit garages/paddock areas),
// see src/content/track.js for the track loop they're placed around.

export const zones = [
  { id: "about", label: "About Us", color: "#ffd166", position: [22, 0, -2], radius: 4.5 },
  { id: "services", label: "Services", color: "#4cc9f0", position: [-22, 0, -2], radius: 5 },
  { id: "work", label: "Our Work", color: "#f77f00", position: [0, 0, -34], radius: 5.5 },
  { id: "contact", label: "Contact", color: "#ff6b6b", position: [-10, 0, 15], radius: 4.5 },
];

export const sectionContent = {
  about: {
    title: "About Viven Systems",
    body: [
      "Viven Systems is a small, senior team of engineers and designers who build the technical core of ambitious products: fast, resilient web applications wired directly into bespoke machine learning and AI systems.",
      "We work with founders and product teams who need something that looks and performs like it was built by an in-house team of ten — without the overhead of hiring one.",
    ],
    stats: [
      { label: "Products shipped", value: "40+" },
      { label: "AI systems in production", value: "12" },
      { label: "Client retention", value: "98%" },
    ],
  },
  services: {
    title: "Services built for teams that ship",
    items: [
      { title: "Web Application Development", desc: "High-performance React/Next.js applications built for scale and speed." },
      { title: "Bespoke AI Solutions", desc: "Custom ML pipelines and LLM integrations tailored to your product and data." },
      { title: "Cloud Architecture & DevOps", desc: "Resilient infrastructure with CI/CD pipelines that ship with confidence." },
      { title: "Product & UI/UX Engineering", desc: "Interface design and front-end engineering fused into one process." },
    ],
  },
  work: {
    title: "A few things we've built recently",
    items: [
      { name: "NeuralCommerce", tag: "AI Recommendation Engine", stack: "React · Node · Python · LLM" },
      { name: "FinEdge Dashboard", tag: "Real-Time Analytics Platform", stack: "Next.js · WebSockets · D3" },
      { name: "MedSync", tag: "Healthcare AI Assistant", stack: "React Native · FastAPI · ML" },
      { name: "Quantum Retail", tag: "Headless Commerce Platform", stack: "Next.js · GraphQL · Stripe" },
    ],
  },
  contact: {
    title: "Have a project in mind?",
    body: "Tell us what you're building and we'll get back to you within one business day.",
    details: [
      { label: "Email", value: "hello@vivensystems.com" },
      { label: "Location", value: "Remote-first, working worldwide" },
      { label: "Response time", value: "Within 24 hours" },
    ],
  },
};
