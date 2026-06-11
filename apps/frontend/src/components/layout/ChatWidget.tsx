"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: string; text: string }[]>([
    { role: "assistant", text: "Halo! Saya adalah RPMS Assistant. Ada yang bisa saya bantu terkait sistem hari ini?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message to UI
    const updatedMessages = [...messages, { role: "user", text: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Format history for backend
      const history = messages.map(msg => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const recentHistory = history.slice(-10);

      const response = await api.post("/ai/chat", {
        message: userMessage,
        history: recentHistory,
      });

      setMessages(prev => [...prev, { role: "assistant", text: response.data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "assistant", text: "Maaf, sistem AI sedang mengalami gangguan atau belum dikonfigurasi. Silakan coba lagi nanti." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-widget-container" style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="chat-window"
          style={{ 
            marginBottom: 16, width: "380px", maxWidth: "calc(100vw - 48px)", height: 500, maxHeight: "80vh", 
            display: "flex", flexDirection: "column", background: "rgba(255,255,255,0.95)", 
            backdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.1)", 
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", borderRadius: 16, overflow: "hidden",
            animation: "scaleIn 0.2s ease-out forwards", transformOrigin: "bottom right"
          }}
        >
          {/* Header */}
          <div style={{ background: "linear-gradient(to right, #1a365d, #2563eb)", padding: "16px", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg style={{ width: 20, height: 20, color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: 14 }}>RPMS Assistant</h3>
                <p style={{ margin: 0, fontSize: 12, color: "#DBEAFE" }}>AI Powered Guide</p>
              </div>
            </div>
            <button onClick={toggleChat} style={{ background: "none", border: "none", cursor: "pointer", color: "white", opacity: 0.8 }} onMouseEnter={e => e.currentTarget.style.opacity="1"} onMouseLeave={e => e.currentTarget.style.opacity="0.8"}>
              <svg style={{ width: 24, height: 24 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 16, background: "#F8FAFC" }}>
            {messages.map((msg, index) => (
              <div key={index} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div 
                  style={{ 
                    maxWidth: "85%", padding: 12, borderRadius: 16, fontSize: 14, boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    background: msg.role === "user" ? "#2563eb" : "white",
                    color: msg.role === "user" ? "white" : "#1e293b",
                    border: msg.role === "user" ? "none" : "1px solid #f1f5f9",
                    borderTopRightRadius: msg.role === "user" ? 4 : 16,
                    borderTopLeftRadius: msg.role === "user" ? 16 : 4,
                  }}
                >
                  <p style={{ margin: 0, lineHeight: 1.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{ background: "white", border: "1px solid #f1f5f9", padding: 12, borderRadius: 16, borderTopLeftRadius: 4, display: "flex", gap: 4, alignItems: "center" }}>
                  <div style={{ width: 8, height: 8, background: "#cbd5e1", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0s" }}></div>
                  <div style={{ width: 8, height: 8, background: "#cbd5e1", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.15s" }}></div>
                  <div style={{ width: 8, height: 8, background: "#cbd5e1", borderRadius: "50%", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.3s" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: 12, background: "white", borderTop: "1px solid #f1f5f9", flexShrink: 0 }}>
            <form onSubmit={sendMessage} style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan sesuatu..."
                style={{ flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 9999, padding: "8px 16px", fontSize: 16, outline: "none" }}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 9999, width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", cursor: (!input.trim() || isLoading) ? "not-allowed" : "pointer", opacity: (!input.trim() || isLoading) ? 0.5 : 1 }}
              >
                <svg style={{ width: 20, height: 20, marginLeft: 2 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={toggleChat}
        className="chat-toggle-btn"
        style={{ width: 56, height: 56, flexShrink: 0, background: "linear-gradient(to right, #1a365d, #2563eb)", borderRadius: "50%", border: "none", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)", cursor: "pointer", position: "relative", transition: "transform 0.3s" }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        <span style={{ position: "absolute", top: -4, right: -4, display: "flex", width: 12, height: 12 }}>
          <span style={{ position: "absolute", display: "inline-flex", width: "100%", height: "100%", borderRadius: "50%", background: "#60a5fa", opacity: 0.75, animation: "ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite" }}></span>
          <span style={{ position: "relative", display: "inline-flex", borderRadius: "50%", width: 12, height: 12, background: "#3b82f6" }}></span>
        </span>
        {isOpen ? (
          <svg style={{ width: 24, height: 24, color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg style={{ width: 28, height: 28, color: "white" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Required Keyframes for animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        
        @media (max-width: 768px) {
          .chat-widget-container {
            bottom: 16px !important;
            right: 16px !important;
            left: 16px !important;
          }
          .chat-window {
            max-width: none !important;
            width: 100% !important;
            height: calc(100vh - 100px) !important;
            max-height: none !important;
          }
        }
      `}} />
    </div>
  );
}
