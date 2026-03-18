import { X } from "lucide-react";

const SectionModal = ({
  mode,
  form,
  setForm,
  gradeLevels,
  assignedSchools,
  onClose,
  onSubmit,
}) => {
  const isEdit = mode === "edit";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
        style={{ border: "1px solid rgba(0,151,178,0.15)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-base font-black text-[#242424]">
              {isEdit ? "Edit Section" : "Add New Section"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit
                ? "Update section details"
                : "Create a new section for the active school year"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 transition p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-4">
          {/* School selector — only show if multiple schools and adding */}
          {!isEdit && assignedSchools?.length > 1 && (
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                style={{ color: "#0097b2" }}
              >
                School
              </label>
              <select
                value={form.school_id || ""}
                onChange={(e) =>
                  setForm({ ...form, school_id: e.target.value })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424] transition"
                style={{
                  background: "rgba(248,248,255,0.8)",
                  border: "1px solid rgba(0,151,178,0.2)",
                }}
              >
                <option value="">Select School</option>
                {assignedSchools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.school_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Section Name */}
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
              style={{ color: "#0097b2" }}
            >
              Section Name
            </label>
            <input
              type="text"
              placeholder="e.g. Rizal, Bonifacio, Mabini"
              value={form.section_name}
              onChange={(e) =>
                setForm({ ...form, section_name: e.target.value })
              }
              className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424] transition"
              style={{
                background: "rgba(248,248,255,0.8)",
                border: "1px solid rgba(0,151,178,0.2)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0097b2")}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(0,151,178,0.2)")
              }
            />
          </div>

          {/* Grade Level */}
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
              style={{ color: "#0097b2" }}
            >
              Grade Level
            </label>
            <select
              value={form.grade_level_id}
              onChange={(e) =>
                setForm({ ...form, grade_level_id: e.target.value })
              }
              className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424] transition"
              style={{
                background: "rgba(248,248,255,0.8)",
                border: "1px solid rgba(0,151,178,0.2)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0097b2")}
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(0,151,178,0.2)")
              }
            >
              <option value="">Select Grade Level</option>
              {gradeLevels.map((gl) => (
                <option key={gl.id} value={gl.id}>
                  {gl.grade_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #0097b2, #004385)",
              boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
            }}
          >
            {isEdit ? "Save Changes" : "Add Section"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionModal;
