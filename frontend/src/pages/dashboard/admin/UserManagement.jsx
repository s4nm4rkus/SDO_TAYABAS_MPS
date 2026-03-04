import UserTable from "../../../components/common/tables/admin/UserTable";
import useUserStats from "../../../hooks/useUserStats";
import { Users, ShieldCheck, Eye, School, GraduationCap } from "lucide-react";

const UserManagement = () => {
  const { stats, loading } = useUserStats();

  const cards = [
    {
      label: "Total Users",
      value: loading ? "..." : stats.total,
      icon: <Users size={18} className="text-white" />,
      bg: "linear-gradient(135deg, #0097b2, #004385)",
      shadow: "rgba(0,151,178,0.35)",
    },
    {
      label: "Supervisors",
      value: loading ? "..." : stats.supervisor,
      icon: <Eye size={18} className="text-white" />,
      bg: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
      shadow: "rgba(139,92,246,0.35)",
    },
    {
      label: "School Heads",
      value: loading ? "..." : stats.school_head,
      icon: <School size={18} className="text-white" />,
      bg: "linear-gradient(135deg, #f97316, #fb923c)",
      shadow: "rgba(249,115,22,0.35)",
    },
    {
      label: "Teachers",
      value: loading ? "..." : stats.teacher,
      icon: <GraduationCap size={18} className="text-white" />,
      bg: "linear-gradient(135deg, #ec4899, #f472b6)",
      shadow: "rgba(236,72,153,0.35)",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">
            User Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Create, edit, and manage system users
          </p>
        </div>

        {/* Stat Cards */}
        <div className="flex flex-wrap gap-3">
          {cards.map((item, i) => (
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

      {/* Divider */}
      <div
        className="h-px w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      {/* Table */}
      <UserTable />
    </div>
  );
};

export default UserManagement;
