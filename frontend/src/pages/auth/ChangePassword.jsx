import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { getCurrentUser } from "../../services/authService";
import axios from "axios";

const ChangePassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const forced = location.state?.forced || false;
  const { login, setUser } = useAuth();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError("");
    if (!currentPassword || !newPassword || !confirmPassword)
      return setError("Please fill in all fields.");
    if (newPassword.length < 8)
      return setError("New password must be at least 8 characters.");
    if (newPassword !== confirmPassword)
      return setError("New passwords do not match.");

    setLoading(true);
    try {
      const res = await axios.put(
        "http://localhost:5000/api/auth/change-password",
        { currentPassword, newPassword },
        { headers },
      );
      login(res.data.token); // refresh stored token with cleared flag
      setSuccess("Password changed successfully.");

      const userData = await getCurrentUser();
      setUser(userData);
      setTimeout(() => {
        if (userData.role === "admin") navigate("/admin", { replace: true });
        else if (userData.role === "school_head")
          navigate("/school-head", { replace: true });
        else if (userData.role === "supervisor")
          navigate("/supervisor", { replace: true });
        else navigate("/teacher", { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ backgroundColor: "#f8f8ff" }}
    >
      <div
        className="rounded-3xl p-8 w-full max-w-md mx-4 shadow-xl"
        style={{
          background: "rgba(255,255,255,0.9)",
          border: "1px solid rgba(0,151,178,0.15)",
        }}
      >
        <div className="flex flex-col items-center mb-6">
          <div
            className="p-3 rounded-2xl mb-3"
            style={{ background: "linear-gradient(135deg, #0097b2, #004385)" }}
          >
            <KeyRound size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-black text-[#242424]">
            {forced ? "Set a New Password" : "Change Password"}
          </h1>
          {forced && (
            <p className="text-xs text-gray-400 mt-1 text-center">
              You must set a new password before continuing.
            </p>
          )}
        </div>

        {error && (
          <div
            className="mb-4 p-3 rounded-xl text-sm"
            style={{
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#dc2626",
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className="mb-4 p-3 rounded-xl text-sm"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#059669",
            }}
          >
            {success}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {[
            {
              label: forced ? "Temporary Password" : "Current Password",
              value: currentPassword,
              setter: setCurrentPassword,
            },
            {
              label: "New Password",
              value: newPassword,
              setter: setNewPassword,
            },
            {
              label: "Confirm New Password",
              value: confirmPassword,
              setter: setConfirmPassword,
            },
          ].map((field, i) => (
            <div key={i}>
              <label
                className="text-xs font-semibold mb-1.5 block uppercase tracking-wider"
                style={{ color: "#0097b2" }}
              >
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={field.value}
                  onChange={(e) => field.setter(e.target.value)}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                    paddingRight: "2.75rem",
                  }}
                />
                {i === 0 && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(0,151,178,0.6)" }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3 text-white text-sm font-semibold rounded-xl mt-2 transition hover:opacity-90 disabled:opacity-50"
            style={{ background: "#0097b2" }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          {!forced && (
            <button
              onClick={() => navigate(-1)}
              className="text-xs text-gray-400 hover:text-gray-600 mt-1"
            >
              Cancel and go back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
