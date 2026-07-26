import React, { useState } from "react";
import { sectionContent } from "../content/sections.js";

export default function SectionPanel({ sectionId, onClose }) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  if (!sectionId) return null;
  const data = sectionContent[sectionId];
  if (!data) return null;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Front-end only for now — wire this to Formspree / EmailJS / your own
    // API route to actually deliver messages.
    setSent(true);
  }

  return (
    <div className="panel">
      <button className="panel__close" onClick={onClose} aria-label="Close">
        ×
      </button>

      {sectionId === "about" && (
        <>
          <p className="eyebrow">About Us</p>
          <h2>{data.title}</h2>
          {data.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          <div className="panel__stats">
            {data.stats.map((s) => (
              <div key={s.label}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {sectionId === "services" && (
        <>
          <p className="eyebrow">What We Do</p>
          <h2>{data.title}</h2>
          <div className="panel__list">
            {data.items.map((s) => (
              <div className="panel__list-item" key={s.title}>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {sectionId === "work" && (
        <>
          <p className="eyebrow">Selected Work</p>
          <h2>{data.title}</h2>
          <div className="panel__list">
            {data.items.map((p) => (
              <div className="panel__list-item" key={p.name}>
                <h3>{p.name}</h3>
                <p className="panel__tag">{p.tag}</p>
                <p className="panel__stack">{p.stack}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {sectionId === "contact" && (
        <>
          <p className="eyebrow">Get In Touch</p>
          <h2>{data.title}</h2>
          <p>{data.body}</p>
          <ul className="panel__details">
            {data.details.map((d) => (
              <li key={d.label}>
                <span>{d.label}</span>
                {d.value}
              </li>
            ))}
          </ul>

          {sent ? (
            <div className="panel__success">
              Thanks — your message has been noted. We&rsquo;ll be in touch
              shortly.
            </div>
          ) : (
            <form className="panel__form" onSubmit={handleSubmit}>
              <label>
                Name
                <input name="name" value={form.name} onChange={handleChange} required />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Message
                <textarea
                  name="message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </label>
              <button type="submit" className="btn btn--primary">
                Send message
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}
