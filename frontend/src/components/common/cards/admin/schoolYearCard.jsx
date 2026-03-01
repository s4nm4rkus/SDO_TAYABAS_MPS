import { useState, useEffect } from "react";
import {
  MoreVertical,
  PlusCircle,
  Trash2,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
  X,
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
    <div className="relative p-4 bg-textHeader-color rounded-md text-whiteBg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm opacity-75">Academic Year</p>
          {loading ? (
            <p className="text-lg font-bold animate-pulse">Loading...</p>
          ) : schoolYear ? (
            <>
              <h1 className="text-2xl font-bold">SY {schoolYear.year_label}</h1>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${
                  schoolYear.is_active
                    ? "bg-green-500 text-white"
                    : "bg-gray-400 text-white"
                }`}
              >
                {schoolYear.is_active ? "Active" : "Inactive"}
              </span>
            </>
          ) : (
            <p className="text-sm opacity-75">No active school year</p>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1 rounded-full hover:bg-white/20 transition"
          >
            <MoreVertical size={20} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white text-gray-800 rounded-md shadow-lg z-10 overflow-hidden">
              <button
                onClick={() => setModal("add")}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 transition"
              >
                <PlusCircle size={16} className="text-blue-500" />
                Add New School Year
              </button>
              <button
                onClick={() => {
                  fetchAll();
                  setModal("select");
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 transition"
              >
                <CheckCircle size={16} className="text-indigo-500" />
                Select Active Year
              </button>
              <button
                onClick={() => setModal("toggle")}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-gray-100 transition"
              >
                {schoolYear?.is_active ? (
                  <ToggleRight size={16} className="text-green-500" />
                ) : (
                  <ToggleLeft size={16} className="text-gray-400" />
                )}
                {schoolYear?.is_active ? "Set as Inactive" : "Set as Active"}
              </button>
              <hr />
              <button
                onClick={() => setModal("delete")}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition"
              >
                <Trash2 size={16} />
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
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer text-gray-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Set as active school year
          </label>
          <div className="flex justify-end gap-2">
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
                  className={`flex justify-between items-center px-4 py-2 rounded border text-sm transition ${
                    year.is_active
                      ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <span>SY {year.year_label}</span>
                  {year.is_active && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
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
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Delete Modal */}
      {modal === "delete" && (
        <ModalWrapper title="Delete School Year" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to delete{" "}
            <strong>SY {schoolYear?.year_label}</strong>? This cannot be undone.
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
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleToggleActive}
              className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Confirm
            </button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

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

export default SchoolYearCard;
