import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";

const Login = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
        const url = `http://localhost:5001${endpoint}`;

        const payload = isLogin
            ? { username, password }
            : { username, email, password };

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            onLogin(data.user, data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            perspective: '1000px'
        }}>
            <div className="mesh-bg" />
            <div className="noise-overlay" />

            <motion.div
                initial={{ opacity: 0, y: 20, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.8, type: "spring" }}
                className="glass-card"
                style={{
                    width: "100%",
                    maxWidth: "400px",
                    padding: "48px",
                    zIndex: 10,
                    margin: "20px",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <motion.h1
                        key={isLogin ? "login" : "register"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            fontSize: "2.5rem",
                            fontWeight: "700",
                            background: "linear-gradient(135deg, #fff 0%, #94a3b8 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            marginBottom: "12px",
                            letterSpacing: "-0.02em"
                        }}
                    >
                        {isLogin ? "Welcome Back" : "Create Account"}
                    </motion.h1>
                    <p style={{ color: "#64748b", fontSize: "1rem" }}>
                        {isLogin
                            ? "Enter your details to access your workspace"
                            : "Start your journey with us today"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <InputGroup icon={User} type="text" placeholder="Username" value={username} onChange={setUsername} />

                        {!isLogin && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                            >
                                <InputGroup icon={Mail} type="email" placeholder="Email Address" value={email} onChange={setEmail} />
                            </motion.div>
                        )}

                        <InputGroup icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} />
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{
                                background: "rgba(239, 68, 68, 0.1)",
                                border: "1px solid rgba(239, 68, 68, 0.2)",
                                color: "#fca5a5",
                                padding: "12px",
                                borderRadius: "12px",
                                fontSize: "0.85rem",
                                textAlign: "center",
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        style={{
                            background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                            color: "white",
                            fontSize: "1rem",
                            fontWeight: "600",
                            padding: "16px",
                            borderRadius: "16px",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            marginTop: "8px",
                            boxShadow: "0 10px 30px -10px rgba(99, 102, 241, 0.5)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px"
                        }}
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : (
                            <>
                                {isLogin ? "Sign In" : "Get Started"}
                                <ArrowRight size={18} />
                            </>
                        )}
                    </motion.button>
                </form>

                <div style={{ marginTop: "32px", textAlign: "center" }}>
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                        style={{
                            background: "transparent",
                            color: "#94a3b8",
                            fontSize: "0.9rem",
                            fontWeight: "500",
                            border: "none",
                            cursor: "pointer",
                            transition: "color 0.2s"
                        }}
                        onMouseOver={(e) => e.currentTarget.style.color = "white"}
                        onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
                    >
                        {isLogin ? (
                            <span>New here? <span style={{ color: "#a855f7" }}>Create an account</span></span>
                        ) : (
                            <span>Already have an account? <span style={{ color: "#a855f7" }}>Sign in</span></span>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const InputGroup = ({ icon: Icon, type, placeholder, value, onChange }) => {
    const [focused, setFocused] = useState(false);

    return (
        <div
            style={{
                position: "relative",
                transition: "all 0.2s",
                transform: focused ? "translateY(-2px)" : "none"
            }}
        >
            <Icon
                size={18}
                style={{
                    position: "absolute",
                    left: "16px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: focused ? "#a855f7" : "#64748b",
                    transition: "color 0.2s"
                }}
            />
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                required
                style={{
                    width: "100%",
                    padding: "16px 16px 16px 48px",
                    fontSize: "1rem",
                    background: "rgba(15, 23, 42, 0.3)",
                    border: `1px solid ${focused ? "#a855f7" : "rgba(255, 255, 255, 0.1)"}`,
                    borderRadius: "16px",
                    color: "white",
                    outline: "none",
                    transition: "all 0.2s",
                    boxShadow: focused ? "0 0 0 4px rgba(168, 85, 247, 0.1)" : "none"
                }}
            />
        </div>
    );
};

export default Login;
