import React, { useState, useRef, useEffect } from "react";
import { chatbotQA } from "../data/chatbotData";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! 🤖 I'm your CTG Assistant." },
    {
      sender: "bot",
      text: "You can ask me about CTG parameters, results, or how this AI works.",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // Scroll to bottom automatically
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending message
  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    // Generate reply
    const reply = getBotReply(input);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 500);

    setInput("");
  };

  // Simple matching logic using chatbotQA data
  const getBotReply = (userInput) => {
    const lowerInput = userInput.toLowerCase();
    const found = chatbotQA.find((q) =>
      lowerInput.includes(q.question.toLowerCase())
    );
    if (found) return found.answer;
    if (["hi", "hello", "hey"].some((g) => lowerInput.includes(g)))
      return "Hey there! 👋 How can I assist you with CTG analysis?";
    if (lowerInput.includes("thank"))
      return "You're welcome! 😊 Anything else you'd like to know?";
    return "Hmm, I’m not sure about that yet 🤔 — try asking about CTG parameters or fetal health.";
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (open && !e.target.closest(".chatbot-modal") && !e.target.closest(".chatbot-fab")) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      {/* Floating Chat Icon */}
      <div className="chatbot-fab" onClick={() => setOpen((prev) => !prev)}>
        💬
      </div>

      {/* Chatbot Modal */}
      {open && (
        <div className="chatbot-modal active">
          <div className="chatbot-header">🤖 CTG Assistant</div>
          <div className="chatbot-body" style={{ maxHeight: "350px", overflowY: "auto" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-msg ${msg.sender === "user" ? "user-msg" : "bot-msg"}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div
            className="chatbot-input"
            style={{
              display: "flex",
              borderTop: "1px solid #eee",
              padding: "0.8rem",
              background: "#f9fafb",
              borderRadius: "0 0 20px 20px",
            }}
          >
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              style={{
                flex: 1,
                padding: "0.6rem 1rem",
                border: "1px solid #ccc",
                borderRadius: "10px",
                fontFamily: "Poppins, sans-serif",
                outline: "none",
              }}
            />
            <button
              onClick={handleSend}
              style={{
                marginLeft: "0.6rem",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "10px",
                padding: "0.6rem 1rem",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
