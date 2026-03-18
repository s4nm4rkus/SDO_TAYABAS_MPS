import { BookOpen, Users, UserCheck, UserX } from "lucide-react";

const SectionHeader = ({ sections, loading }) => {
  const total = sections.length;
  const assigned = sections.filter((s) => s.adviser_id).length;
  const unassigned = total - assigned;

  const cards = [
    {
      label: "Total Sections",
      value: loading ? "..." : total,
      icon: <BookOpen size={18} className="text-white" />,
      bg: "linear-gradient(135deg, #0097b2, #004385)",
      shadow: "rgba(0,151,178,0.35)",
    },
    {
      label: "Assigned",
      value: loading ? "..." : assigned,
      icon: <UserCheck size={18} className="text-white" />,
      bg: "linear-gradient(135deg, #10b981, #059669)",
      shadow: "rgba(16,185,129,0.35)",
    },
    {
      label: "Unassigned",
      value: loading ? "..." : unassigned,
      icon: <UserX size={18} className="text-white" />,
      bg: "linear-gradient(135deg, #f97316, #fb923c)",
      shadow: "rgba(249,115,22,0.35)",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-[#242424]">
          Section Management
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Manage sections and assign advisers for the active school year
        </p>
      </div>

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
  );
};

export default SectionHeader;
