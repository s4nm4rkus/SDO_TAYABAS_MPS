import { useState, useEffect } from "react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/users`;

const useUserStats = () => {
  const [stats, setStats] = useState({
    total: 0,
    admin: 0,
    supervisor: 0,
    school_head: 0,
    teacher: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const res = await axios.get(API, { headers });
        const users = res.data;

        setStats({
          total: users.length,
          admin: users.filter((u) => u.role === "admin").length,
          supervisor: users.filter((u) => u.role === "supervisor").length,
          school_head: users.filter((u) => u.role === "school_head").length,
          teacher: users.filter((u) => u.role === "teacher").length,
        });
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { stats, loading };
};

export default useUserStats;
