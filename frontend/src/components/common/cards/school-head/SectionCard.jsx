import { Pencil, Trash2, UserCheck, UserX } from "lucide-react";

const cardColors = [
  {
    bg: "linear-gradient(135deg, #0097b2, #00b4d8)",
    shadow: "rgba(0,151,178,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    shadow: "rgba(139,92,246,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #f97316, #fb923c)",
    shadow: "rgba(249,115,22,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #ec4899, #f472b6)",
    shadow: "rgba(236,72,153,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #10b981, #34d399)",
    shadow: "rgba(16,185,129,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #f59e0b, #fbbf24)",
    shadow: "rgba(245,158,11,0.35)",
  },
];

const SectionCard = ({ section, index, onEdit, onDelete, onAssign }) => {
  const color = cardColors[index % cardColors.length];
  const hasAdviser = !!section.adviser_id;

  return (
    <div
      className="relative group rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      style={{
        background: color.bg,
        boxShadow: `0 6px 18px ${color.shadow}`,
      }}
    >
      {/* Action Buttons */}
      <div className="absolute top-3 right-3 hidden group-hover:flex gap-1.5 z-10">
        <button
          onClick={() => onEdit(section)}
          className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 transition"
        >
          <Pencil size={12} className="text-white" />
        </button>
        <button
          onClick={() => onDelete(section)}
          className="p-1.5 rounded-lg bg-white/20 hover:bg-red-400/60 transition"
        >
          <Trash2 size={12} className="text-white" />
        </button>
      </div>

      {/* Grade Level Badge */}
      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 text-white mb-3 inline-block">
        {section.grade_name}
      </span>

      {/* Section Name */}
      <h3 className="text-base font-black text-white mb-3 truncate pr-10">
        {section.section_name}
      </h3>

      {/* Divider */}
      <div className="h-px w-full mb-3 rounded-full bg-white/20" />

      {/* Adviser */}
      {hasAdviser ? (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white/25 text-white text-xs font-bold shrink-0">
            {section.adviser_name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-semibold text-white leading-none">
              {section.adviser_name}
            </p>
            <p className="text-xs text-white/70 mt-0.5">Adviser</p>
          </div>
          <UserCheck size={14} className="ml-auto text-white/80" />
        </div>
      ) : (
        <button
          onClick={() => onAssign(section)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200 hover:bg-white/30"
          style={{
            background: "rgba(255,255,255,0.15)",
            border: "1px dashed rgba(255,255,255,0.4)",
            color: "white",
          }}
        >
          <UserX size={13} />
          Assign Adviser
        </button>
      )}
    </div>
  );
};

export default SectionCard;
