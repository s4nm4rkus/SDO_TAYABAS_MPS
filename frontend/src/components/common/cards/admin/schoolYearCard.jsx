import { useState, useEffect } from "react";
import {
  MoreVertical,
  PlusCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  X,
  CalendarDays,
} from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api/school-years";

const SchoolYearCard = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [schoolYear, setSchoolYear] = useState(null);
  const [allYears, setAllYears] = useState([]);
  const [newYear, setNewYear] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchActive = async () => {
    try {
      const res = await axios.get(`${API}/active`);
      setSchoolYear(res.data);
    } catch {
      setSchoolYear(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    try {
      const res = await axios.get(API);
      setAllYears(res.data);
    } catch {
      setAllYears([]);
    }
  };

  useEffect(() => {
    fetchActive();
  }, []);

  const closeModal = () => {
    setModal(null);
    setNewYear("");
    setIsActive(false);
    setMenuOpen(false);
  };

  const handleAdd = async () => {
    if (!newYear.trim()) return alert("Please enter a school year label.");
    try {
      await axios.post(
        API,
        { year_label: newYear, is_active: isActive },
        { headers },
      );
      await fetchActive();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/${schoolYear.id}`, { headers });
      await fetchActive();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleToggleActive = async () => {
    try {
      await axios.put(
        `${API}/${schoolYear.id}`,
        { year_label: schoolYear.year_label, is_active: !schoolYear.is_active },
        { headers },
      );
      await fetchActive();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleSelectYear = async (year) => {
    try {
      await axios.put(
        `${API}/${year.id}`,
        { year_label: year.year_label, is_active: true },
        { headers },
      );
      await fetchActive();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <>
      <div
        className="relative flex items-center justify-between px-5 py-4 rounded-2xl shadow-md"
        style={{
          background: "linear-gradient(135deg, #0097b2, #004385)",
          boxShadow: "0 6px 20px rgba(0,151,178,0.3)",
        }}
      >
        {/* Left — Icon + Info */}
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/20">
            <CalendarDays size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-white/70 uppercase tracking-widest font-medium">
              Academic Year
            </p>
            {loading ? (
              <p className="text-lg font-bold text-white animate-pulse">
                Loading...
              </p>
            ) : schoolYear ? (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">
                  SY {schoolYear.year_label}
                </h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    schoolYear.is_active
                      ? "bg-green-400/30 text-green-200 border border-green-400/40"
                      : "bg-white/10 text-white/60 border border-white/20"
                  }`}
                >
                  {schoolYear.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ) : (
              <p className="text-sm text-white/60">No active school year</p>
            )}
          </div>
        </div>

        {/* Right — Menu Button */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-2 rounded-xl hover:bg-white/20 transition text-white"
          >
            <MoreVertical size={18} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-52 bg-white text-gray-800 rounded-xl shadow-xl z-10 overflow-hidden"
              style={{ border: "1px solid rgba(0,151,178,0.15)" }}
            >
              <button
                onClick={() => setModal("add")}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-cyan-50 transition"
              >
                <PlusCircle size={15} className="text-cyan-500" />
                Add New School Year
              </button>
              <button
                onClick={() => {
                  fetchAll();
                  setModal("select");
                }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-indigo-50 transition"
              >
                <CheckCircle size={15} className="text-indigo-500" />
                Select Active Year
              </button>
              <button
                onClick={() => setModal("toggle")}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm hover:bg-green-50 transition"
              >
                {schoolYear?.is_active ? (
                  <ToggleRight size={15} className="text-green-500" />
                ) : (
                  <ToggleLeft size={15} className="text-gray-400" />
                )}
                {schoolYear?.is_active ? "Set as Inactive" : "Set as Active"}
              </button>
              <hr className="border-gray-100" />
              <button
                onClick={() => setModal("delete")}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
              >
                <Trash2 size={15} />
                Delete School Year
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {modal === "add" && (
        <ModalWrapper title="Add New School Year" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">
            Enter the label for the new academic year.
          </p>
          <input
            type="text"
            placeholder="e.g. 2027-2028"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm mb-3 focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ focusRingColor: "#0097b2" }}
          />
          <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer text-gray-600">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="accent-cyan-500"
            />
            Set as active school year
          </label>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm rounded-xl border hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #0097b2, #004385)",
              }}
            >
              Add Year
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Select Year Modal */}
      {modal === "select" && (
        <ModalWrapper title="Select Active School Year" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-3">
            Choose which school year to set as active.
          </p>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {allYears.length === 0 ? (
              <p className="text-sm text-gray-400">No school years found.</p>
            ) : (
              allYears.map((year) => (
                <button
                  key={year.id}
                  onClick={() => handleSelectYear(year)}
                  className={`flex justify-between items-center px-4 py-2.5 rounded-xl border text-sm transition ${
                    year.is_active
                      ? "border-cyan-400 bg-cyan-50 text-cyan-700 font-semibold"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span>SY {year.year_label}</span>
                  {year.is_active && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full text-white"
                      style={{
                        background: "linear-gradient(135deg, #0097b2, #004385)",
                      }}
                    >
                      Active
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm rounded-xl border hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <ModalWrapper title="Delete School Year" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-2">
            You are about to permanently delete:
          </p>
          <p className="font-semibold text-gray-800 mb-2">
            SY {schoolYear?.year_label}
          </p>
          <p className="text-sm text-red-500 mb-4">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm rounded-xl border hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-sm rounded-xl bg-red-600 text-white hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Toggle Modal */}
      {modal === "toggle" && (
        <ModalWrapper title="Change Active Status" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">
            This will mark <strong>SY {schoolYear?.year_label}</strong> as{" "}
            <strong>{schoolYear?.is_active ? "Inactive" : "Active"}</strong>.
            {!schoolYear?.is_active && " All other years will be deactivated."}
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm rounded-xl border hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleToggleActive}
              className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #0097b2, #004385)",
              }}
            >
              Confirm
            </button>
          </div>
        </ModalWrapper>
      )}
    </>
  );
};

const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div
      className="bg-white text-gray-800 rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
      style={{ border: "1px solid rgba(0,151,178,0.15)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-semibold text-[#242424]">{title}</h2>
        <button
          onClick={onClose}
          className="hover:text-red-500 transition text-gray-400"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default SchoolYearCard;
