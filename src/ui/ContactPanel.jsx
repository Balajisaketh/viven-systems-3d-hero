import React, { useEffect, useRef, useState } from "react";

export const CONTACT_EMAIL = "saketh@vivensystems.com";

/**
 * The contact moment. Rather than dropping a form over the scene, this holds
 * the address itself as the object on the page: an oversized, selectable line
 * that can be clicked to mail or copied in one tap. The building stays visible
 * and drifting behind the blur, so the film never feels interrupted.
 *
 * Escape closes it, focus moves to the panel on open and back to the trigger on
 * close, and the backdrop is click-to-dismiss.
 */
export default function ContactPanel({ open, onClose }) {
  const [copied, setCopied] = useState(false);
  const panelRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard can be blocked by permissions; the address is still visible
      // and the mail link still works, so there is nothing to recover from.
      setCopied(false);
    }
  };

  return (
    <div
      className={`contact-veil ${open ? "is-open" : ""}`}
      onClick={onClose}
      aria-hidden={!open}
    >
      <div
        className="contact-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Contact Viven Systems"
        tabIndex={-1}
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="contact-close" onClick={onClose} aria-label="Close">
          <span />
          <span />
        </button>

        <span className="contact-rule" />
        <p className="contact-eyebrow">Start a conversation</p>
        <h2 className="contact-heading">
          Tell us what you are building.
        </h2>

        <a className="contact-email" >
          {CONTACT_EMAIL}
        </a>

      

        <p className="contact-foot">
          Viven Systems — AI solutions, web and mobile applications, and custom
          software.
        </p>
      </div>
    </div>
  );
}
