import { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  PlusCircle,
  X,
  GraduationCap,
  BookOpen,
  CheckSquare,
  Square,
} from "lucide-react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/grade-levels`;
const SUBJECTS_API = `${import.meta.env.VITE_API_URL}/api/subjects`;

const gradeColors = [
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
  {
    bg: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    shadow: "rgba(59,130,246,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #ef4444, #f87171)",
    shadow: "rgba(239,68,68,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #14b8a6, #2dd4bf)",
    shadow: "rgba(20,184,166,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #a855f7, #c084fc)",
    shadow: "rgba(168,85,247,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #84cc16, #a3e635)",
    shadow: "rgba(132,204,22,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #f43f5e, #fb7185)",
    shadow: "rgba(244,63,94,0.35)",
  },
];

const GradeLevelCard = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [gradeLevels, setGradeLevels] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ grade_name: "", subject_ids: [] });
  const [expandedId, setExpandedId] = useState(null);

  const fetchGradeLevels = async () => {
    try {
      const res = await axios.get(API, { headers });
      setGradeLevels(res.data);
    } catch {
      setGradeLevels([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(SUBJECTS_API, { headers });
      setAllSubjects(res.data);
    } catch {
      setAllSubjects([]);
    }
  };

  useEffect(() => {
    fetchGradeLevels();
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ grade_name: "", subject_ids: [] });
  };

  const openAdd = () => {
    setForm({ grade_name: "", subject_ids: [] });
    setModal("add");
  };

  const openEdit = (grade) => {
    setSelected(grade);
    setForm({
      grade_name: grade.grade_name,
      subject_ids: (grade.subjects || []).map((s) => String(s.id)),
    });
    setModal("edit");
  };

  const openDelete = (grade) => {
    setSelected(grade);
    setModal("delete");
  };

  const toggleSubject = (subjectId) => {
    const id = String(subjectId);
    const current = form.subject_ids || [];
    const updated = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    setForm({ ...form, subject_ids: updated });
  };

  const handleAdd = async () => {
    if (!form.grade_name) return alert("Grade name is required.");
    try {
      await axios.post(API, form, { headers });
      await fetchGradeLevels();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = async () => {
    if (!form.grade_name) return alert("Grade name is required.");
    try {
      await axios.put(`${API}/${selected.id}`, form, { headers });
      await fetchGradeLevels();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/${selected.id}`, { headers });
      await fetchGradeLevels();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "white", border: "1px solid rgba(0,151,178,0.1)" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h2 className="text-base font-black text-[#242424]">Grade Levels</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {gradeLevels.length} grade levels
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl transition hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #0097b2, #004385)",
            boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
          }}
        >
          <PlusCircle size={15} />
          Add Grade Level
        </button>
      </div>

      {/* Divider */}
      <div
        className="h-px w-full rounded-full mb-5"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      {/* Cards */}
      {loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse text-sm">
          Loading...
        </div>
      ) : gradeLevels.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <GraduationCap size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No grade levels found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {gradeLevels.map((grade, index) => {
            const color = gradeColors[index % gradeColors.length];
            const isExpanded = expandedId === grade.id;
            const subjects = grade.subjects || [];

            return (
              <div
                key={grade.id}
                className="rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: color.bg,
                  boxShadow: `0 6px 18px ${color.shadow}`,
                }}
              >
                {/* Top Row */}
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
                    Level {index + 1}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(grade)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 transition"
                    >
                      <Pencil size={11} className="text-white" />
                    </button>
                    <button
                      onClick={() => openDelete(grade)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-red-400/50 transition"
                    >
                      <Trash2 size={11} className="text-white" />
                    </button>
                  </div>
                </div>

                {/* Grade Name */}
                <h3 className="text-base font-black text-white mb-1">
                  {grade.grade_name}
                </h3>

                {/* Subject Count */}
                <p className="text-xs text-white/70 mb-2">
                  {subjects.length}{" "}
                  {subjects.length === 1 ? "subject" : "subjects"}
                </p>

                {/* Divider */}
                <div className="h-px w-full bg-white/20 mb-2" />

                {/* Subjects Toggle */}
                {subjects.length > 0 && (
                  <>
                    <button
                      onClick={() =>
                        setExpandedId(isExpanded ? null : grade.id)
                      }
                      className="text-xs text-white/80 hover:text-white transition flex items-center gap-1 mb-2"
                    >
                      <BookOpen size={11} />
                      {isExpanded ? "Hide subjects" : "View subjects"}
                    </button>

                    {isExpanded && (
                      <div className="flex flex-wrap gap-1">
                        {subjects.map((s) => (
                          <span
                            key={s.id}
                            className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white"
                          >
                            {s.subject_code}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-black text-[#242424]">
                  {modal === "add" ? "Add Grade Level" : "Edit Grade Level"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {modal === "add"
                    ? "Create a new grade level and assign subjects"
                    : "Update grade level and subjects"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Grade Name */}
            <div className="mb-4">
              <label
                className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                style={{ color: "#0097b2" }}
              >
                Grade Name
              </label>
              <input
                type="text"
                placeholder="e.g. Grade 7"
                value={form.grade_name}
                onChange={(e) =>
                  setForm({ ...form, grade_name: e.target.value })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                style={{
                  background: "rgba(248,248,255,0.8)",
                  border: "1px solid rgba(0,151,178,0.2)",
                }}
              />
            </div>

            {/* Subjects */}
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                style={{ color: "#0097b2" }}
              >
                Assign Subjects
                <span className="ml-1 text-gray-400 normal-case font-normal">
                  ({(form.subject_ids || []).length} selected)
                </span>
              </label>

              {allSubjects.length === 0 ? (
                <p className="text-xs text-gray-400 py-3">
                  No subjects available. Add subjects first.
                </p>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1">
                  {allSubjects.map((s) => {
                    const isSelected = (form.subject_ids || []).includes(
                      String(s.id),
                    );
                    return (
                      <button
                        key={s.id}
                        onClick={() => toggleSubject(s.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition"
                        style={{
                          background: isSelected
                            ? "rgba(0,151,178,0.08)"
                            : "rgba(248,248,255,0.8)",
                          border: `1px solid ${isSelected ? "rgba(0,151,178,0.3)" : "rgba(0,0,0,0.08)"}`,
                          color: isSelected ? "#0097b2" : "#242424",
                        }}
                      >
                        {isSelected ? (
                          <CheckSquare size={14} style={{ color: "#0097b2" }} />
                        ) : (
                          <Square size={14} className="text-gray-300" />
                        )}
                        <span className="flex-1">{s.subject_name}</span>
                        <span className="text-xs text-gray-400">
                          {s.subject_code}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={modal === "add" ? handleAdd : handleEdit}
                className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                {modal === "add" ? "Add Grade Level" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-black text-[#242424]">
                Delete Grade Level
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              You are about to permanently delete:
            </p>
            <p className="font-bold text-[#242424] mb-1">
              {selected?.grade_name}
            </p>
            <p className="text-xs text-gray-400 mb-1">
              This will also remove all subject assignments for this grade
              level.
            </p>
            <p className="text-sm text-red-500 mb-5 mt-2">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeLevelCard;
