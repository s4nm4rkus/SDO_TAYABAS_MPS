import { useState, useEffect } from "react";
import { Pencil, X, BookOpen, CheckCircle } from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api/grading-periods";
const SCHOOL_YEARS_API = "http://localhost:5000/api/school-years";

const quarterColors = [
  {
    bg: "linear-gradient(135deg, #0097b2, #00b4d8)",
    shadow: "rgba(0,151,178,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #10b981, #34d399)",
    shadow: "rgba(16,185,129,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #f97316, #fb923c)",
    shadow: "rgba(249,115,22,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
    shadow: "rgba(139,92,246,0.35)",
  },
];

const GradingPeriodCard = () => {
  const [periods, setPeriods] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedYearId, setSelectedYearId] = useState("");
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ period_name: "" });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSchoolYears = async () => {
    try {
      const res = await axios.get(SCHOOL_YEARS_API);
      setSchoolYears(res.data);
      const active = res.data.find((y) => y.is_active);
      if (active) setSelectedYearId(active.id);
    } catch {
      setSchoolYears([]);
    }
  };

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
    setForm({ period_name: "" });
  };

  const openEdit = (period) => {
    setSelected(period);
    setForm({ period_name: period.period_name });
    setModal("edit");
  };

  const handleEdit = async () => {
    if (!form.period_name) return alert("Period name is required.");
    try {
      await axios.put(`${API}/${selected.id}`, form, { headers });
      await fetchPeriods(selectedYearId);
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleSetActive = async (period) => {
    try {
      await axios.put(`${API}/${period.id}/set-active`, {}, { headers });
      await fetchPeriods(selectedYearId);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const selectedYear = schoolYears.find((y) => y.id === Number(selectedYearId));

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: "white", border: "1px solid rgba(0,151,178,0.1)" }}
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div>
          <h2 className="text-base font-black text-[#242424]">
            Grading Periods
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {periods.length} quarters for this school year
          </p>
        </div>

        {/* School Year Selector */}
        <select
          value={selectedYearId}
          onChange={(e) => setSelectedYearId(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm text-[#242424] transition"
          style={{
            background: "rgba(248,248,255,0.8)",
            border: "1px solid rgba(0,151,178,0.2)",
          }}
        >
          <option value="">Select School Year</option>
          {schoolYears.map((y) => (
            <option key={y.id} value={y.id}>
              SY {y.year_label} {y.is_active ? "(Active)" : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Divider */}
      <div
        className="h-px w-full rounded-full mb-5"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      {/* Content */}
      {!selectedYearId ? (
        <div className="text-center py-10 text-gray-400">
          <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Select a school year to view quarters.</p>
        </div>
      ) : loading ? (
        <div className="text-center py-10 text-gray-400 animate-pulse text-sm">
          Loading...
        </div>
      ) : periods.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No quarters found for this school year.</p>
          <p className="text-xs mt-1">
            Quarters are auto-generated when creating a school year.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {periods
            .sort((a, b) => a.order_num - b.order_num)
            .map((period, index) => {
              const color = quarterColors[index % quarterColors.length];
              const isActive = !!period.is_active;

              return (
                <div
                  key={period.id}
                  className="relative rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: color.bg,
                    boxShadow: `0 6px 18px ${color.shadow}`,
                  }}
                >
                  {/* Active Badge */}
                  {isActive && (
                    <span className="absolute top-3 left-3 text-xs font-bold px-2 py-0.5 rounded-full bg-white/25 text-white">
                      Active
                    </span>
                  )}

                  {/* Edit Button */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <button
                      onClick={() => openEdit(period)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/40 transition"
                    >
                      <Pencil size={12} className="text-white" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="mt-6">
                    <p className="text-xs text-white/70 uppercase tracking-wider mb-1">
                      Quarter {period.order_num}
                    </p>
                    <h3 className="text-base font-black text-white mb-1">
                      {period.period_name}
                    </h3>
                    <p className="text-xs text-white/60">
                      SY {period.year_label}
                    </p>
                  </div>

                  {/* Set Active Button */}
                  {!isActive && (
                    <button
                      onClick={() => handleSetActive(period)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-semibold transition hover:bg-white/30"
                      style={{
                        background: "rgba(255,255,255,0.15)",
                        border: "1px dashed rgba(255,255,255,0.4)",
                        color: "white",
                      }}
                    >
                      <CheckCircle size={12} />
                      Set as Active
                    </button>
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* Edit Modal */}
      {modal === "edit" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-base font-black text-[#242424]">
                  Edit Quarter Name
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Quarter {selected?.order_num} · SY {selectedYear?.year_label}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            <label
              className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
              style={{ color: "#0097b2" }}
            >
              Period Name
            </label>
            <input
              type="text"
              placeholder="e.g. 1st Quarter"
              value={form.period_name}
              onChange={(e) => setForm({ period_name: e.target.value })}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424] mb-5"
              style={{
                background: "rgba(248,248,255,0.8)",
                border: "1px solid rgba(0,151,178,0.2)",
              }}
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradingPeriodCard;
