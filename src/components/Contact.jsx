import React, { useState } from "react";
import FloatingNodes from "../three/FloatingNodes.jsx";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Front-end only for now — wire this up to Formspree / EmailJS / your
    // own API route to actually deliver messages.
    setSent(true);
  }

  return (
    <section id="contact" className="section contact">
      <div className="contact__visual">
        <FloatingNodes />
      </div>

      <div className="section__inner contact__grid">
        <div className="contact__info">
          <p className="eyebrow">Get In Touch</p>
          <h2>Have a project in mind?</h2>
          <p>
            Tell us what you&rsquo;re building and we&rsquo;ll get back to you
            within one business day.
          </p>
          <ul className="contact__details">
            <li>
              <span>Email</span>hello@vivensystems.com
            </li>
            <li>
              <span>Location</span>Remote-first, working worldwide
            </li>
            <li>
              <span>Response time</span>Within 24 hours
            </li>
          </ul>
        </div>

        <form className="contact__form" onSubmit={handleSubmit}>
          {sent ? (
            <div className="contact__success">
              Thanks &mdash; your message has been noted. We&rsquo;ll be in
              touch shortly.
            </div>
          ) : (
            <>
              <label>
                Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
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
                  rows={5}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </label>
              <button type="submit" className="btn btn--primary">
                Send message
              </button>
            </>
          )}
        </form>
      </div>
    </section>
  );
}
