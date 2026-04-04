// src/App.jsx
import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import PredictionPage from "./components/PredictionPage";
import AboutPage from "./components/AboutPage";
import LoginModal from "./components/LoginModal";
import RegisterModal from "./components/RegisterModal";
import Chatbot from "./components/Chatbot";
import Footer from "./components/Footer";
import ImagePredict from "./components/ImagePredict";
import "./styles.css";

function App() {
  const [page, setPage] = useState("landing");
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [user, setUser] = useState(localStorage.getItem("user") || null);

  const [patientData, setPatientData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("patientData")) || null;
    } catch {
      return null;
    }
  });

  // Auto open login if not logged in
  useEffect(() => {
    if (!user) {
      setShowLogin(true);
    }
  }, [user]);

  // Login
  const handleLoginSuccess = (username) => {
    setUser(username);
    localStorage.setItem("user", username);
    setShowLogin(false);
    setShowRegister(false);
    setPage("landing");
  };

  // Register
  const handleRegisterSuccess = (username) => {
    setUser(username);
    localStorage.setItem("user", username);
    setShowRegister(false);
    setShowLogin(false);
    setPage("landing");
  };

  // Logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setPatientData(null);
    sessionStorage.removeItem("patientData");

    setPage("landing");
    setShowLogin(true);
    window.scrollTo(0, 0);
  };

  // Move to Prediction page
  const handleProceedToPrediction = (data) => {
    setPatientData(data);
    sessionStorage.setItem("patientData", JSON.stringify(data));
    setPage("prediction");
  };

  // 🔒 If not logged in → show only login/register
  if (!user) {
    return (
      <>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg,#e8f1f9 0%, #f0f7ff 100%)",
            padding: "2rem",
          }}
        >
          <div style={{ textAlign: "center", opacity: 0.95 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🤖❤️</div>
            <h1 style={{ margin: 0, fontSize: 22 }}>Fetal Detection AI</h1>
            <p style={{ color: "#475569", marginTop: 8 }}>
              Please sign in or register to continue
            </p>
          </div>
        </div>

        {showLogin && (
          <LoginModal
            onClose={() => setShowLogin(false)}
            onLoginSuccess={handleLoginSuccess}
            onOpenRegister={() => {
              setShowLogin(false);
              setShowRegister(true);
            }}
          />
        )}

        {showRegister && (
          <RegisterModal
            onClose={() => setShowRegister(false)}
            onRegisterSuccess={handleRegisterSuccess}
          />
        )}
      </>
    );
  }

  // ✅ Main App UI
  return (
    <>
      <Navbar
        onNavigate={setPage}
        onLoginClick={() => setShowLogin(true)}
        onRegisterClick={() => setShowRegister(true)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Pages */}
      {page === "landing" && (
        <LandingPage onNext={handleProceedToPrediction} />
      )}

      {page === "prediction" && (
        <PredictionPage
          patientData={patientData}
          onBack={() => setPage("landing")}
        />
      )}

      {page === "about" && <AboutPage />}

      {page === "image" && (
        <ImagePredict onBack={() => setPage("landing")} />
      )}

      {/* Modals */}
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLoginSuccess={handleLoginSuccess}
          onOpenRegister={() => {
            setShowLogin(false);
            setShowRegister(true);
          }}
        />
      )}

      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}

      {/* Global Components */}
      <Chatbot />
      <Footer />
    </>
  );
}

export default App;