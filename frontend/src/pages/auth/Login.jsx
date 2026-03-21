import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getCurrentUser } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff, LogIn } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return setError("Please fill in all fields.");
    setError("");
    setLoading(true);
    try {
      const data = await loginUser({ username, password });
      login(data.token);
      const userData = await getCurrentUser();
      setUser(userData);
      if (userData.role === "admin") navigate("/admin");
      else if (userData.role === "school_head") navigate("/school-head");
      else if (userData.role === "supervisor") navigate("/supervisor");
      else navigate("/teacher");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes blobFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }

        @keyframes blobFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 20px) scale(1.08); }
          66% { transform: translate(20px, -15px) scale(0.95); }
        }

        @keyframes dotFade {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.5); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes slideRight {
          0% { transform: translateX(-100%); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(100vw); opacity: 0; }
        }

        .login-card {
          animation: fadeInUp 0.6s ease forwards;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0,151,178,0.15);
        }

        .dot-grid {
          background-image: radial-gradient(circle, rgba(0,151,178,0.15) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .blob-1 {
          width: 600px;
          height: 600px;
          top: -15%;
          left: -15%;
          background: radial-gradient(circle, rgba(0,151,178,0.12), transparent 70%);
          animation: blobFloat1 14s ease-in-out infinite;
        }

        .blob-2 {
          width: 500px;
          height: 500px;
          bottom: -10%;
          right: -10%;
          background: radial-gradient(circle, rgba(0,67,133,0.1), transparent 70%);
          animation: blobFloat2 16s ease-in-out 2s infinite;
        }

        .blob-3 {
          width: 350px;
          height: 350px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle, rgba(0,180,216,0.08), transparent 70%);
          animation: blobFloat1 10s ease-in-out 4s infinite;
        }

        .dot {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: rgba(0,151,178,0.35);
          animation: dotFade ease-in-out infinite;
          pointer-events: none;
        }

        .dot:nth-child(1)  { top: 8%;  left: 5%;  animation-duration: 3s;   animation-delay: 0s;   }
        .dot:nth-child(2)  { top: 18%; left: 88%; animation-duration: 4s;   animation-delay: 0.5s; }
        .dot:nth-child(3)  { top: 32%; left: 12%; animation-duration: 5s;   animation-delay: 1s;   }
        .dot:nth-child(4)  { top: 48%; left: 78%; animation-duration: 3.5s; animation-delay: 1.5s; }
        .dot:nth-child(5)  { top: 63%; left: 22%; animation-duration: 4.5s; animation-delay: 2s;   }
        .dot:nth-child(6)  { top: 74%; left: 68%; animation-duration: 3s;   animation-delay: 0.8s; }
        .dot:nth-child(7)  { top: 83%; left: 38%; animation-duration: 5s;   animation-delay: 1.2s; }
        .dot:nth-child(8)  { top: 12%; left: 52%; animation-duration: 4s;   animation-delay: 2.5s; }

        .line-accent {
          position: absolute;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,151,178,0.2), transparent);
          pointer-events: none;
          animation: slideRight ease-in-out infinite;
        }

        .line-accent:nth-child(1) { top: 20%; width: 300px; animation-duration: 9s;  animation-delay: 0s;   }
        .line-accent:nth-child(2) { top: 55%; width: 200px; animation-duration: 11s; animation-delay: 3.5s; }
        .line-accent:nth-child(3) { top: 80%; width: 250px; animation-duration: 8s;  animation-delay: 6s;   }

        .login-input {
          background: rgba(248,248,255,0.8);
          border: 1px solid rgba(0,151,178,0.2);
          color: #242424;
          transition: all 0.3s ease;
          width: 100%;
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
        }

        .login-input::placeholder {
          color: rgba(36,36,36,0.35);
        }

        .login-input:focus {
          background: white;
          border-color: #0097b2;
          outline: none;
          box-shadow: 0 0 0 3px rgba(0,151,178,0.1);
        }

        .shimmer-title {
          background: linear-gradient(
            90deg,
            #242424 0%,
            #242424 35%,
            #888888 50%,
            #242424 65%,
            #242424 100%
          );
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <div
        className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: "#f8f8ff" }}
      >
        {/* Dot Grid */}
        <div className="dot-grid absolute inset-0 pointer-events-none" />

        {/* Blobs */}
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />

        {/* Pulsing Dots */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="dot" />
          ))}
        </div>

        {/* Sliding Lines */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="line-accent" />
          <div className="line-accent" />
          <div className="line-accent" />
        </div>

        {/* Corner Glows */}
        <div
          className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top left, rgba(0,151,178,0.08), transparent 70%)",
          }}
        />
        <div
          className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at bottom right, rgba(0,67,133,0.06), transparent 70%)",
          }}
        />

        {/* Login Card */}
        <div className="login-card rounded-3xl p-8 w-full max-w-md mx-4 relative z-10 shadow-xl">
          {/* Header */}
          {/* Logo / Icon */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-24 h-24 mb-1">
              <svg viewBox="0 0 120 90" className="w-full h-full">
                {/* Grid Lines */}
                {[0, 1, 2, 3].map((i) => (
                  <line
                    key={i}
                    x1="10"
                    y1={10 + i * 18}
                    x2="115"
                    y2={10 + i * 18}
                    stroke="rgba(0,0,0,0.06)"
                    strokeWidth="0.5"
                  />
                ))}
                {/* Bars */}
                {[
                  { x: 18, h: 45, color: "#0097b2" },
                  { x: 34, h: 60, color: "#8b5cf6" },
                  { x: 50, h: 35, color: "#f97316" },
                  { x: 66, h: 70, color: "#ec4899" },
                  { x: 82, h: 50, color: "#10b981" },
                  { x: 98, h: 55, color: "#f59e0b" },
                ].map((bar, i) => (
                  <rect
                    key={i}
                    x={bar.x}
                    y={80 - bar.h}
                    width="10"
                    height={bar.h}
                    rx="3"
                    fill={bar.color}
                    opacity="0.9"
                  />
                ))}
                {/* X Axis */}
                <line
                  x1="10"
                  y1="80"
                  x2="115"
                  y2="80"
                  stroke="rgba(0,0,0,0.1)"
                  strokeWidth="1"
                />
              </svg>
            </div>
            <h1 className="shimmer-title text-2xl font-black">TAYABAS MPS</h1>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="h-px w-8 rounded-full"
                style={{ background: "#0097b2" }}
              />
              <p className="text-xs font-medium" style={{ color: "#0097b2" }}>
                Schools Division of Tayabas City
              </p>
              <div
                className="h-px w-8 rounded-full"
                style={{ background: "#0097b2" }}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.3)",
                color: "#dc2626",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label
                className="text-xs font-semibold mb-1.5 block uppercase tracking-wider"
                style={{ color: "#0097b2" }}
              >
                Username
              </label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                className="login-input"
              />
            </div>

            {/* Password */}
            <div>
              <label
                className="text-xs font-semibold mb-1.5 block uppercase tracking-wider"
                style={{ color: "#0097b2" }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onKeyDown={handleKeyDown}
                  className="login-input"
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                  style={{ color: "rgba(0,151,178,0.6)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "#0097b2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "rgba(0,151,178,0.6)")
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-3 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 mt-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: "#0097b2",
              }}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <p
            className="text-center text-xs mt-8"
            style={{ color: "rgba(36,36,36,0.4)" }}
          >
            © {new Date().getFullYear()} DepEd Tayabas City Division
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
