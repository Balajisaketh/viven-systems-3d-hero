import React, { useState } from "react";
import ContactPanel, { CONTACT_EMAIL } from "./ContactPanel.jsx";
import { SERVICES, SUCCESS } from "../monolith/officeTour.js";
import {
  SERVICES_AT,
  SUCCESS_AT,
  HOME_AT,
  ABOUT_AT,
} from "../monolith/heroView.js";
import { seekTo } from "../monolith/clockControl.js";

/**
 * `office` is set while the camera holds on an executive office and carries
 * that person's name, designation and line. `services` is set while the camera
 * climbs to that floor, and gives the services their own moment rather than
 * burying them in a founder's caption.
 *
 * Contact is reachable three ways: the pill from the first frame, the CEO's
 * card partway through, and the closing line - the film runs a minute, and
 * nobody should have to wait it out to find the address.
 */
export default function MonolithOverlay({
  phase,
  finished,
  office,
  services,
  success,
  onReplay,
}) {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      {/* Chapter jumps, left: the film runs over a minute, and someone who came
          to find out what we do should not have to wait for the camera. Each
          lands at the *start* of a move, so you see the camera travel to the
          section rather than cutting to it. */}
      <nav className="mono-nav">
        <button className="mono-jump" onClick={() => seekTo(HOME_AT)}>
          Home
        </button>
        <button className="mono-jump" onClick={() => seekTo(ABOUT_AT)}>
          About us
        </button>
        <button className="mono-jump" onClick={() => seekTo(SERVICES_AT)}>
          What we build
        </button>
        <button className="mono-jump" onClick={() => seekTo(SUCCESS_AT)}>
          Success stories
        </button>
      </nav>

      <div className="mono-utility">
        <button className="mono-contact" onClick={() => setContactOpen(true)}>
          Contact
        </button>
        <button className="mono-replay" onClick={onReplay} aria-label="Replay">
          Replay
        </button>
      </div>

      <div className={`services-card ${services ? "is-visible" : ""}`}>
        <span className="services-card__rule" />
        <p className="services-card__eyebrow">{SERVICES.eyebrow}</p>
        <ul className="services-card__list">
          {SERVICES.items.map((item, i) => (
            <li key={item} style={{ animationDelay: `${0.04 + i * 0.07}s` }}>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className={`success-card ${success ? "is-visible" : ""}`}>
        <span className="services-card__rule" />
        <p className="services-card__eyebrow">{SUCCESS.eyebrow}</p>
        <p className="success-card__line">{SUCCESS.line}</p>
        <a
          className="success-card__link"
          href={SUCCESS.link.href}
          target="_blank"
          rel="noreferrer noopener"
        >
          {SUCCESS.link.label}
        </a>
      </div>

      <div
        key={office?.id ?? "none"}
        className={`office-card ${office ? "is-visible" : ""} ${
          office?.cta ? "office-card--cta" : ""
        }`}
        aria-live="polite"
      >
        <span className="office-card__rule" />
        <p className="office-card__title">{office?.title ?? ""}</p>
        <p className="office-card__name">{office?.name ?? ""}</p>
        <p className="office-card__line">{office?.line ?? ""}</p>
        {office?.cta ? (
          <button
            className="btn btn--mono-primary office-card__cta"
            onClick={() => setContactOpen(true)}
          >
            {office.cta.label}
          </button>
        ) : null}
      </div>

      <div className={`mono-sign ${finished ? "is-visible" : ""}`}>
        <span className="mono-sign__rule" />
        <p className="mono-sign__line">
          <span className="c">Driven by Passion.</span>
          <em style={{color:'#0F172A'}}>Serving with Accountability.</em>
        </p>
      </div>

      <ContactPanel open={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  );
}

export { CONTACT_EMAIL };
