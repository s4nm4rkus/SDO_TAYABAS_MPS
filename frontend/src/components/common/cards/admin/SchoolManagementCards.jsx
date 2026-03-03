import { useState, useEffect } from "react";
import {
  Building2,
  School,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  ChevronRight,
} from "lucide-react";
import axios from "axios";

const CLUSTERS_API = "http://localhost:5000/api/clusters";
const SCHOOLS_API = "http://localhost:5000/api/schools";

const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

const clusterColors = [
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
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
    badge: "bg-teal-100",
  },
  {
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
    badge: "bg-pink-100",
  },
  {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
    badge: "bg-indigo-100",
  },
  {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    badge: "bg-yellow-100",
  },
  {
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    badge: "bg-cyan-100",
  },
];

const SchoolManagementCards = () => {
  // ── Shared State ──
  const [clusters, setClusters] = useState([]);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loadingClusters, setLoadingClusters] = useState(true);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // ── Cluster Modal State ──
  const [clusterModal, setClusterModal] = useState(null);
  const [clusterSelected, setClusterSelected] = useState(null);
  const [clusterForm, setClusterForm] = useState({
    cluster_name: "",
    cluster_code: "",
  });
  const [clusterConfirm, setClusterConfirm] = useState(false);
  const [deleteClusterModal, setDeleteClusterModal] = useState(null);

  // ── School Modal State ──
  const [schoolModal, setSchoolModal] = useState(null);
  const [schoolSelected, setSchoolSelected] = useState(null);
  const [schoolForm, setSchoolForm] = useState({
    school_name: "",
    school_id: "",
    cluster_id: "",
  });
  const [schoolConfirm, setSchoolConfirm] = useState(false);
  const [deleteSchoolModal, setDeleteSchoolModal] = useState(null);

  // ── Fetch Functions ──
  const fetchClusters = async () => {
    try {
      const res = await axios.get(`${SCHOOLS_API}/clusters-with-count`, {
        headers,
      });
      setClusters(res.data);
    } catch {
      setClusters([]);
    } finally {
      setLoadingClusters(false);
    }
  };

  const fetchUnassignedCount = async () => {
    try {
      const res = await axios.get(`${SCHOOLS_API}/unassigned-count`, {
        headers,
      });
      setUnassignedCount(res.data.count);
    } catch {
      setUnassignedCount(0);
    }
  };

  const fetchSchools = async (clusterId) => {
    if (!clusterId) return;
    setLoadingSchools(true);
    try {
      const id = clusterId === "unassigned" ? "unassigned" : clusterId;
      const res = await axios.get(`${SCHOOLS_API}/by-cluster/${id}`, {
        headers,
      });
      setSchools(res.data);
    } catch {
      setSchools([]);
    } finally {
      setLoadingSchools(false);
    }
  };

  const refreshAll = async (clusterId) => {
    await fetchClusters();
    await fetchUnassignedCount();
    if (clusterId) await fetchSchools(clusterId);
  };

  useEffect(() => {
    fetchClusters();
    fetchUnassignedCount();
  }, []);

  // ── Cluster Select ──
  const handleSelectCluster = (cluster) => {
    if (selectedCluster?.id === cluster.id) {
      setSelectedCluster(null);
      setSchools([]);
    } else {
      setSelectedCluster(cluster);
      fetchSchools(cluster.id);
    }
  };

  // ── Cluster CRUD ──
  const closeClusterModal = () => {
    setClusterModal(null);
    setClusterSelected(null);
    setClusterForm({ cluster_name: "", cluster_code: "" });
    setClusterConfirm(false);
  };

  const openEditCluster = (e, cluster) => {
    e.stopPropagation();
    setClusterSelected(cluster);
    setClusterForm({
      cluster_name: cluster.cluster_name,
      cluster_code: cluster.cluster_code,
    });
    setClusterConfirm(false);
    setClusterModal("edit");
  };

  const handleAddCluster = async () => {
    if (!clusterForm.cluster_name || !clusterForm.cluster_code)
      return alert("All fields are required.");
    try {
      await axios.post(CLUSTERS_API, clusterForm, { headers });
      await fetchClusters();
      closeClusterModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEditCluster = async () => {
    try {
      await axios.put(`${CLUSTERS_API}/${clusterSelected.id}`, clusterForm, {
        headers,
      });
      await fetchClusters();
      closeClusterModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDeleteCluster = async () => {
    try {
      await axios.delete(`${CLUSTERS_API}/${deleteClusterModal.id}`, {
        headers,
      });
      await fetchClusters();
      await fetchUnassignedCount();
      if (selectedCluster?.id === deleteClusterModal.id) {
        setSelectedCluster(null);
        setSchools([]);
      }
      setDeleteClusterModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  // ── School CRUD ──
  const closeSchoolModal = () => {
    setSchoolModal(null);
    setSchoolSelected(null);
    setSchoolForm({ school_name: "", school_id: "", cluster_id: "" });
    setSchoolConfirm(false);
  };

  const openAddSchool = () => {
    setSchoolForm({
      school_name: "",
      school_id: "",
      cluster_id:
        selectedCluster?.id === "unassigned" ? "" : selectedCluster?.id || "",
    });
    setSchoolSelected(null);
    setSchoolConfirm(false);
    setSchoolModal("add");
  };

  const openEditSchool = (school) => {
    setSchoolSelected(school);
    setSchoolForm({
      school_name: school.school_name,
      school_id: school.school_id,
      cluster_id: school.cluster_id || "",
    });
    setSchoolConfirm(false);
    setSchoolModal("edit");
  };

  const handleAddSchool = async () => {
    if (
      !schoolForm.school_name ||
      !schoolForm.school_id ||
      !schoolForm.cluster_id
    )
      return alert("All fields are required.");
    try {
      await axios.post(SCHOOLS_API, schoolForm, { headers });
      await refreshAll(selectedCluster?.id);
      closeSchoolModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEditSchool = async () => {
    if (
      !schoolForm.school_name ||
      !schoolForm.school_id ||
      !schoolForm.cluster_id
    )
      return alert("All fields are required.");
    try {
      await axios.put(`${SCHOOLS_API}/${schoolSelected.id}`, schoolForm, {
        headers,
      });
      await refreshAll(selectedCluster?.id);
      closeSchoolModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDeleteSchool = async () => {
    try {
      await axios.delete(`${SCHOOLS_API}/${deleteSchoolModal.id}`, { headers });
      await refreshAll(selectedCluster?.id);
      setDeleteSchoolModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* ── Cluster Cards ── */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Clusters</h2>
            <p className="text-xs text-gray-400">{clusters.length} clusters</p>
          </div>
          <button
            onClick={() => setClusterModal("add")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
          >
            <PlusCircle size={16} />
            Add Cluster
          </button>
        </div>

        {loadingClusters ? (
          <div className="text-center py-6 text-gray-400 animate-pulse text-sm">
            Loading...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {clusters.map((cluster, index) => {
              const color = clusterColors[index % clusterColors.length];
              const isSelected = selectedCluster?.id === cluster.id;
              return (
                <div
                  key={cluster.id}
                  onClick={() => handleSelectCluster(cluster)}
                  className={`relative group rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? `${color.border} ${color.bg} shadow-md scale-105`
                      : "border-gray-200 bg-white hover:shadow-md hover:scale-105"
                  }`}
                >
                  <div className="absolute top-2 right-2 hidden group-hover:flex gap-1 z-10">
                    <button
                      onClick={(e) => openEditCluster(e, cluster)}
                      className="p-1 rounded bg-white shadow text-indigo-500 hover:bg-indigo-50"
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteClusterModal(cluster);
                      }}
                      className="p-1 rounded bg-white shadow text-red-400 hover:bg-red-50"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                  <div className={`p-2 rounded-lg ${color.badge} w-fit mb-2`}>
                    <Building2 size={16} className={color.text} />
                  </div>
                  <h3
                    className={`text-xs font-bold truncate ${isSelected ? color.text : "text-gray-700"}`}
                  >
                    {cluster.cluster_name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {cluster.cluster_code}
                  </p>
                  <span
                    className={`text-xs font-semibold mt-1 block ${color.text}`}
                  >
                    {cluster.school_count} schools
                  </span>
                </div>
              );
            })}

            {/* Unassigned Card */}
            <div
              onClick={() =>
                handleSelectCluster({
                  id: "unassigned",
                  cluster_name: "Unassigned Schools",
                })
              }
              className={`rounded-lg border-2 p-3 cursor-pointer transition-all duration-200 ${
                selectedCluster?.id === "unassigned"
                  ? "border-red-300 bg-red-50 shadow-md scale-105"
                  : "border-gray-200 bg-white hover:shadow-md hover:scale-105"
              }`}
            >
              <div className="p-2 rounded-lg bg-red-100 w-fit mb-2">
                <Building2 size={16} className="text-red-500" />
              </div>
              <h3
                className={`text-xs font-bold ${selectedCluster?.id === "unassigned" ? "text-red-600" : "text-gray-700"}`}
              >
                Unassigned
              </h3>
              <p className="text-xs text-gray-400">No cluster</p>
              <span className="text-xs font-semibold mt-1 block text-red-500">
                {unassignedCount} schools
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── School Cards ── */}
      {selectedCluster && (
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                <span>School Management</span>
                <ChevronRight size={12} />
                <span className="text-gray-600 font-medium">
                  {selectedCluster.cluster_name}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-700">
                Schools under {selectedCluster.cluster_name}
              </h2>
              <p className="text-xs text-gray-400">{schools.length} schools</p>
            </div>
            {selectedCluster.id !== "unassigned" && (
              <button
                onClick={openAddSchool}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
              >
                <PlusCircle size={16} />
                Add School
              </button>
            )}
          </div>

          {loadingSchools ? (
            <div className="text-center py-6 text-gray-400 animate-pulse text-sm">
              Loading...
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <School size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No schools found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition group relative"
                >
                  <div className="absolute top-3 right-3 hidden group-hover:flex gap-1">
                    <button
                      onClick={() => openEditSchool(school)}
                      className="p-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteSchoolModal(school)}
                      className="p-1.5 rounded bg-red-50 text-red-500 hover:bg-red-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-50">
                      <School size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        {school.school_name}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {school.school_id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Cluster Modals ── */}
      {clusterModal === "add" && (
        <ModalWrapper title="Add New Cluster" onClose={closeClusterModal}>
          <ClusterForm form={clusterForm} setForm={setClusterForm} />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={closeClusterModal}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCluster}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Add Cluster
            </button>
          </div>
        </ModalWrapper>
      )}

      {clusterModal === "edit" && (
        <ModalWrapper title="Edit Cluster" onClose={closeClusterModal}>
          <ClusterForm form={clusterForm} setForm={setClusterForm} />
          {!clusterConfirm ? (
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeClusterModal}
                className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setClusterConfirm(true)}
                className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800">
              <p className="mb-2 font-medium">Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setClusterConfirm(false)}
                  className="flex-1 px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleEditCluster}
                  className="flex-1 px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Yes, Save
                </button>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}

      {deleteClusterModal && (
        <ModalWrapper
          title="Delete Cluster"
          onClose={() => setDeleteClusterModal(null)}
        >
          <p className="text-sm text-gray-500 mb-2">
            You are about to permanently delete:
          </p>
          <p className="font-semibold text-gray-800 mb-4">
            {deleteClusterModal.cluster_name}
          </p>
          <p className="text-sm text-red-500 mb-4">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteClusterModal(null)}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCluster}
              className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
            >
              Yes, Delete
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ── School Modals ── */}
      {schoolModal === "add" && (
        <ModalWrapper title="Add New School" onClose={closeSchoolModal}>
          <SchoolForm
            form={schoolForm}
            setForm={setSchoolForm}
            clusters={clusters}
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={closeSchoolModal}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSchool}
              className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Add School
            </button>
          </div>
        </ModalWrapper>
      )}

      {schoolModal === "edit" && (
        <ModalWrapper title="Edit School" onClose={closeSchoolModal}>
          <SchoolForm
            form={schoolForm}
            setForm={setSchoolForm}
            clusters={clusters}
          />
          {!schoolConfirm ? (
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeSchoolModal}
                className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => setSchoolConfirm(true)}
                className="px-4 py-2 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-300 rounded text-sm text-yellow-800">
              <p className="mb-2 font-medium">Are you sure?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSchoolConfirm(false)}
                  className="flex-1 px-3 py-1.5 rounded border text-gray-600 hover:bg-gray-50"
                >
                  Go Back
                </button>
                <button
                  onClick={handleEditSchool}
                  className="flex-1 px-3 py-1.5 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  Yes, Save
                </button>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}

      {deleteSchoolModal && (
        <ModalWrapper
          title="Delete School"
          onClose={() => setDeleteSchoolModal(null)}
        >
          <p className="text-sm text-gray-500 mb-2">
            You are about to permanently delete:
          </p>
          <p className="font-semibold text-gray-800 mb-4">
            {deleteSchoolModal.school_name}
          </p>
          <p className="text-sm text-red-500 mb-4">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteSchoolModal(null)}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSchool}
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

// ── Sub Components ──
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

const SchoolForm = ({ form, setForm, clusters }) => (
  <div className="flex flex-col gap-3">
    <div>
      <label className="text-xs text-gray-500 mb-1 block">School Name</label>
      <input
        type="text"
        placeholder="e.g. Tiaong Elementary School"
        value={form.school_name}
        onChange={(e) => setForm({ ...form, school_name: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">School ID</label>
      <input
        type="text"
        placeholder="e.g. 123456"
        value={form.school_id}
        onChange={(e) => setForm({ ...form, school_id: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
    <div>
      <label className="text-xs text-gray-500 mb-1 block">Cluster</label>
      <select
        value={form.cluster_id}
        onChange={(e) => setForm({ ...form, cluster_id: e.target.value })}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">Select Cluster</option>
        {clusters?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.cluster_name}
          </option>
        ))}
      </select>
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

export default SchoolManagementCards;
