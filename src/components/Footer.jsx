import React from "react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__logo">
          Viven<span className="accent-cyan">Systems</span>
        </div>
        <p>High-end web applications &amp; bespoke AI solutions.</p>
        <div className="footer__links">
          <a href="#hero">Home</a>
          <a href="#about">About</a>
          <a href="#services">Services</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact</a>
        </div>
        <p className="footer__copy">
          © {new Date().getFullYear()} Viven Systems. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
