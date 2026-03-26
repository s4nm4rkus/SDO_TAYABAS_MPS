import { useState, useEffect } from "react";
import axios from "axios";

const useMainDashboardStats = () => {
  const [clusterCount, setClusterCount] = useState(0);
  const [schoolCount, setSchoolCount] = useState(0);
  const [teacherCount, setTeacherCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/dashboard-stats",
        );
        const { clusterCount, schoolCount, teacherCount, studentCount } =
          res.data.stats;

        setClusterCount(clusterCount || 0);
        setSchoolCount(schoolCount || 0);
        setTeacherCount(teacherCount || 0);
        setStudentCount(studentCount || 0);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { clusterCount, schoolCount, teacherCount, studentCount, loading };
};

export default useMainDashboardStats;
