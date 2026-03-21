import SchoolManagementCards from "../../../components/common/cards/admin/SchoolManagementCards";
import useMainDashboardStats from "../../../hooks/useMainDashboardStats";
import { Building2, School, AlertCircle } from "lucide-react";

const SchoolManagement = () => {
  const { clusterCount, schoolCount, loading } = useMainDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">
            School Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage clusters and schools across Tayabas City Division
          </p>
        </div>
        <div className="flex gap-3">
          {[
            {
              label: "Clusters",
              value: loading ? "..." : clusterCount,
              icon: <Building2 size={18} className="text-white" />,
              bg: "linear-gradient(135deg, #0097b2, #00b4d8)",
              shadow: "rgba(0,151,178,0.35)",
            },
            {
              label: "Schools",
              value: loading ? "..." : schoolCount,
              icon: <School size={18} className="text-white" />,
              bg: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
              shadow: "rgba(139,92,246,0.35)",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background: item.bg,
                boxShadow: `0 6px 18px ${item.shadow}`,
              }}
            >
              <div className="p-1.5 rounded-lg bg-white/20">{item.icon}</div>
              <div>
                <p className="text-xl font-black text-white leading-none">
                  {item.value}
                </p>
                <p className="text-xs text-white/80 tracking-wider uppercase mt-0.5">
                  {item.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="h-px w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      <SchoolManagementCards />
    </div>
  );
};

export default SchoolManagement;
