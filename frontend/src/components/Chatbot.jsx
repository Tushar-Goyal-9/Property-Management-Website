import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { MessageSquare, Send, X, Sparkles, AlertCircle } from "lucide-react";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat, typing]);

  const sendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) return;

    const userMsg = { sender: "user", text: message };
    setChat((prev) => [...prev, userMsg]);
    const currentInput = message;
    setMessage("");
    setTyping(true);

    try {
      const { data } = await axios.post(`${API_URL}/api/chat`, { message: currentInput });
      const botMsg = { sender: "bot", text: data.reply };
      setChat((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChat((prev) => [
        ...prev,
        { sender: "bot", text: "Assistant service is currently busy. Please try again." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <>
      {/* 💬 Floating Glass Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-full flex items-center justify-center shadow-xl shadow-teal-600/25 border border-teal-500/20 transition-all duration-200"
        aria-label="Toggle assistant chat"
      >
        {open ? <X size={20} /> : <MessageSquare size={20} />}
      </button>

      {/* 🧠 Chat Window (Glassmorphic Pane) */}
      {open && (
        <div className="fixed bottom-24 right-6 w-[340px] sm:w-[360px] h-[480px] bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-[0_12px_40px_rgba(15,23,42,0.15)] flex flex-col overflow-hidden z-50 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6">
          
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3.5 flex items-center justify-between border-b border-slate-800 text-white">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 bg-teal-600/10 border border-teal-500/30 rounded-lg flex items-center justify-center text-teal-400">
                <Sparkles size={14} className="animate-pulse" />
              </div>
              <div>
                <p className="font-outfit text-xs font-bold leading-tight">AI Advisor</p>
                <span className="text-[9px] text-teal-400 font-bold block tracking-wider uppercase leading-none mt-0.5">Online</span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {chat.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-2">
                <div className="h-10 w-10 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400">
                  <Sparkles size={16} />
                </div>
                <p className="font-outfit text-xs font-bold text-slate-800">Ask Me Anything</p>
                <p className="text-[10px] text-slate-400 max-w-[180px] leading-relaxed">
                  Inquire about cities, properties, agent licenses, or pricing details.
                </p>
              </div>
            )}

            {chat.map((c, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-sm transition-all duration-150 ${
                  c.sender === "user"
                    ? "ml-auto bg-teal-600 text-white rounded-tr-none shadow-teal-600/5"
                    : "mr-auto bg-white border border-slate-200/80 text-slate-850 rounded-tl-none"
                }`}
              >
                <div className="prose prose-sm prose-slate max-w-none text-inherit">
                  <ReactMarkdown>{c.text}</ReactMarkdown>
                </div>
              </div>
            ))}

            {typing && (
              <div className="mr-auto bg-white border border-slate-200/80 rounded-2xl rounded-tl-none px-3.5 py-3 shadow-sm flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-100" />
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-bounce delay-200" />
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Form Input Box */}
          <form onSubmit={sendMessage} className="p-3 border-t border-slate-100 bg-white flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about properties..."
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-teal-500 rounded-xl px-3 py-2 text-xs outline-none text-slate-800 placeholder-slate-400 transition-colors"
            />
            <button
              type="submit"
              className="h-8 w-8 bg-teal-600 hover:bg-teal-500 active:scale-95 text-white rounded-lg flex items-center justify-center transition-all shrink-0 shadow-sm"
              aria-label="Send message"
            >
              <Send size={12} />
            </button>
          </form>

        </div>
      )}
    </>
  );
};

export default Chatbot;