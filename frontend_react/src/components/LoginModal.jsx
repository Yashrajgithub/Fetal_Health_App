// src/components/LoginModal.jsx
import React, { useState } from "react";
import AlertToast from "./AlertToast";

/**
 * LoginModal
 * Props:
 *  - onClose()
 *  - onLoginSuccess(username)
 *  - onOpenRegister()  -> called when user clicks "Register" link inside modal
 */

export default function LoginModal({ onClose, onLoginSuccess, onOpenRegister }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setToast({ message: "Please enter both email and password.", type: "error" });
      return;
    }

    setLoading(true);
    setToast(null);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setToast({ message: data.error || "Login failed. Check credentials.", type: "error" });
        return;
      }

      // Success: store token + username and notify parent
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", data.username);

      setToast({ message: `Welcome back, ${data.username}!`, type: "success" });

      setTimeout(() => {
        setToast(null);
        onLoginSuccess(data.username);
        onClose();
      }, 900);
    } catch (err) {
      console.error("Login error:", err);
      setLoading(false);
      setToast({ message: "Connection error. Make sure the backend is running.", type: "error" });
    }
  };

  return (
    <>
      {toast && <AlertToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div
        className="modal-overlay active"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="modal" role="dialog" aria-modal="true" aria-label="Login">
          <div className="modal-header">
            <h3>🔐 Healthcare Professional Login</h3>
            <button className="close-btn" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit} autoComplete="on">
              <div className="form-group">
                <label>📧 Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@hospital.org"
                  required
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>🔒 Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: "1rem" }}>
                <button type="submit" className="btn btn-primary modal-btn" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </button>

                <button
                  type="button"
                  className="btn"
                  style={{ background: "transparent", color: "var(--primary-blue)", fontWeight: 600 }}
                  onClick={() => {
                    setForm({ email: "demo@hospital.org", password: "demo123" });
                    setToast({ message: "Demo credentials filled. Click Sign In.", type: "info" });
                  }}
                >
                  Fill demo
                </button>
              </div>
            </form>

            <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "var(--text-gray)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href="#" style={{ color: "var(--primary-blue)", textDecoration: "none" }} onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>

              <button
                onClick={() => {
                  onClose(); // close login modal
                  onOpenRegister && onOpenRegister(); // open register modal
                }}
                style={{ background: "transparent", border: "none", color: "var(--primary-blue)", cursor: "pointer", fontWeight: 600 }}
              >
                Create an account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
