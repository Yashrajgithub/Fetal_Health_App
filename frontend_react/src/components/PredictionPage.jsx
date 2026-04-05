import React, { useState, useEffect } from "react";
const API = process.env.REACT_APP_API_URL;

/**
 * PredictionPage.jsx
 * - Preserves your original UI and classes.
 * - If localStorage.token exists -> uses protected POST /api/patients (saves record + runs prediction).
 * - If no token -> falls back to POST /predict (original behavior).
 * - If logged in, fetches GET /api/patients to show recent patients below the form.
 */

export default function PredictionPage({ patientData, onBack }) {
  const [formData, setFormData] = useState({
    baseline_value: "",
    abnormal_short_term_variability: "",
    mean_value_of_short_term_variability: "",
    percentage_of_time_with_abnormal_long_term_variability: "",
    mean_value_of_long_term_variability: "",
    accelerations: "",
    fetal_movement: "",
    uterine_contractions: "",
    light_decelerations: "",
    severe_decelerations: "",
    prolongued_decelerations: "",
    histogram_width: "",
    histogram_min: "",
    histogram_max: "",
    histogram_number_of_peaks: "",
    histogram_number_of_zeroes: "",
    histogram_mode: "",
    histogram_mean: "",
    histogram_median: "",
    histogram_variance: "",
    histogram_tendency: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [patients, setPatients] = useState([]); // recent patients if logged in
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    if (token) fetchPatients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function fetchPatients() {
    try {
      const res = await fetch(`${API}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.patients) setPatients(json.patients);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    // Basic: ensure each required field has a numeric value
    for (const k of Object.keys(formData)) {
      const v = formData[k];
      if (v === "" || v === null || isNaN(Number(v))) return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    if (!validateForm()) {
      setResult({ error: "Please fill all 21 CTG fields with numeric values." });
      return;
    }

    setLoading(true);

    // If token exists -> call protected endpoint to save patient + predict
    if (token) {
      try {
        // require patientData
        if (!patientData || !patientData.name) {
          setLoading(false);
          setResult({ error: "Missing patient info. Fill patient data on the Home page first." });
          return;
        }

        const payload = {
          patient: {
            name: patientData.name,
            age: patientData.age,
            gender: patientData.gender,
            hospital: patientData.hospital,
            doctor: patientData.doctor,
            date: patientData.date,
          },
          features: Object.fromEntries(
            Object.entries(formData).map(([k, v]) => [k, Number(v)])
          ),
        };

        const res = await fetch(`${API}/api/patients`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        setLoading(false);

        if (!res.ok) {
          setResult({ error: data.error || "Server error while predicting." });
          return;
        }

        // success
        setResult({ status_label: data.prediction_label, from: "saved" });
        await fetchPatients();
      } catch (err) {
        console.error(err);
        setLoading(false);
        setResult({ error: "Connection failed. Make sure the backend is running." });
      }

      return;
    }

    // No token: fallback to old /predict route (no saving)
    try {
      const payload = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [k, Number(v)])
      );

      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setResult({ error: data.error || "Prediction failed" });
        return;
      }

      setResult({ ...data, from: "temp" });
    } catch (err) {
      console.error(err);
      setLoading(false);
      setResult({ error: "Connection failed. Make sure Flask is running." });
    }
  };

  const resetForm = () => {
    setFormData(Object.fromEntries(Object.keys(formData).map((k) => [k, ""])));
    setResult(null);
  };

  return (
    <section className="predict-section container">
      {patientData && (
        <div className="patient-info-banner">
          <h3>📋 Patient Details</h3>
          <div className="patient-info-grid">
            <PatientInfo label="Patient Name" value={patientData.name} />
            <PatientInfo label="Age" value={patientData.age} />
            <PatientInfo label="Gender" value={patientData.gender} />
            <PatientInfo label="Hospital" value={patientData.hospital} />
            <PatientInfo label="Doctor" value={patientData.doctor} />
            <PatientInfo label="Report Date" value={patientData.date} />
          </div>
        </div>
      )}

      <h2 className="section-title">CTG Analysis & Prediction</h2>
      <p className="section-subtitle">
        Enter the CTG parameters below to analyze fetal health status
      </p>

      <form onSubmit={handleSubmit} className="form-card">
        <Section title="📊 Baseline FHR and Variability">
          <Input
            label="Baseline FHR (BPM)"
            name="baseline_value"
            help="Normal range: 110–160 BPM"
            value={formData.baseline_value}
            onChange={handleChange}
          />
          <Input
            label="Abnormal Short-Term Variability (%)"
            name="abnormal_short_term_variability"
            help="Percentage of time with abnormal short-term variability"
            value={formData.abnormal_short_term_variability}
            onChange={handleChange}
          />
          <Input
            label="Mean Short-Term Variability"
            name="mean_value_of_short_term_variability"
            help="Average short-term variability value"
            value={formData.mean_value_of_short_term_variability}
            onChange={handleChange}
          />
          <Input
            label="Abnormal Long-Term Variability (%)"
            name="percentage_of_time_with_abnormal_long_term_variability"
            help="Percentage of time with abnormal long-term variability"
            value={formData.percentage_of_time_with_abnormal_long_term_variability}
            onChange={handleChange}
          />
          <Input
            label="Mean Long-Term Variability"
            name="mean_value_of_long_term_variability"
            help="Average long-term variability value"
            value={formData.mean_value_of_long_term_variability}
            onChange={handleChange}
          />
        </Section>

        <Section title="🔄 Periodic & Episodic Changes">
          <Input
            label="Number of Accelerations"
            name="accelerations"
            help="Normal: ≥2 accelerations in 20 minutes"
            value={formData.accelerations}
            onChange={handleChange}
          />
          <Input
            label="Number of Fetal Movements"
            name="fetal_movement"
            help="Count of fetal movements detected"
            value={formData.fetal_movement}
            onChange={handleChange}
          />
          <Input
            label="Number of Uterine Contractions"
            name="uterine_contractions"
            help="Count of uterine contractions"
            value={formData.uterine_contractions}
            onChange={handleChange}
          />
          <Input
            label="Number of Light Decelerations"
            name="light_decelerations"
            help="Mild decelerations in FHR"
            value={formData.light_decelerations}
            onChange={handleChange}
          />
          <Input
            label="Number of Severe Decelerations"
            name="severe_decelerations"
            help="Significant decelerations in FHR"
            value={formData.severe_decelerations}
            onChange={handleChange}
          />
          <Input
            label="Number of Prolonged Decelerations"
            name="prolongued_decelerations"
            help="Extended duration decelerations"
            value={formData.prolongued_decelerations}
            onChange={handleChange}
          />
        </Section>

        <Section title="📈 Histogram Analysis">
          <Input
            label="Histogram Width"
            name="histogram_width"
            help="Width of the FHR histogram"
            value={formData.histogram_width}
            onChange={handleChange}
          />
          <Input
            label="Histogram Minimum (BPM)"
            name="histogram_min"
            help="Minimum FHR value in histogram"
            value={formData.histogram_min}
            onChange={handleChange}
          />
          <Input
            label="Histogram Maximum (BPM)"
            name="histogram_max"
            help="Maximum FHR value in histogram"
            value={formData.histogram_max}
            onChange={handleChange}
          />
          <Input
            label="Number of Peaks"
            name="histogram_number_of_peaks"
            help="Number of peaks in histogram"
            value={formData.histogram_number_of_peaks}
            onChange={handleChange}
          />
          <Input
            label="Number of Zeroes"
            name="histogram_number_of_zeroes"
            help="Zero crossings in histogram"
            value={formData.histogram_number_of_zeroes}
            onChange={handleChange}
          />
          <Input
            label="Histogram Mode (BPM)"
            name="histogram_mode"
            help="Most frequent FHR value"
            value={formData.histogram_mode}
            onChange={handleChange}
          />
          <Input
            label="Histogram Mean (BPM)"
            name="histogram_mean"
            help="Average FHR value"
            value={formData.histogram_mean}
            onChange={handleChange}
          />
          <Input
            label="Histogram Median (BPM)"
            name="histogram_median"
            help="Median FHR value"
            value={formData.histogram_median}
            onChange={handleChange}
          />
          <Input
            label="Histogram Variance"
            name="histogram_variance"
            help="Variance of FHR distribution"
            value={formData.histogram_variance}
            onChange={handleChange}
          />
          <Input
            label="Histogram Tendency (-1, 0, 1)"
            name="histogram_tendency"
            help="Trend direction: -1=decreasing, 0=stable, 1=increasing"
            value={formData.histogram_tendency}
            onChange={handleChange}
          />
        </Section>

        <div className="button-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "🤖 Analyzing..." : "🔍 Analyze CTG"}
          </button>
          <button type="button" onClick={resetForm} className="btn btn-secondary">
            🔄 Reset Form
          </button>
          <button type="button" onClick={onBack} className="btn btn-secondary">
            ← Back
          </button>
        </div>
      </form>

      {loading && (
        <div className="form-card loading active" id="loading">
          <div className="spinner"></div>
          <p>🤖 Analyzing fetal health...</p>
          <p className="loading-subtitle">Processing 21 CTG parameters with AI model</p>
        </div>
      )}

      {result && !loading && (
        <div className="result-card active" id="resultCard">
          <div className="result-icon" id="resultIcon">
            {result.error
              ? "⚠️"
              : result.status_label === "Normal"
              ? "🟢"
              : result.status_label === "Suspect"
              ? "🟠"
              : "🔴"}
          </div>

          <div
            className={`result-text ${
              result.error
                ? "result-suspect"
                : result.status_label === "Normal"
                ? "result-normal"
                : result.status_label === "Suspect"
                ? "result-suspect"
                : "result-pathologic"
            }`}
            id="resultText"
          >
            {result.error ? "Error" : result.status_label}
          </div>

          <div className="result-description" id="resultDescription">
            {result.error
              ? result.error
              : result.status_label === "Normal"
              ? "The CTG analysis indicates normal fetal heart rate patterns. The fetus is in a healthy state with no signs of distress. Continue routine monitoring as per clinical protocol."
              : result.status_label === "Suspect"
              ? "The CTG analysis shows suspicious patterns. Close monitoring is recommended. Consult with your healthcare provider for further evaluation and possible intervention."
              : "The CTG analysis indicates pathological patterns. Immediate medical attention is required. Please contact your healthcare provider immediately or proceed to emergency care."}
          </div>

          <div className="result-actions">
            <button onClick={resetForm} className="btn btn-primary">🔄 New Analysis</button>
            <button onClick={onBack} className="btn btn-secondary">← Back to Patient Info</button>
          </div>
        </div>
      )}

      {/* Recent patients listing when logged in */}
      {token && patients.length > 0 && (
        <div className="form-card" style={{ marginTop: "1.5rem" }}>
          <h3>Recent Patients</h3>
          <div style={{ display: "grid", gap: 10 }}>
            {patients.map((p) => (
              <div key={p.id} className="category-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{p.patient_name}</strong>
                  <div style={{ fontSize: 13, color: "#666" }}>{new Date(p.created_at).toLocaleString()}</div>
                </div>
                <div style={{ textTransform: "capitalize", fontWeight: 700 }}>
                  {p.prediction_label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* --- Helper subcomponents --- */

function Section({ title, children }) {
  return (
    <>
      <div className="section-header">
        <h3>{title}</h3>
      </div>
      <div className="input-grid">{children}</div>
    </>
  );
}

function Input({ label, name, value, onChange, help }) {
  return (
    <div className="input-group">
      <label>{label}</label>
      <input type="number" step="0.1" name={name} value={value} onChange={onChange} required />
      <small className="input-help">{help}</small>
    </div>
  );
}

function PatientInfo({ label, value }) {
  return (
    <div className="patient-info-item">
      <strong>{label}</strong> {value}
    </div>
  );
}
