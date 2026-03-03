import { useState, useEffect } from "react";
import { Pencil, Trash2, PlusCircle, X, GraduationCap } from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api/grade-levels";

const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

const gradeColors = [
  {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100",
  },
  {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    badge: "bg-green-100",
  },
  {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
    badge: "bg-orange-100",
  },
  {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
    badge: "bg-purple-100",
  },
  {
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
    badge: "bg-pink-100",
  },
  {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    badge: "bg-teal-100",
  },
  {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    badge: "bg-yellow-100",
  },
  {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    badge: "bg-red-100",
  },
  {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    badge: "bg-indigo-100",
  },
  {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    badge: "bg-cyan-100",
  },
  {
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
    badge: "bg-rose-100",
  },
  {
    bg: "bg-lime-50",
    border: "border-lime-200",
    text: "text-lime-700",
    badge: "bg-lime-100",
  },
];

const GradeLevelCard = () => {
  const [gradeLevels, setGradeLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ grade_name: "" });
  const [confirm, setConfirm] = useState(false);

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

  useEffect(() => {
    fetchGradeLevels();
  }, []);

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ grade_name: "" });
    setConfirm(false);
  };

  const openEdit = (grade) => {
    setSelected(grade);
    setForm({ grade_name: grade.grade_name });
    setModal("edit");
  };

  const openDelete = (grade) => {
    setSelected(grade);
    setModal("delete");
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
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Grade Levels</h2>
          <p className="text-xs text-gray-400">
            {gradeLevels.length} grade levels
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          <PlusCircle size={16} />
          Add Grade Level
        </button>
      </div>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse text-sm">
          Loading...
        </div>
      ) : gradeLevels.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <GraduationCap size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No grade levels found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
          {gradeLevels.map((grade, index) => {
            const color = gradeColors[index % gradeColors.length];
            return (
              <div
                key={grade.id}
                className={`rounded-lg border ${color.border} ${color.bg} p-4 flex flex-col gap-3`}
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full ${color.badge} ${color.text}`}
                  >
                    Level {index + 1}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(grade)}
                      className="p-1 rounded hover:bg-white/60 transition"
                      title="Edit"
                    >
                      <Pencil size={14} className={color.text} />
                    </button>
                    <button
                      onClick={() => openDelete(grade)}
                      className="p-1 rounded hover:bg-white/60 transition"
                      title="Delete"
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className={`text-base font-bold ${color.text}`}>
                    {grade.grade_name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Modal */}
      {modal === "add" && (
        <ModalWrapper title="Add Grade Level" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">
            Enter the new grade level name.
          </p>
          <GradeForm form={form} setForm={setForm} />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Edit Modal */}
      {modal === "edit" && (
        <ModalWrapper title="Edit Grade Level" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">Update this grade level.</p>
          <GradeForm form={form} setForm={setForm} />
          {!confirm ? (
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setConfirm(true)}
                className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800">
              <p className="mb-2 font-medium">
                Are you sure you want to save these changes?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirm(false)}
                  className="px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Yes, Save
                </button>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <ModalWrapper title="Delete Grade Level" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-2">
            You are about to permanently delete:
          </p>
          <p className="font-semibold text-gray-800 mb-4">
            {selected?.grade_name}
          </p>
          <p className="text-sm text-red-500 mb-4">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
            >
              Yes, Delete
            </button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

const GradeForm = ({ form, setForm }) => (
  <div>
    <label className="text-xs text-gray-500 mb-1 block">Grade Name</label>
    <input
      type="text"
      placeholder="e.g. Grade 7"
      value={form.grade_name}
      onChange={(e) => setForm({ ...form, grade_name: e.target.value })}
      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>
);

const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="bg-white text-gray-800 rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold">{title}</h2>
        <button onClick={onClose} className="hover:text-red-500 transition">
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default GradeLevelCard;
