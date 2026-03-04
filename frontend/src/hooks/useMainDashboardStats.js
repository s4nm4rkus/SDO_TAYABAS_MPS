import { useState, useEffect } from "react";
import axios from "axios";

const useMainDashboardStats = () => {
  const [clusterCount, setClusterCount] = useState(0);
  const [schoolCount, setSchoolCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clusters, schools] = await Promise.all([
          axios.get("http://localhost:5000/api/clusters"),
          axios.get("http://localhost:5000/api/schools"),
        ]);

        setClusterCount(clusters.data.length);
        setSchoolCount(schools.data.length);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { clusterCount, schoolCount, loading };
};

export default useMainDashboardStats;
