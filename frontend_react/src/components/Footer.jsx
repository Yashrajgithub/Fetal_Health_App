import React from "react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer-modern">
      <div className="footer-content">
        <h3 className="footer-title">Fetal Distress Detection</h3>
        <p className="footer-subtitle">
          AI-powered analysis for safe and informed maternal healthcare.
        </p>

        <div className="footer-socials">
          <a
            href="https://github.com/Yashrajgithub"
            target="_blank"
            rel="noreferrer"
            className="footer-icon"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/yashrajkalshetti"
            target="_blank"
            rel="noreferrer"
            className="footer-icon"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://x.com/yashrajk04"
            target="_blank"
            rel="noreferrer"
            className="footer-icon"
          >
            <FaTwitter />
          </a>
        </div>

        <p className="footer-credit">
          © {year} — Developed by{" "}
          <span className="footer-highlight">Shreeya Holikatti & Team</span>
        </p>
      </div>
    </footer>
  );
}
