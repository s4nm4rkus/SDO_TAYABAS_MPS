import { useState, useEffect } from "react";
import { Pencil, Trash2, PlusCircle, X, BookOpen } from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api/grading-periods";
const SCHOOL_YEARS_API = "http://localhost:5000/api/school-years";

const quarterColors = [
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
];

const GradingPeriodCard = () => {
  const [periods, setPeriods] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ period_name: "", order_num: "" });
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // Fetch all school years for dropdown
  const fetchSchoolYears = async () => {
    try {
      const res = await axios.get(SCHOOL_YEARS_API);
      setSchoolYears(res.data);
      // Default to active school year
      const active = res.data.find((y) => y.is_active);
      if (active) setSelectedYearId(active.id);
    } catch {
      setSchoolYears([]);
    }
  };

  // Fetch periods for selected school year
  const fetchPeriods = async (yearId) => {
    if (!yearId) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API}/by-year/${yearId}`);
      setPeriods(res.data);
    } catch {
      setPeriods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolYears();
  }, []);
  useEffect(() => {
    fetchPeriods(selectedYearId);
  }, [selectedYearId]);

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ period_name: "", order_num: "" });
    setConfirm(false);
  };

  const openEdit = (period) => {
    setSelected(period);
    setForm({ period_name: period.period_name, order_num: period.order_num });
    setModal("edit");
  };

  const openDelete = (period) => {
    setSelected(period);
    setModal("delete");
  };

  const handleAdd = async () => {
    if (!form.period_name || !form.order_num)
      return alert("All fields are required.");
    try {
      await axios.post(
        API,
        { ...form, school_year_id: selectedYearId },
        { headers },
      );
      await fetchPeriods(selectedYearId);
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = async () => {
    if (!form.period_name || !form.order_num)
      return alert("All fields are required.");
    try {
      await axios.put(
        `${API}/${selected.id}`,
        { ...form, school_year_id: selectedYearId },
        { headers },
      );
      await fetchPeriods(selectedYearId);
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/${selected.id}`, { headers });
      await fetchPeriods(selectedYearId);
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const selectedYear = schoolYears.find((y) => y.id === Number(selectedYearId));

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            Grading Periods
          </h2>
          <p className="text-xs text-gray-400">
            {periods.length} periods for this school year
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* School Year Dropdown */}
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            <option value="">Select School Year</option>
            {schoolYears.map((y) => (
              <option key={y.id} value={y.id}>
                SY {y.year_label} {y.is_active ? "(Active)" : ""}
              </option>
            ))}
          </select>
          <button
            onClick={() => setModal("add")}
            disabled={!selectedYearId}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <PlusCircle size={16} />
            Add Period
          </button>
        </div>
      </div>

      {/* Cards */}
      {!selectedYearId ? (
        <div className="text-center py-12 text-gray-400">
          <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            Select a school year to view grading periods.
          </p>
        </div>
      ) : loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse text-sm">
          Loading...
        </div>
      ) : periods.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">
            No grading periods found for this school year.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {periods
            .sort((a, b) => a.order_num - b.order_num)
            .map((period, index) => {
              const color = quarterColors[index % quarterColors.length];
              return (
                <div
                  key={period.id}
                  className={`rounded-lg border ${color.border} ${color.bg} p-4 flex flex-col gap-3`}
                >
                  {/* Quarter Badge */}
                  <div className="flex justify-between items-start">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${color.badge} ${color.text}`}
                    >
                      Quarter {period.order_num}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEdit(period)}
                        className="p-1 rounded hover:bg-white/60 transition"
                        title="Edit"
                      >
                        <Pencil size={14} className={color.text} />
                      </button>
                      <button
                        onClick={() => openDelete(period)}
                        className="p-1 rounded hover:bg-white/60 transition"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Period Name */}
                  <div>
                    <h3 className={`text-base font-bold ${color.text}`}>
                      {period.period_name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      SY {period.year_label}
                    </p>
                  </div>
                </div>
              );
            })}
        </div>
      )}

      {/* Add Modal */}
      {modal === "add" && (
        <ModalWrapper title="Add Grading Period" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">
            Adding period for <strong>SY {selectedYear?.year_label}</strong>.
          </p>
          <PeriodForm form={form} setForm={setForm} />
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
              Add Period
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Edit Modal */}
      {modal === "edit" && (
        <ModalWrapper title="Edit Grading Period" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">
            Update this grading period.
          </p>
          <PeriodForm form={form} setForm={setForm} />
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
        <ModalWrapper title="Delete Grading Period" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-2">
            You are about to permanently delete:
          </p>
          <p className="font-semibold text-gray-800 mb-4">
            {selected?.period_name}
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

const PeriodForm = ({ form, setForm }) => (
  <div className="flex flex-col gap-3">
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Period Name</label>
      <input
        type="text"
        placeholder="e.g. 1st Quarter"
        value={form.period_name}
        onChange={(e) => setForm({ ...form, period_name: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Order Number</label>
      <input
        type="number"
        placeholder="e.g. 1"
        min="1"
        max="4"
        value={form.order_num}
        onChange={(e) => setForm({ ...form, order_num: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <p className="text-xs text-gray-400 mt-1">
        1 = 1st Quarter, 2 = 2nd Quarter, etc.
      </p>
    </div>
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

export default GradingPeriodCard;
