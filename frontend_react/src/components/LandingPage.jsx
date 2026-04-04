// src/components/LandingPage.jsx
import React, { useState, useEffect } from "react";
import AlertToast from "./AlertToast"; // optional — if you don't have it, remove toasts usage

/**
 * LandingPage
 * - Collects patient info.
 * - Saves to sessionStorage so PredictionPage can restore it.
 * - If a JWT token exists in localStorage, it attempts to POST to /api/patients/save (non-blocking).
 * - Calls onNext(patient) to notify parent to navigate to prediction.
 *
 * Props:
 *  - onNext(patient)  // called when user proceeds
 */

export default function LandingPage({ onNext }) {
  const [patient, setPatient] = useState({
    name: "",
    age: "",
    gender: "Female",
    hospital: "",
    doctor: "",
    date: "",
  });

  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  // restore patient if stored in sessionStorage
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("patientData");
      if (stored) setPatient(JSON.parse(stored));
    } catch (err) {
      console.warn("Failed to restore patientData:", err);
    }
  }, []);

  // keep sessionStorage in sync
  useEffect(() => {
    sessionStorage.setItem("patientData", JSON.stringify(patient));
  }, [patient]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // ensure age is numeric for UX
    setPatient((p) => ({ ...p, [name]: type === "number" ? value : value }));
  };

  // basic client-side validation
  const validate = () => {
    if (!patient.name.trim()) return "Please enter patient name.";
    if (!patient.age || Number(patient.age) <= 0) return "Please enter a valid age.";
    if (!patient.hospital.trim()) return "Please enter hospital / clinic name.";
    if (!patient.doctor.trim()) return "Please enter doctor's name.";
    if (!patient.date) return "Please select CTG report date.";
    return null;
  };

  // Try to save patient to backend /api/patients/save (non-blocking).
  // If route not present, this will fail silently and user still proceeds.
  const trySaveToServer = async (patientPayload) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return null;

    try {
      setSaving(true);
      const res = await fetch("http://127.0.0.1:5000/api/patients/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ patient: patientPayload }),
      });

      const json = await res.json();
      setSaving(false);

      if (!res.ok) {
        // server returned error; show small toast but continue
        setToast({ message: json.error || "Could not save patient on server.", type: "error" });
        // clear toast after 3s
        setTimeout(() => setToast(null), 3000);
        return null;
      }

      setToast({ message: "Patient saved to server.", type: "success" });
      setTimeout(() => setToast(null), 1500);
      return json;
    } catch (err) {
      setSaving(false);
      // network / route not present — ignore, but inform user softly
      setToast({ message: "Server save skipped (no connection).", type: "info" });
      setTimeout(() => setToast(null), 1500);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      setToast({ message: err, type: "error" });
      setTimeout(() => setToast(null), 2500);
      return;
    }

    // store in sessionStorage (already synced via effect) — ensure consistent types
    const payload = {
      ...patient,
      age: Number(patient.age),
    };
    sessionStorage.setItem("patientData", JSON.stringify(payload));

    // Try saving to server if token exists (non-blocking)
    try {
      await trySaveToServer(payload);
    } catch (ignored) {
      // ignore any error, proceed
    }

    // notify parent to navigate to prediction page
    onNext(payload);
  };

  return (
    <>
      {toast && (
        <AlertToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ===== HERO SECTION ===== */}
      <section className="landing-hero container" id="landingPage">
        <div className="hero-content">
          <div className="hero-icon">🤖❤️</div>
          <h1>
            <span className="hero-highlight">AI-Powered</span> Fetal Distress Detection
            <br />
            using CTG Reports
          </h1>
          <p>
            Empowering healthcare professionals with advanced machine learning to
            ensure maternal and fetal safety through accurate, real-time
            cardiotocography analysis.
          </p>
          <a
            href="#patientSection"
            className="btn btn-primary scroll-to-section"
            onClick={(ev) => {
              // smooth scroll to patient section when clicked in SPA
              ev.preventDefault();
              document.getElementById("patientSection")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Get Started →
          </a>
        </div>
      </section>

      {/* ===== PATIENT INFORMATION SECTION ===== */}
      <section id="patientSection" className="patient-section container visible">
        <h2 className="section-title">Patient Information</h2>
        <p className="section-subtitle">
          Please provide the following details before proceeding to CTG analysis
        </p>

        <form id="patientForm" className="patient-card" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">👤 Patient Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={patient.name}
                onChange={handleChange}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="age">🎂 Age *</label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                value={patient.age}
                onChange={handleChange}
                placeholder="Enter age"
                required
              />
            </div>

            <div className="form-group">
              <label>⚧ Gender *</label>
              <div className="radio-group" role="radiogroup" aria-label="Gender">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={patient.gender === "Female"}
                    onChange={handleChange}
                  />
                  Female
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={patient.gender === "Male"}
                    onChange={handleChange}
                  />
                  Male
                </label>
                <label className="radio-option">
                  <input
                    type="radio"
                    name="gender"
                    value="Other"
                    checked={patient.gender === "Other"}
                    onChange={handleChange}
                  />
                  Other
                </label>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="hospital">🏥 Hospital Name *</label>
              <input
                id="hospital"
                name="hospital"
                type="text"
                value={patient.hospital}
                onChange={handleChange}
                placeholder="Enter hospital name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="doctor">👨‍⚕️ Doctor Name *</label>
              <input
                id="doctor"
                name="doctor"
                type="text"
                value={patient.doctor}
                onChange={handleChange}
                placeholder="Enter doctor's name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="date">📅 CTG Report Date *</label>
              <input
                id="date"
                name="date"
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={patient.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Proceed to CTG Prediction →"}
            </button>
          </div>
        </form>

        {/* ===== CTG REPORT SUMMARY SECTION ===== */}
        <div className="summary-section">
          <div className="summary-card">
            <div className="summary-header">
              <h3>📋 CTG Report Summary</h3>
              <div
                className="info-icon"
                data-tooltip="This section explains the prediction categories and what they mean for fetal health assessment"
                aria-hidden
              >
                ℹ️
              </div>
            </div>

            <div className="summary-description">
              <p>
                "Based on the following CTG parameters, our AI model (XGBoost
                Classifier) will predict the fetal condition into one of three
                categories:"
              </p>
            </div>

            <div className="category-cards">
              {/* Normal */}
              <div
                className="category-card normal-card"
                data-tooltip="Normal: Stable fetal heart rate patterns, regular movements, no signs of distress."
              >
                <div className="category-icon">🟢</div>
                <div className="category-content">
                  <h4>Normal</h4>
                  <p>Healthy fetal status</p>
                </div>
                <div className="category-hover">
                  <p>Stable heart rate, regular movement</p>
                </div>
              </div>

              {/* Suspect */}
              <div
                className="category-card suspect-card"
                data-tooltip="Suspect: Irregular patterns detected that require close monitoring."
              >
                <div className="category-icon">🟠</div>
                <div className="category-content">
                  <h4>Suspect</h4>
                  <p>Requires close monitoring</p>
                </div>
                <div className="category-hover">
                  <p>Irregular patterns, needs attention</p>
                </div>
              </div>

              {/* Pathologic */}
              <div
                className="category-card pathologic-card"
                data-tooltip="Pathologic: Critical patterns indicating fetal distress. Requires immediate medical intervention."
              >
                <div className="category-icon">🔴</div>
                <div className="category-content">
                  <h4>Pathologic</h4>
                  <p>Immediate attention needed</p>
                </div>
                <div className="category-hover">
                  <p>Critical condition, urgent care</p>
                </div>
              </div>
            </div>

            <div className="summary-footer">
              <p>
                <strong>Note:</strong> The AI analyzes 21 CTG parameters including
                baseline FHR, variability measures, accelerations, decelerations, and
                histogram features to provide this classification.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
