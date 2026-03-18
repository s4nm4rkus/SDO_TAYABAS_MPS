import { X, UserCheck, UserX } from "lucide-react";

const AssignAdviserModal = ({ section, teachers, onClose, onAssign }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
        style={{ border: "1px solid rgba(0,151,178,0.15)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-base font-black text-[#242424]">
              Assign Adviser
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Select a teacher for{" "}
              <span className="font-semibold" style={{ color: "#0097b2" }}>
                {section?.section_name}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Section Info */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
          style={{
            background: "rgba(0,151,178,0.06)",
            border: "1px solid rgba(0,151,178,0.15)",
          }}
        >
          <span className="text-xs text-gray-500">Grade Level:</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{ background: "linear-gradient(135deg, #0097b2, #004385)" }}
          >
            {section?.grade_name}
          </span>
        </div>

        {/* Teachers List */}
        <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
          {teachers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <UserX size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No available teachers.</p>
            </div>
          ) : (
            teachers.map((teacher) => (
              <button
                key={teacher.id}
                onClick={() => !teacher.is_assigned && onAssign(teacher.id)}
                disabled={teacher.is_assigned}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group"
                style={
                  teacher.is_assigned
                    ? {
                        background: "rgba(0,0,0,0.03)",
                        border: "1px solid rgba(0,0,0,0.06)",
                        cursor: "not-allowed",
                        opacity: 0.5,
                      }
                    : {
                        background: "rgba(248,248,255,0.8)",
                        border: "1px solid rgba(0,151,178,0.15)",
                      }
                }
                onMouseEnter={(e) => {
                  if (!teacher.is_assigned)
                    e.currentTarget.style.borderColor = "#0097b2";
                }}
                onMouseLeave={(e) => {
                  if (!teacher.is_assigned)
                    e.currentTarget.style.borderColor = "rgba(0,151,178,0.15)";
                }}
              >
                {/* Avatar */}
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{
                    background: teacher.is_assigned
                      ? "#9ca3af"
                      : "linear-gradient(135deg, #0097b2, #004385)",
                  }}
                >
                  {teacher.fullname?.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#242424] leading-none">
                    {teacher.fullname}
                  </p>
                  {teacher.is_assigned ? (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Assigned to {teacher.assigned_section}
                    </p>
                  ) : (
                    <p className="text-xs mt-0.5" style={{ color: "#0097b2" }}>
                      Available
                    </p>
                  )}
                </div>

                {/* Status Icon */}
                {teacher.is_assigned ? (
                  <UserCheck size={14} className="text-gray-400 shrink-0" />
                ) : (
                  <UserCheck
                    size={14}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition"
                    style={{ color: "#0097b2" }}
                  />
                )}
              </button>
            ))
          )}
        </div>

        {/* Close */}
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignAdviserModal;
