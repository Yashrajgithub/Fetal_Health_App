// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";

export default function Navbar({ onNavigate, onLoginClick, onRegisterClick, user, onLogout }) {
  const [openMenu, setOpenMenu] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    function handleDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  return (
    <nav className="navbar">
      <div className="logo" onClick={() => onNavigate("landing")} style={{ cursor: "pointer" }}>
        <span>🤖❤️</span>
        <span style={{ marginLeft: 8 }}>Fetal Detection AI</span>
      </div>

      <div className="nav-right">
        <ul className="nav-links" id="navLinks">
          <li>
            <a href="#" className="nav-link"
              onClick={(e) => { e.preventDefault(); onNavigate("landing"); }}>
              Home
            </a>
          </li>

          <li>
            <a href="#" className="nav-link"
              onClick={(e) => { e.preventDefault(); onNavigate("about"); }}>
              About
            </a>
          </li>

          <li>
            <a href="#" className="nav-link"
              onClick={(e) => { e.preventDefault(); onNavigate("prediction"); }}>
              Predict
            </a>
          </li>

          <li>
            <a href="#" className="nav-link"
              onClick={(e) => { e.preventDefault(); onNavigate("image"); }}>
              Image
            </a>
          </li>
        </ul>

        {/* Register button (always visible) */}
        {!user && (
          <button
            className="login-btn"
            style={{ marginRight: 12, background: "linear-gradient(135deg,#10b981,#059669)" }}
            onClick={() => onRegisterClick && onRegisterClick()}
          >
            ✍️ Register
          </button>
        )}

        {/* Login / User */}
        {!user ? (
          <button className="login-btn" id="loginBtn" onClick={onLoginClick}>
            🔐 Login
          </button>
        ) : (
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <button
              className="login-btn"
              onClick={() => setOpenMenu((s) => !s)}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              👤 {user}
            </button>

            {openMenu && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  marginTop: 8,
                  background: "white",
                  borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  overflow: "hidden",
                  zIndex: 2000,
                  minWidth: 160,
                }}
              >
                <button
                  onClick={() => {
                    setOpenMenu(false);
                    onLogout && onLogout();
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "10px 14px",
                    border: "none",
                    background: "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}

        <div
          className="mobile-menu"
          id="mobileMenu"
          onClick={() => {
            const navLinks = document.getElementById("navLinks");
            if (navLinks) navLinks.classList.toggle("active");
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
}
