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
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes float1 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(-30px) translateX(20px) scale(1.05); }
          66% { transform: translateY(20px) translateX(-15px) scale(0.95); }
        }

        @keyframes float2 {
          0%, 100% { transform: translateY(0px) translateX(0px) scale(1); }
          33% { transform: translateY(25px) translateX(-20px) scale(1.08); }
          66% { transform: translateY(-20px) translateX(15px) scale(0.92); }
        }

        @keyframes float3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-40px) translateX(30px); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .gradient-bg {
          background: linear-gradient(-45deg, #1e3a8a, #3b82f6, #6366f1, #8b5cf6, #1e40af);
          background-size: 400% 400%;
          animation: gradientShift 8s ease infinite;
        }

        .blob1 {
          animation: float1 8s ease-in-out infinite;
        }

        .blob2 {
          animation: float2 10s ease-in-out infinite;
        }

        .blob3 {
          animation: float3 12s ease-in-out infinite;
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          animation: fadeInUp 0.6s ease forwards;
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          transition: all 0.3s ease;
        }

        .glass-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .glass-input:focus {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.6);
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .glass-btn {
          background: rgba(255, 255, 255, 0.25);
          border: 1px solid rgba(255, 255, 255, 0.4);
          transition: all 0.3s ease;
        }

        .glass-btn:hover {
          background: rgba(255, 255, 255, 0.35);
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .glass-btn:active {
          transform: translateY(0px);
        }
      `}</style>

      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden gradient-bg">
        {/* Animated Blobs */}
        <div
          className="blob1 absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #60a5fa, #818cf8)" }}
        />
        <div
          className="blob2 absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, #a78bfa, #3b82f6)" }}
        />
        <div
          className="blob3 absolute top-[40%] right-[20%] w-64 h-64 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #93c5fd, #6366f1)" }}
        />
        <div
          className="blob1 absolute bottom-[20%] left-[15%] w-48 h-48 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #c4b5fd, #60a5fa)" }}
        />

        {/* Glass Card */}
        <div className="glass-card rounded-3xl p-8 w-full max-w-md mx-4 relative z-10">
          {/* Logo / Icon */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <LogIn size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">MPS System</h1>
            <p className="text-blue-200 text-sm mt-1 text-center">
              Schools Division of Tayabas City
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="mb-4 p-3 rounded-xl flex items-center gap-2 text-sm text-white"
              style={{
                background: "rgba(239,68,68,0.3)",
                border: "1px solid rgba(239,68,68,0.5)",
              }}
            >
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <div className="flex flex-col gap-4">
            {/* Username */}
            <div>
              <label className="text-xs font-semibold text-blue-100 mb-1.5 block uppercase tracking-wider">
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
                className="glass-input w-full rounded-xl px-4 py-3 text-sm"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold text-blue-100 mb-1.5 block uppercase tracking-wider">
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
                  className="glass-input w-full rounded-xl px-4 py-3 text-sm pr-11"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="glass-btn w-full py-3 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="text-center text-xs text-blue-300 mt-8">
            © {new Date().getFullYear()} DepEd Tayabas City Division
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
