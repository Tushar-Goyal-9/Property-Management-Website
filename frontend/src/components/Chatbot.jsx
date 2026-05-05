import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

 const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  const sendMessage = async () => {
    if (!message) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/chat`,
        { message }
      );

      const botMsg = { sender: "bot", text: data.reply };
      setChat((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "Server busy. Try again." },
      ]);
    }

    setMessage("");
  };

  return (
    <>
      {/* 💬 Floating Button */}
      <div
        style={styles.floatingBtn}
        onClick={() => setOpen(!open)}
      >
        💬
      </div>

      {/* 🧠 Chat Window */}
      {open && (
        <div style={styles.chatContainer}>
          <div style={styles.header}>
            AI Assistant 🤖
          </div>

          <div style={styles.chatBox}>
            {chat.map((c, i) => (
              <div
                key={i}
                style={{
                  ...styles.message,

                  alignSelf:
                    c.sender === "user"
                      ? "flex-end"
                      : "flex-start",

                  background:
                    c.sender === "user"
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : "#f3f4f6",

                  color:
                    c.sender === "user"
                      ? "#ffffff"
                      : "#111827",

                  boxShadow:
                    c.sender === "user"
                      ? "0 4px 10px rgba(16,185,129,0.3)"
                      : "0 2px 6px rgba(0,0,0,0.1)",
                }}
              >
                <ReactMarkdown>{c.text}</ReactMarkdown>
              </div>
            ))}
          </div>

          <div style={styles.inputBox}>
            <input
              style={styles.input}
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Ask about properties..."
            />
            <button style={styles.button} onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  floatingBtn: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#10b981",
    color: "white",
    padding: "16px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "20px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
    zIndex: 1000,
  },

  chatContainer: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    width: "340px",
    height: "450px",
    background: "#ffffff",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    overflow: "hidden",
    zIndex: 1000,
    border: "1px solid #e5e7eb",
  },

  header: {
    background: "#10b981",
    padding: "12px",
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: "16px",
  },

  chatBox: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    background: "#f9fafb",
  },

  message: {
    padding: "10px 12px",
    borderRadius: "16px", // 🔥 smoother look
    maxWidth: "80%",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  inputBox: {
    display: "flex",
    borderTop: "1px solid #e5e7eb",
    background: "white",
  },

  input: {
    flex: 1,
    padding: "10px",
    border: "none",
    outline: "none",
    background: "white",
    color: "#111827",
  },

  button: {
    padding: "10px 14px",
    background: "#10b981",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontWeight: "500",
  },
};

export default Chatbot;