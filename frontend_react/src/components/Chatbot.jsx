import React, { useState, useRef, useEffect } from "react";
import { chatbotQA } from "../data/chatbotData";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! 🤖 I'm your CTG Assistant.", time: getTime() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [context, setContext] = useState(null);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  function getTime() {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // 🎤 Voice Input (AUTO SEND)
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);

        setTimeout(() => {
          handleSend(transcript);
        }, 500);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const startListening = () => {
    recognitionRef.current?.start();
  };

  // 🔊 Speak
  const speak = (text) => {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utter);
  };

  // 🧠 Smart AI Logic
  const getBotReply = (userInput) => {
    const text = userInput.toLowerCase();

    if (/(hi|hello|hey)/.test(text))
      return "Hey! 👋 Ask me anything about CTG.";

    if (text.includes("thank")) return "You're welcome 😊";

    if (text.includes("difference"))
      return "Normal = healthy, Suspect = caution, Pathologic = high risk.";

    if (context === "baseline fhr" && text.includes("normal"))
      return "Normal baseline FHR is 110–160 bpm.";

    // keyword scoring
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

    if (best && max > 0) {
      setContext(best.question);
      return best.answer;
    }

    // smart fallback
    if (text.includes("what") || text.includes("explain"))
      return "I may not have exact info 🤔 but I can help with CTG concepts like baseline FHR, variability, suspect, and pathologic.";

    if (text.includes("how"))
      return "You can analyze CTG from the Predict page. Need help with parameters?";

    return `I’m not sure 🤖  

Try asking:
• Baseline FHR  
• Variability  
• Suspect vs Pathologic  
• CTG analysis`;
  };

  // 📩 Send
  const handleSend = (voiceInput = null) => {
    const msg = voiceInput || input;
    if (!msg.trim()) return;

    const userMsg = { sender: "user", text: msg, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);

    const reply = getBotReply(msg);

    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      speak(reply);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: reply, time: getTime() },
      ]);
    }, 800);

    setInput("");
  };

  // scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {/* 🎨 ADVANCED CSS */}
      <style>{`
        .fab {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: linear-gradient(135deg,#3b82f6,#8b5cf6);
          color: white;
          padding: 15px;
          border-radius: 50%;
          cursor: pointer;
        }

        .modal {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 340px;
          height: 480px;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(15px);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }

        .header {
          padding: 12px;
          color: white;
          background: linear-gradient(135deg,#3b82f6,#8b5cf6);
        }

        .body {
          flex: 1;
          overflow-y: auto;
          padding: 10px;
        }

        .msg {
          margin: 8px 0;
          padding: 10px;
          border-radius: 12px;
          max-width: 75%;
          animation: fadeIn 0.3s;
        }

        .user {
          background: #3b82f6;
          color: white;
          margin-left: auto;
        }

        .bot {
          background: #f1f5f9;
        }

        .time {
          font-size: 10px;
          opacity: 0.6;
        }

        @keyframes fadeIn {
          from {opacity:0; transform:translateY(5px);}
          to {opacity:1;}
        }

        .input {
          display: flex;
          padding: 10px;
        }

        .input input {
          flex: 1;
          padding: 10px;
          border-radius: 10px;
          border: 1px solid #ccc;
        }

        .input button {
          margin-left: 5px;
          padding: 10px;
          border: none;
          background: #3b82f6;
          color: white;
          border-radius: 10px;
        }

        .quick {
          padding: 5px;
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .quick button {
          padding: 5px 8px;
          border-radius: 8px;
          border: none;
          background: #eee;
        }
      `}</style>

      <div className="fab" onClick={() => setOpen(!open)}>💬</div>

      {open && (
        <div className="modal">
          <div className="header">🤖 CTG Assistant</div>

          <div className="body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.sender}`}>
                {m.sender === "bot" ? "🤖" : "👤"} {m.text}
                <div className="time">{m.time}</div>
              </div>
            ))}

            {typing && <div className="msg bot">🤖 ...</div>}
            <div ref={chatEndRef}></div>
          </div>

          <div className="quick">
            {["Baseline FHR", "Variability", "Suspect", "Pathologic"].map((q) => (
              <button key={q} onClick={() => setInput(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className="input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or speak..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={startListening}>🎤</button>
            <button onClick={() => handleSend()}>➤</button>
          </div>
        </div>
      )}
    </>
  );
}
