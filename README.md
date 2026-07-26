# Viven Systems — Drivable 3D Portfolio

A Bruno-Simon-style site: drive a toy car around a low-poly island to explore
About / Services / Work / Contact instead of scrolling through them.

Run it:

```
npm install
npm run dev
```

Then open the localhost URL Vite prints in your browser. Click "Start the
engine," then use **WASD** or the **arrow keys** to drive, **space** to
brake. Driving onto a colored zone opens that section's panel; the buttons
in the top-right corner teleport you there instantly. All copy is generic
placeholder text — edit `src/content/sections.js` to swap in real content.

Build for production:

```
npm run build
npm run preview
```

## Project structure

- `src/game/` — the 3D world: `Experience.jsx` (Canvas + physics setup),
  `World.jsx` (ground/ocean/trees), `Zones.jsx` (colored trigger zones),
  `Car.jsx` (the drivable rigid-body car), `CameraRig.jsx` (follow camera).
- `src/ui/` — HTML overlays: `StartScreen.jsx`, `HUD.jsx`, `SectionPanel.jsx`.
- `src/content/sections.js` — all zone positions and section copy in one file.
- `src/components/` and `src/three/` — the **previous** scroll-based landing
  page (Navbar/Hero/About/Services/Portfolio/Contact + MiniScene/FloatingNodes).
  These are no longer imported by `App.jsx` but are left in place in case you
  want to go back to that version or reuse pieces of it.

## Notes

- The car uses a simplified single-rigid-body "arcade" physics setup (via
  `@react-three/rapier`), not a full multi-wheel suspension rig like Bruno
  Simon's original Cannon.js car — this trades a little realism for a much
  more robust, easier-to-maintain build.
- If `npm install` complains about `@react-three/rapier`'s version, run
  `npm install @react-three/rapier@latest` — it moves fast and the exact
  pinned version here may lag behind.
- The Contact form is front-end only right now; wire it to Formspree, EmailJS,
  or your own API route to actually receive messages.
