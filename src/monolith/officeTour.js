// The executive floor (Blender z 23..26.4) is split by partitions at x -7.7 and
// +7.7 into three rooms, centred on x -15.4, 0 and +15.4. The camera views the
// floor from +Y, which puts screen-left at +X: the tour opens on the left-hand
// room (x +15.4) and works across to the right, in the order below.

export const OFFICES = [
  {
    id: "founder-venkat",
    x: 15.4,
    name: "VenkatNarayana Siripuram",
    title: "Founder",
    line:
      "Our success is measured not by the software we deliver, but by the success our clients achieve because of it.",
    walker: "Founder1",
    // Longer travel into this first office: the services card plays over the
    // move up to the floor, and four lines need time to read.
    move: 4.6,
    hold: 8.5,
  },
  {
    id: "founder-gopi",
    x: 0.0,
    name: "Gopi Krishna",
    title: "Founder",
    line:
      "As we grow, we remain grounded in the values that brought us here: integrity, accountability, innovation, and an unwavering focus on our customers.",
    walker: "Exec2",
    // The longest line of the three, and he was left standing for barely a
    // second after his walk - this gives him the beat to deliver it.
    hold: 10.5,
  },
  {
    id: "ceo-saketh",
    x: -15.4,
    name: "Saketh",
    title: "Chief Executive Officer",
    line: "Tell us what you are building. We will engineer it with you.",
    walker: "Exec3",
    // The tour is long, so the ask lands here rather than only at the very end.
    cta: { label: "Start a project", href: "mailto:saketh.siripuram@vivensystems.com" },
    // The CTA is the one thing on screen that can be clicked, so this stop
    // holds longer than the others to give it dwell time.
    hold: 9.5,
  },
];

export const OFFICE_TRAVEL = 2.4;
export const OFFICE_HOLD = 6.5; // fallback when a stop sets no hold of its own

/**
 * Stop pose, in the Blender convention heroView uses. The camera sits outside
 * the floor's front glazing (y 19) rather than inside the rooms - the
 * partitions run the full depth, so an interior path would have to punch
 * through a wall between every office. From 21.5 units out on a 27 degree lens
 * each room frames its desk, its people and its back wall.
 */
export const officePose = (office) => ({
  az: 82,
  el: 4.2,
  dist: 21.5,
  fov: 27,
  aim: [office.x, 8.5, 24.6],
});

// Where the walking founder starts and finishes, in Blender y. He begins behind
// the desk (y 6.1) and comes forward toward the glazing the camera is outside
// of, stopping short of it so he stays framed.
export const WALK_FROM = 6.1;
export const WALK_TO = 14.2;

// Shown from the moment the camera lifts off the reception floor - the
// services were getting lost as a one-line caption under a founder's name, so
// they get the first climb to themselves.
export const SERVICES = {
  eyebrow: "What we build",
  // Title case: these are the names of the things we sell, and sentence case
  // made them read as a shopping list rather than a capability set.
  items: [
    "AI Solutions",
    "Web Application Development",
    "Mobile App Development",
    "Custom Software Development",
  ],
};

// Played on the next lift up, above the services. The link is live so the work
// can be checked rather than just claimed.
export const SUCCESS = {
  eyebrow: "Success stories",
  line: "Built, shipped, and running in production.",
  link: { label: "learningwindows.com", href: "https://learningwindows.com" },
};
