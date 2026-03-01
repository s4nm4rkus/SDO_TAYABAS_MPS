import { useState, useEffect, useMemo } from "react";
import {
  Pencil,
  Trash2,
  PlusCircle,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api/schools";
const CLUSTERS_API = "http://localhost:5000/api/clusters";
const ITEMS_PER_PAGE = 10;

const SchoolTable = () => {
  const [schools, setSchools] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({
    school_name: "",
    school_id: "",
    cluster_id: "",
  });
  const [confirm, setConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchSchools = async () => {
    try {
      const res = await axios.get(API);
      setSchools(res.data);
    } catch {
      setSchools([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClusters = async () => {
    try {
      const res = await axios.get(CLUSTERS_API);
      setClusters(res.data);
    } catch {
      setClusters([]);
    }
  };

  useEffect(() => {
    fetchSchools();
    fetchClusters();
  }, []);

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ school_name: "", school_id: "", cluster_id: "" });
    setConfirm(false);
  };

  const openEdit = (school) => {
    setSelected(school);
    setForm({
      school_name: school.school_name,
      school_id: school.school_id,
      cluster_id: school.cluster_id ?? "",
    });
    setModal("edit");
  };

  const openDelete = (school) => {
    setSelected(school);
    setModal("delete");
  };

  const handleAdd = async () => {
    if (!form.school_name || !form.school_id)
      return alert("School name and School ID are required.");
    try {
      await axios.post(
        API,
        { ...form, cluster_id: form.cluster_id || null },
        { headers },
      );
      await fetchSchools();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = async () => {
    if (!form.school_name || !form.school_id)
      return alert("School name and School ID are required.");
    try {
      await axios.put(
        `${API}/${selected.id}`,
        { ...form, cluster_id: form.cluster_id || null },
        { headers },
      );
      await fetchSchools();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/${selected.id}`, { headers });
      await fetchSchools();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  // Helper to get cluster name from id
  const getClusterName = (cluster_id) => {
    if (!cluster_id) return null;
    const found = clusters.find((c) => c.id === cluster_id);
    return found ? found.cluster_name : null;
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const sortedSchools = useMemo(() => {
    return [...schools].sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [schools, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedSchools.length / ITEMS_PER_PAGE);
  const paginated = sortedSchools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronUp size={13} className="text-gray-300" />;
    return sortOrder === "asc" ? (
      <ChevronUp size={13} className="text-blue-500" />
    ) : (
      <ChevronDown size={13} className="text-blue-500" />
    );
  };

  const SortableTh = ({ field, label }) => (
    <th
      className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200 transition"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon field={field} />
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">Schools</h2>
          <p className="text-xs text-gray-400">
            {schools.length} total records
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          <PlusCircle size={16} />
          Add School
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">#</th>
              <SortableTh field="school_name" label="School Name" />
              <SortableTh field="school_id" label="School ID" />
              <SortableTh field="cluster_id" label="Cluster" />
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-6 text-gray-400 animate-pulse"
                >
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No schools found.
                </td>
              </tr>
            ) : (
              paginated.map((school, index) => (
                <tr
                  key={school.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {school.school_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {school.school_id}
                  </td>
                  <td className="px-4 py-3">
                    {getClusterName(school.cluster_id) ? (
                      <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-medium">
                        {getClusterName(school.cluster_id)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        — No Cluster
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEdit(school)}
                        className="p-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDelete(school)}
                        className="p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100 transition"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <p>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, schools.length)} of{" "}
            {schools.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded border hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1,
              )
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && arr[idx - 1] !== p - 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="px-2 text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 rounded border text-sm transition ${currentPage === p ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-100"}`}
                  >
                    {p}
                  </button>
                ),
              )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded border hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {modal === "add" && (
        <ModalWrapper title="Add New School" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">
            Fill in the details for the new school.
          </p>
          <SchoolForm form={form} setForm={setForm} clusters={clusters} />
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
              Add School
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Edit Modal */}
      {modal === "edit" && (
        <ModalWrapper title="Edit School" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">
            Update the details for this school.
          </p>
          <SchoolForm form={form} setForm={setForm} clusters={clusters} />
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
        <ModalWrapper title="Delete School" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-2">
            You are about to permanently delete:
          </p>
          <p className="font-semibold text-gray-800 mb-4">
            {selected?.school_name}
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

// Updated form with optional cluster dropdown
const SchoolForm = ({ form, setForm, clusters }) => (
  <div className="flex flex-col gap-3">
    <div>
      <label className="text-xs text-gray-500 mb-1 block">School Name</label>
      <input
        type="text"
        placeholder="e.g. Tayabas West Central School"
        value={form.school_name}
        onChange={(e) => setForm({ ...form, school_name: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">School ID</label>
      <input
        type="text"
        placeholder="e.g. TWC-001"
        value={form.school_id}
        onChange={(e) => setForm({ ...form, school_id: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">
        Cluster <span className="text-gray-400">(optional)</span>
      </label>
      {clusters.length === 0 ? (
        <p className="text-xs text-gray-400 italic">
          No clusters available. Add clusters first.
        </p>
      ) : (
        <select
          value={form.cluster_id}
          onChange={(e) => setForm({ ...form, cluster_id: e.target.value })}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="">— No Cluster</option>
          {clusters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cluster_name}
            </option>
          ))}
        </select>
      )}
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

export default SchoolTable;
