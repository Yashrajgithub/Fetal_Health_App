// src/components/AlertToast.jsx
import React, { useEffect } from "react";

export default function AlertToast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  let bg = "var(--primary-blue)";
  if (type === "success") bg = "var(--success)";
  if (type === "error") bg = "var(--danger)";
  if (type === "info") bg = "var(--primary-blue)";

  return (
    <div style={{
      position: "fixed",
      top: 20,
      right: 20,
      background: bg,
      color: "white",
      padding: "12px 18px",
      borderRadius: 10,
      zIndex: 9999,
      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
      maxWidth: 320
    }}>
      {message}
    </div>
  );
}
