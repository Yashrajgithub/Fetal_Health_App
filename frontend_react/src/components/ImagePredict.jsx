import React, { useState, useEffect } from "react";
import "../index.css";
import beepSound from "../button-10.mp3";

const ImagePredict = ({ onBack }) => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [topFeatures, setTopFeatures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("idle");

  // 🔥 DOWNLOAD REPORT
  const downloadReport = async () => {
    try {
      const toBase64 = (url) =>
        fetch(url)
          .then((res) => res.blob())
          .then(
            (blob) =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              })
          );

      const base64Image = preview ? await toBase64(preview) : null;

      const res = await fetch("http://127.0.0.1:5000/api/download-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prediction: result,
          confidence: confidence,
          top_features: topFeatures,
          image: base64Image,
        }),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "CTG_Report.pdf";
      a.click();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  // 🔥 LOADING TEXT
  const loadingMessages = [
    "Analyzing CTG patterns...",
    "Extracting features from signal...",
    "Detecting fetal signals...",
    "Running AI model...",
  ];

  useEffect(() => {
    let interval;
    if (stage === "analyzing") {
      let i = 0;
      setLoadingText(loadingMessages[0]);

      interval = setInterval(() => {
        i = (i + 1) % loadingMessages.length;
        setLoadingText(loadingMessages[i]);
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [stage]);

  // 🔥 SOUND ALERT
  const [audioObj, setAudioObj] = useState(null);

  useEffect(() => {
    if (result === "Pathologic") {
      const audio = new Audio(beepSound);
      audio.volume = 0.5;

      audio.play().catch(() => { });

      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 3000); // stop after 3 sec
    }
  }, [result]);

  // 🔥 HANDLE IMAGE
  const handleChange = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult("");
    setConfidence(null);
    setTopFeatures([]);
  };

  // 🔥 API CALL
  const handleUpload = async () => {
    if (!image) return alert("Upload image first");

    const formData = new FormData();
    formData.append("image", image);

    // RESET
    setResult("");
    setConfidence(null);
    setTopFeatures([]);
    setStage("extracting");
    setProgress(0);

    // ✅ STEP 1: PROGRESS (WAIT TILL 100)
    await new Promise((resolve) => {
      let val = 0;

      const interval = setInterval(() => {
        val += (100 - val) * 0.08; // smoother
        val = Math.min(val, 100);

        setProgress(Math.floor(val));

        if (val >= 99) {   // 🔥 FIX HERE
          val = 100;
          setProgress(100);
          clearInterval(interval);
          resolve();
        } else {
          setProgress(Math.floor(val));
        }
      }, 120);
    });

    // ✅ STEP 2: CALL API (AFTER extraction)
    let data;
    try {
      const res = await fetch("http://127.0.0.1:5000/api/predict-image", {
        method: "POST",
        body: formData,
      });

      data = await res.json();
    } catch {
      setResult("Server error");
      setStage("done");
      return;
    }

    // ✅ STEP 3: ANALYZING
    setStage("analyzing");

    await new Promise((r) => setTimeout(r, 3000)); // smooth delay

    // ✅ STEP 4: RESULT
    if (data.error) {
      setResult(data.error);
    } else {
      setResult(data.prediction_label);
      setConfidence(data.confidence);
      setTopFeatures(data.top_features || []);
    }

    setStage("done");
  };

  const getResultColor = () => {
    if (result === "Normal") return "#22c55e";
    if (result === "Suspect") return "#f59e0b";
    if (result === "Pathologic") return "#ef4444";
    return "#ccc";
  };

  const formatFeatureName = (name) => {
    const map = {
      baseline_value: "Fetal Heart Rate",
      abnormal_short_term_variability: "Short-term Variability",
      mean_value_of_short_term_variability: "Mean STV",
      percentage_of_time_with_abnormal_long_term_variability:
        "Abnormal LTV %",
      mean_value_of_long_term_variability: "Mean LTV",
      accelerations: "Accelerations",
      fetal_movement: "Fetal Movement",
      uterine_contractions: "Uterine Contractions",
      prolongued_decelerations: "Prolonged Decelerations",
      histogram_variance: "Histogram Variance",
    };
    return map[name] || name;
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button onClick={onBack} style={styles.backBtn}>← Back</button>

        <div style={styles.header}>
          <h2 style={styles.title}>CTG Image Analysis</h2>
          <p style={styles.subtitle}>
            AI-powered fetal health prediction dashboard
          </p>
        </div>

        <div style={styles.grid}>
          {/* LEFT */}
          <div style={styles.leftPanel}>
            <label style={styles.uploadBox}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleChange(e.target.files[0])}
                style={{ display: "none" }}
              />
              <div style={styles.uploadContent}>
                <span>📤</span>
                <p>Upload CTG Image</p>
              </div>
            </label>

            {preview && (
              <>
                <div style={styles.previewContainer}>
                  <img src={preview} alt="preview" style={styles.image} />
                  {stage === "extracting" && <div className="scan-line"></div>}

                  {stage === "extracting" && (
                    <div style={styles.overlayBox}>
                      <div style={styles.overlayContent}>
                        <p>Extracting features...</p>

                        <div style={styles.progressBar}>
                          <div
                            style={{
                              ...styles.progressFill,
                              width: `${progress}%`,
                            }}
                          />
                        </div>

                        <p>{progress}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            <button onClick={handleUpload} style={styles.button}>
              {loading ? loadingText : "Run Prediction"}
            </button>
          </div>

          {/* RIGHT */}
          <div style={styles.rightPanel}>
            <h3 style={styles.panelTitle}>Prediction Result</h3>

            {stage === "analyzing" ? (
              <div style={styles.loaderBox}>
                <div style={styles.spinner}></div>
                <p>{loadingText}</p>
              </div>
            ) : !result ? (
              <p style={styles.placeholder}>
                Upload image and run prediction to see results
              </p>
            ) : (
              // RESULT CARD (same as before)
              <div style={styles.resultCard}>

                {/* ALERT */}
                {result === "Pathologic" && (
                  <div style={styles.alertBox}>
                    ⚠ High Risk: Abnormal CTG pattern detected
                  </div>
                )}

                <h2 style={{ color: getResultColor() }}>{result}</h2>

                <p>Confidence: {confidence}%</p>

                <div style={styles.bar}>
                  <div
                    style={{
                      ...styles.barFill,
                      width: `${confidence}%`,
                      background: getResultColor(),
                    }}
                  />
                </div>

                {topFeatures.length > 0 && (
                  <div style={styles.featuresBox}>
                    <h4>Key Parameters</h4>
                    {topFeatures.map((f, i) => (
                      <div key={i} style={styles.featureItem}>
                        <span>{formatFeatureName(f.name)}</span>
                        <b>{f.value}</b>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={downloadReport}
                  style={{ ...styles.button, marginTop: "15px" }}
                >
                  Download Report
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "1100px",
    background: "#fff",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)",
  },
  backBtn: {
    marginBottom: "10px",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "25px",
  },
  leftPanel: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  uploadBox: {
    border: "2px dashed #cbd5f5",
    borderRadius: "12px",
    background: "#f8fafc",
    cursor: "pointer",
  },
  uploadContent: {
    padding: "25px",
    textAlign: "center",
  },
  previewContainer: {
    position: "relative",
    width: "100%",
    height: "350px",
    overflow: "hidden",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "center",
    alignItems: "center", // 🔥 center properly
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "fill",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    transition: "transform 0.3s ease",
    zindex: 1,
  },
  button: {
    padding: "12px",
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
  rightPanel: {
    background: "#f8fafc",
    padding: "20px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },
  loaderBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "15px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e2e8f0",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  resultCard: {
    textAlign: "center",
  },
  bar: {
    width: "100%",
    height: "8px",
    background: "#e2e8f0",
    borderRadius: "5px",
    marginTop: "10px",
  },
  barFill: {
    height: "100%",
    borderRadius: "5px",
  },
  featuresBox: {
    marginTop: "15px",
    textAlign: "left",
  },
  featureItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "6px 0",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "14px",
  },
  alertBox: {
    background: "#fee2e2",
    color: "#ef4444",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    fontWeight: "600",
    border: "1px solid #ef4444",
  },
  placeholder: {
    color: "#94a3b8",
  },

  overlayBox: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(15, 23, 42, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "12px",
    zIndex: 3, // 🔥 top
  },

  overlayContent: {
    textAlign: "center",
    color: "#fff",
  },

  overlaySpinner: {
    width: "40px",
    height: "40px",
    border: "4px solid rgba(255,255,255,0.3)",
    borderTop: "4px solid #fff",
    borderRadius: "50%",
    margin: "0 auto 10px",
    animation: "spin 1s linear infinite",
  },
  progressBar: {
    width: "200px",
    height: "8px",
    background: "rgba(255,255,255,0.3)",
    borderRadius: "5px",
    margin: "10px auto",
  },

  progressFill: {
    height: "100%",
    background: "#3b82f6",
    borderRadius: "5px",
  },

};

export default ImagePredict;