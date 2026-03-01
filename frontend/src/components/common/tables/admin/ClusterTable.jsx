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

const API = "http://localhost:5000/api/clusters";
const ITEMS_PER_PAGE = 10;

const ClusterTable = () => {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ cluster_name: "", cluster_code: "" });
  const [confirm, setConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchClusters = async () => {
    try {
      const res = await axios.get(API);
      setClusters(res.data);
    } catch {
      setClusters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClusters();
  }, []);

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ cluster_name: "", cluster_code: "" });
    setConfirm(false);
  };

  const openEdit = (cluster) => {
    setSelected(cluster);
    setForm({
      cluster_name: cluster.cluster_name,
      cluster_code: cluster.cluster_code,
    });
    setModal("edit");
  };

  const openDelete = (cluster) => {
    setSelected(cluster);
    setModal("delete");
  };

  const handleAdd = async () => {
    if (!form.cluster_name || !form.cluster_code)
      return alert("All fields are required.");
    try {
      await axios.post(API, form, { headers });
      await fetchClusters();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = async () => {
    if (!form.cluster_name || !form.cluster_code)
      return alert("All fields are required.");
    try {
      await axios.put(`${API}/${selected.id}`, form, { headers });
      await fetchClusters();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/${selected.id}`, { headers });
      await fetchClusters();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
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

  const sortedClusters = useMemo(() => {
    return [...clusters].sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [clusters, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedClusters.length / ITEMS_PER_PAGE);
  const paginated = sortedClusters.slice(
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
          <h2 className="text-lg font-semibold text-gray-700">Clusters</h2>
          <p className="text-xs text-gray-400">
            {clusters.length} total records
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          <PlusCircle size={16} />
          Add Cluster
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">#</th>
              <SortableTh field="cluster_name" label="Cluster Name" />
              <SortableTh field="cluster_code" label="Cluster Code" />
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-6 text-gray-400 animate-pulse"
                >
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-gray-400">
                  No clusters found.
                </td>
              </tr>
            ) : (
              paginated.map((cluster, index) => (
                <tr
                  key={cluster.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {cluster.cluster_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {cluster.cluster_code}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openEdit(cluster)}
                        className="p-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => openDelete(cluster)}
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
            {Math.min(currentPage * ITEMS_PER_PAGE, clusters.length)} of{" "}
            {clusters.length}
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
        <ModalWrapper title="Add New Cluster" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">
            Fill in the details for the new cluster.
          </p>
          <ClusterForm form={form} setForm={setForm} />
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
              Add Cluster
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Edit Modal */}
      {modal === "edit" && (
        <ModalWrapper title="Edit Cluster" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-4">
            Update the details for this cluster.
          </p>
          <ClusterForm form={form} setForm={setForm} />
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
        <ModalWrapper title="Delete Cluster" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-2">
            You are about to permanently delete:
          </p>
          <p className="font-semibold text-gray-800 mb-4">
            {selected?.cluster_name}
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

const ClusterForm = ({ form, setForm }) => (
  <div className="flex flex-col gap-3">
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Cluster Name</label>
      <input
        type="text"
        placeholder="e.g. Cluster 1"
        value={form.cluster_name}
        onChange={(e) => setForm({ ...form, cluster_name: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Cluster Code</label>
      <input
        type="text"
        placeholder="e.g. CLS-001"
        value={form.cluster_code}
        onChange={(e) => setForm({ ...form, cluster_code: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
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

export default ClusterTable;
