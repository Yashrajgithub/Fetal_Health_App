import React, { useState, useRef, useEffect } from "react";

export default function Chatbot() {
  const chatbotQA = [
    {
      question: "baseline fhr",
      answer:
        "Baseline FHR is the average fetal heart rate over 10 minutes. Normal range: 110–160 bpm.",
    },
    {
      question: "histogram variance",
      answer:
        "Histogram variance measures variability in fetal heart rate.",
    },
    {
      question: "suspect",
      answer:
        "A 'Suspect' result means irregular patterns — further monitoring needed.",
    },
    {
      question: "pathologic",
      answer:
        "A 'Pathologic' result indicates fetal distress. Immediate attention required.",
    },
    {
      question: "ai model",
      answer:
        "This app uses an XGBoost model trained on CTG parameters.",
    },
  ];

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! 🤖 I'm your CTG Assistant." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [context, setContext] = useState(null);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // 🎤 Voice input
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";

      recognition.onresult = (e) => {
        setInput(e.results[0][0].transcript);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    recognitionRef.current?.start();
  };

  // 🔊 Speech output
  const speak = (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utter);
  };

  // 🧠 AI logic
  const getBotReply = (text) => {
    text = text.toLowerCase();

    if (/(hi|hello|hey)/.test(text))
      return "Hey! 👋 Ask me anything about CTG.";

    if (text.includes("thank")) return "You're welcome 😊";

    if (context === "baseline fhr" && text.includes("normal"))
      return "Normal range is 110–160 bpm.";

    let best = null;
    let max = 0;

    chatbotQA.forEach((q) => {
      let score = 0;
      q.question.split(" ").forEach((w) => {
        if (text.includes(w)) score++;
      });

      if (score > max) {
        max = score;
        best = q;
      }
    });

    if (best) {
      setContext(best.question);
      return best.answer;
    }

    return "Try asking about CTG parameters like baseline FHR.";
  };

  // 📩 Send
  const handleSend = () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text: input }]);

    const reply = getBotReply(input);

    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      speak(reply);
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 700);

    setInput("");
  };

  // auto scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* 💅 INLINE CSS */}
      <style>{`
        .fab {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #3b82f6;
          color: white;
          padding: 14px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 20px;
        }

        .modal {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 320px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          display: flex;
          flex-direction: column;
        }

        .header {
          background: #3b82f6;
          color: white;
          padding: 10px;
          border-radius: 20px 20px 0 0;
        }

        .body {
          max-height: 300px;
          overflow-y: auto;
          padding: 10px;
        }

        .msg {
          margin: 6px 0;
          padding: 8px 12px;
          border-radius: 10px;
          font-size: 14px;
        }

        .user {
          background: #dbeafe;
          text-align: right;
        }

        .bot {
          background: #f3f4f6;
        }

        .input {
          display: flex;
          padding: 10px;
          border-top: 1px solid #eee;
        }

        .input input {
          flex: 1;
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #ccc;
        }

        .input button {
          margin-left: 5px;
          padding: 8px;
          border: none;
          background: #3b82f6;
          color: white;
          border-radius: 8px;
          cursor: pointer;
        }

        .quick {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          padding: 5px;
        }

        .quick button {
          background: #eee;
          border: none;
          padding: 5px 8px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }
      `}</style>

      {/* 💬 Floating button */}
      <div className="fab" onClick={() => setOpen(!open)}>
        💬
      </div>

      {open && (
        <div className="modal">
          <div className="header">🤖 CTG Assistant</div>

          <div className="body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.sender}`}>
                {m.sender === "bot" ? "🤖" : "👤"} {m.text}
              </div>
            ))}

            {typing && <div className="msg bot">🤖 Typing...</div>}
            <div ref={chatEndRef} />
          </div>

          <div className="quick">
            {["Baseline FHR", "Suspect", "Pathologic"].map((q) => (
              <button key={q} onClick={() => setInput(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className="input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type or speak..."
            />
            <button onClick={startListening}>🎤</button>
            <button onClick={handleSend}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
