// src/components/RegisterModal.jsx
import React, { useState } from "react";
import AlertToast from "./AlertToast";

export default function RegisterModal({ onClose, onRegisterSuccess }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setToast({ message: "All fields are required.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setToast({ message: data.error || "Registration failed", type: "error" });
        return;
      }

      setToast({ message: "Registered successfully. Logging you in...", type: "success" });

      // Optionally auto-login: call login endpoint immediately
      try {
        const loginRes = await fetch("http://127.0.0.1:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email.trim(), password: form.password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem("token", loginData.access_token);
          localStorage.setItem("user", loginData.username);
          onRegisterSuccess && onRegisterSuccess(loginData.username);
        } else {
          // still fine — user created; prompt to login
          setToast({ message: "Registered. Please login now.", type: "info" });
        }
      } catch (err) {
        // ignore auto-login failure
      }

      setTimeout(() => {
        setToast(null);
        onClose();
      }, 1000);
    } catch (err) {
      console.error("Register error:", err);
      setLoading(false);
      setToast({ message: "Server error. Check backend.", type: "error" });
    }
  };

  return (
    <>
      {toast && <AlertToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="modal-overlay active" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-header">
            <h3>📝 Register (Doctor)</h3>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>👤 Username</label>
                <input name="username" value={form.username} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>📧 Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>🔒 Password</label>
                <input name="password" type="password" value={form.password} onChange={handleChange} required />
              </div>

              <button type="submit" className="btn btn-primary modal-btn" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
