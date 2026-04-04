import React from "react";
import useRevealAnimation from "../hooks/useRevealAnimation";

export default function AboutPage() {
  useRevealAnimation();

  const features = [
    {
      icon: "🏥",
      title: "Understanding Fetal Distress",
      text: "Fetal distress occurs when the fetus is not receiving enough oxygen. Early detection reduces risk and ensures better outcomes.",
    },
    {
      icon: "📊",
      title: "CTG Report Importance",
      text: "CTG monitors fetal heart rate and uterine contractions to assess fetal well-being during pregnancy and labor.",
    },
    {
      icon: "🤖",
      title: "AI-Powered Predictions",
      text: "Our ML model analyzes 21 CTG features to classify fetal condition as Normal, Suspect, or Pathologic.",
    },
    {
      icon: "🧠",
      title: "Clinical Support",
      text: "Assists medical professionals in faster, data-driven fetal assessment with improved reliability.",
    },
  ];

  const workflow = [
    {
      step: "1️⃣",
      title: "Data Entry",
      desc: "Clinician inputs CTG parameters via frontend form.",
    },
    {
      step: "2️⃣",
      title: "Preprocessing",
      desc: "Backend scales and validates input data using trained scaler.",
    },
    {
      step: "3️⃣",
      title: "AI Prediction",
      desc: "XGBoost model predicts fetal condition in real time.",
    },
    {
      step: "4️⃣",
      title: "Visualization",
      desc: "Prediction and confidence level displayed on dashboard.",
    },
  ];

  const team = [
    { initials: "SH", name: "Shreeya Holikatti", role: "Frontend Developer" },
    { initials: "LC", name: "Laxmi Chavan", role: "Backend Developer" },
    { initials: "UK", name: "Urjeeta Kasabe", role: "ML Engineer" },
    { initials: "YK", name: "Yashraj Kalshetti", role: "Database Manager" },
    { initials: "AK", name: "Amareswar Kore", role: "Data Specialist" },
  ];

  return (
    <div className="about-page container">
      <style>{`
        .about-page {
          padding: 2rem 1rem 4rem;
          animation: fadeIn 0.6s ease;
        }

        .about-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }

        .about-subtitle {
          text-align: center;
          color: #475569;
          max-width: 700px;
          margin: 0 auto 2.5rem;
          font-size: 1.05rem;
          line-height: 1.6;
        }

        /* Feature cards */
        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.85);
          border-radius: 14px;
          padding: 1.4rem;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
          transition: all 0.3s ease;
          border: 1px solid rgba(59, 130, 246, 0.08);
          text-align: center;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
        }

        .feature-card .icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .feature-card h3 {
          color: #0f172a;
          margin-bottom: 0.3rem;
          font-size: 1.1rem;
        }

        .feature-card p {
          color: #475569;
          font-size: 0.95rem;
          line-height: 1.5;
        }

        /* HOW IT WORKS SECTION */
        .how-it-works {
          margin-top: 3rem;
          text-align: center;
        }

        .how-title {
          font-size: 1.6rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .workflow-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1.2rem;
        }

        .workflow-card {
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
          padding: 1.5rem 1rem;
          width: 200px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .workflow-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
        }

        .workflow-card .step {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.3rem;
        }

        .workflow-card h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0.3rem 0;
          color: #0f172a;
        }

        .workflow-card p {
          font-size: 0.9rem;
          color: #475569;
          line-height: 1.4;
        }

        /* TEAM SECTION */
        .team-section {
          margin-top: 3rem;
          text-align: center;
        }

        .team-header {
          font-size: 1.6rem;
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 1rem;
        }

        .team-row {
          display: flex;
          justify-content: center;
          align-items: stretch;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .team-card {
          background: linear-gradient(135deg, #ffffff, #f8fafc);
          border-radius: 14px;
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08);
          padding: 1rem;
          width: 180px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12);
        }

        .team-avatar {
          width: 60px;
          height: 60px;
          margin-bottom: 0.6rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          font-weight: 700;
          color: #fff;
          background: linear-gradient(135deg, #3b82f6, #9333ea);
          animation: pulse 2s infinite;
        }

        .team-name {
          font-weight: 600;
          color: #0f172a;
          margin-bottom: 0.25rem;
          font-size: 0.95rem;
        }

        .team-role {
          font-size: 0.85rem;
          color: #475569;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
          70% { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
          100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
        }

        @media (max-width: 768px) {
          .workflow-card, .team-card { width: 45%; }
        }

        @media (max-width: 500px) {
          .workflow-card, .team-card { width: 100%; }
        }
      `}</style>

      <h2 className="about-title">Understanding Fetal Distress Detection</h2>
      <p className="about-subtitle">
        A clinical AI system for analyzing fetal health using CTG data —
        combining medical insight with data-driven intelligence.
      </p>

      <div className="feature-grid">
        {features.map((f, i) => (
          <div className="feature-card" key={i}>
            <div className="icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="how-it-works">
        <h3 className="how-title">How It Works</h3>
        <div className="workflow-row">
          {workflow.map((w, i) => (
            <div className="workflow-card" key={i}>
              <div className="step">{w.step}</div>
              <h4>{w.title}</h4>
              <p>{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TEAM SECTION */}
      <div className="team-section">
        <h3 className="team-header">Development Team</h3>
        <div className="team-row">
          {team.map((member, index) => (
            <div className="team-card" key={index}>
              <div className="team-avatar">{member.initials}</div>
              <div className="team-name">{member.name}</div>
              <div className="team-role">{member.role}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
