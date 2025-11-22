import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Send, LogOut, Hash, Users, MessageSquare, Zap, Menu, X } from "lucide-react";
import Login from "./components/Login";

const SOCKET_URL = "http://localhost:5001";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,
});

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [roomId, setRoomId] = useState("general");
  const [joined, setJoined] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [socketId, setSocketId] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;

    socket.auth = { token: localStorage.getItem("token") };
    socket.connect();

    socket.on("connect", () => {
      setSocketId(socket.id);
    });

    socket.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", ({ userId }) => {
      setTypingUsers((prev) =>
        prev.includes(userId) ? prev : [...prev, userId]
      );
    });

    socket.on("stop_typing", ({ userId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    });

    socket.on("disconnect", () => {
      setSocketId("");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("receive_message");
      socket.off("typing");
      socket.off("stop_typing");
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoin = () => {
    if (!roomId.trim()) return;
    socket.emit("join_conversation", roomId);
    setJoined(true);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const payload = {
      conversationId: roomId,
      text: message,
      senderId: user?.username || socket.id,
    };

    socket.emit("send_message", payload);
    setMessage("");
    socket.emit("stop_typing", { conversationId: roomId, userId: user?.username || socket.id });
  };

  const handleTypingChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    if (!joined) return;

    if (value.length > 0) {
      socket.emit("typing", { conversationId: roomId, userId: user?.username || socket.id });
    } else {
      socket.emit("stop_typing", { conversationId: roomId, userId: user?.username || socket.id });
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setJoined(false);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <div className="mesh-bg" />
      <div className="noise-overlay" />

      {/* Mobile Sidebar Toggle */}
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 50, display: window.innerWidth < 768 ? 'block' : 'none' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'white' }}>
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="glass-card"
        style={{
          width: "280px",
          margin: "20px 0 20px 20px",
          display: "flex",
          flexDirection: "column",
          zIndex: 40,
          borderRadius: "24px",
          borderRight: "1px solid rgba(255,255,255,0.05)"
        }}
      >
        <div style={{ padding: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "12px",
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.5)"
            }}>
              <img src="/logo.png" alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <h1 style={{ fontSize: "1.25rem", fontWeight: "700" }}>Real Time Chat</h1>
          </div>

          <div style={{
            padding: "12px", background: "rgba(255,255,255,0.03)",
            borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px"
          }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#334155", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {user.username[0].toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "600", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{user.username}</div>
              <div style={{ fontSize: "0.75rem", color: "#22c55e" }}>● Online</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "24px" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: "600", color: "#64748b", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Active Rooms
          </div>
          {joined && (
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", background: "rgba(99, 102, 241, 0.1)",
                borderRadius: "12px", color: "#818cf8", border: "1px solid rgba(99, 102, 241, 0.2)"
              }}
            >
              <Hash size={16} />
              <span style={{ fontWeight: "500" }}>{roomId}</span>
            </motion.div>
          )}
        </div>

        <div style={{ padding: "24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: "10px",
              padding: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px", color: "#94a3b8", cursor: "pointer", transition: "all 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.color = "#fca5a5";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
        style={{
          flex: 1, margin: "20px 20px 20px 0", display: "flex", flexDirection: "column",
          borderRadius: "24px", overflow: "hidden"
        }}
      >
        {!joined ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "24px",
              background: "linear-gradient(135deg, #6366f1, #ec4899)",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px",
              boxShadow: "0 20px 40px -10px rgba(99, 102, 241, 0.5)"
            }}>
              <MessageSquare size={40} color="white" fill="white" />
            </div>
            <h2 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "8px" }}>Join a Channel</h2>
            <p style={{ color: "#94a3b8", marginBottom: "32px" }}>Enter a room ID to start chatting with your team.</p>

            <div style={{ position: "relative", width: "100%", maxWidth: "400px" }}>
              <Hash style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#64748b" }} size={20} />
              <input
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Room Name"
                style={{
                  width: "100%", padding: "16px 16px 16px 48px", borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)",
                  color: "white", fontSize: "1rem", outline: "none"
                }}
              />
              <button
                onClick={handleJoin}
                style={{
                  position: "absolute", right: "8px", top: "8px", bottom: "8px",
                  padding: "0 20px", borderRadius: "10px", border: "none",
                  background: "linear-gradient(135deg, #6366f1, #a855f7)", color: "white",
                  fontWeight: "600", cursor: "pointer"
                }}
              >
                Join
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{
              padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              background: "rgba(0,0,0,0.2)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Hash size={24} color="#818cf8" />
                <div>
                  <h2 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{roomId}</h2>
                  <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Topic: General discussion</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "-8px" }}>
                {[1, 2, 3].map(i => (
                  <div key={i} style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: `hsl(${i * 50}, 70%, 50%)`, border: "2px solid #1e293b",
                    marginLeft: "-8px"
                  }} />
                ))}
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: "#334155", border: "2px solid #1e293b", marginLeft: "-8px",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: "600"
                }}>
                  +5
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, idx) => {
                  const isMe = msg.senderId === user.username;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 24 }}
                      style={{
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMe ? "flex-end" : "flex-start",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "600", color: isMe ? "#818cf8" : "#e2e8f0" }}>
                          {isMe ? "You" : msg.senderId}
                        </span>
                        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>12:42 PM</span>
                      </div>
                      <div
                        style={{
                          padding: "16px 20px",
                          borderRadius: "20px",
                          borderTopRightRadius: isMe ? "4px" : "20px",
                          borderTopLeftRadius: isMe ? "20px" : "4px",
                          background: isMe
                            ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                            : "rgba(30, 41, 59, 0.6)",
                          color: "white",
                          boxShadow: isMe ? "0 10px 20px -5px rgba(99, 102, 241, 0.4)" : "none",
                          fontSize: "0.95rem",
                          lineHeight: "1.6",
                          border: isMe ? "none" : "1px solid rgba(255,255,255,0.05)"
                        }}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: "24px 32px", background: "rgba(0,0,0,0.2)" }}>
              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <span className="typing-dot" style={{ width: "6px", height: "6px", background: "#a855f7", borderRadius: "50%" }}></span>
                  {typingUsers.join(", ")} is typing...
                </motion.div>
              )}

              <form onSubmit={handleSend} style={{ position: "relative" }}>
                <input
                  value={message}
                  onChange={handleTypingChange}
                  placeholder="Type a message..."
                  style={{
                    width: "100%", padding: "18px 60px 18px 24px", borderRadius: "20px",
                    border: "1px solid rgba(255,255,255,0.1)", background: "rgba(15, 23, 42, 0.4)",
                    color: "white", fontSize: "1rem", outline: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.background = "rgba(15, 23, 42, 0.6)";
                    e.target.style.borderColor = "rgba(168, 85, 247, 0.5)";
                    e.target.style.boxShadow = "0 0 0 4px rgba(168, 85, 247, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.background = "rgba(15, 23, 42, 0.4)";
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    width: "40px", height: "40px", borderRadius: "12px", border: "none",
                    background: message.trim() ? "linear-gradient(135deg, #6366f1, #a855f7)" : "rgba(255,255,255,0.1)",
                    color: message.trim() ? "white" : "rgba(255,255,255,0.2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: message.trim() ? "pointer" : "default",
                    transition: "all 0.2s"
                  }}
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default App;
