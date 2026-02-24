import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../hooks/useAuth";
import { getCurrentUser } from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const { login, setUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const data = await loginUser({ username, password });

      login(data.token);

      const userData = await getCurrentUser();
      setUser(userData);

      if (userData.role === "admin") navigate("/admin");
      else navigate("/teacher");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-whiteBg">
      <div className="flex flex-col py-8 px-12 w-[30%] rounded-xl shadow-xl text-center bg-white">
        <h2 className="text-2xl font-bold mb-6">Login</h2>

        {error && <p className="text-red-500">{error}</p>}

        <input
          className="p-3 my-4 bg-neutral-100 border-b-2"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="p-3 mb-6 bg-neutral-100 border-b-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="px-6 py-3 bg-blue-600 text-white text-lg rounded hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
