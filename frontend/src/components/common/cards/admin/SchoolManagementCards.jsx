import { useState, useEffect } from "react";
import {
  Building2,
  School,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  ChevronRight,
  Plus,
  UserCircle,
} from "lucide-react";
import axios from "axios";

const CLUSTERS_API = "http://localhost:5000/api/clusters";
const SCHOOLS_API = "http://localhost:5000/api/schools";

const clusterColors = [
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
    bg: "linear-gradient(135deg, #14b8a6, #2dd4bf)",
    shadow: "rgba(20,184,166,0.35)",
  },
  {
    bg: "linear-gradient(135deg, #a855f7, #c084fc)",
    shadow: "rgba(168,85,247,0.35)",
  },
];

const emptySchoolRow = () => ({ school_name: "", school_id: "" });

const SchoolManagementCards = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [clusters, setClusters] = useState([]);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loadingClusters, setLoadingClusters] = useState(true);
  const [loadingSchools, setLoadingSchools] = useState(false);

  // Cluster modal
  const [clusterModal, setClusterModal] = useState(null);
  const [clusterSelected, setClusterSelected] = useState(null);
  const [clusterForm, setClusterForm] = useState({
    cluster_name: "",
    cluster_code: "",
  });
  const [schoolRows, setSchoolRows] = useState([emptySchoolRow()]);
  const [clusterConfirm, setClusterConfirm] = useState(false);
  const [deleteClusterModal, setDeleteClusterModal] = useState(null);

  // School modal
  const [schoolModal, setSchoolModal] = useState(null);
  const [schoolSelected, setSchoolSelected] = useState(null);
  const [schoolForm, setSchoolForm] = useState({
    school_name: "",
    school_id: "",
    cluster_id: "",
  });
  const [schoolConfirm, setSchoolConfirm] = useState(false);
  const [deleteSchoolModal, setDeleteSchoolModal] = useState(null);

  // ── Fetch ──
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
      const res = await axios.get(`${SCHOOLS_API}/by-cluster/${clusterId}`, {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    setSchoolRows([emptySchoolRow()]);
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

  const addSchoolRow = () => setSchoolRows([...schoolRows, emptySchoolRow()]);

  const removeSchoolRow = (index) => {
    if (schoolRows.length === 1) return;
    setSchoolRows(schoolRows.filter((_, i) => i !== index));
  };

  const updateSchoolRow = (index, field, value) => {
    const updated = [...schoolRows];
    updated[index][field] = value;
    setSchoolRows(updated);
  };

  const handleAddCluster = async () => {
    if (!clusterForm.cluster_name || !clusterForm.cluster_code)
      return alert("Cluster name and code are required.");

    const validSchools = schoolRows.filter(
      (s) => s.school_name.trim() && s.school_id.trim(),
    );

    try {
      await axios.post(
        CLUSTERS_API,
        { ...clusterForm, schools: validSchools },
        { headers },
      );
      await fetchClusters();
      await fetchUnassignedCount();
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
      cluster_id: selectedCluster?.id || "",
    });
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
    if (!schoolForm.school_name || !schoolForm.school_id)
      return alert("School name and ID are required.");
    try {
      await axios.post(SCHOOLS_API, schoolForm, { headers });
      await refreshAll(selectedCluster?.id);
      closeSchoolModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEditSchool = async () => {
    if (!schoolForm.school_name || !schoolForm.school_id)
      return alert("School name and ID are required.");
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
      <div
        className="rounded-2xl p-5"
        style={{ background: "white", border: "1px solid rgba(0,151,178,0.1)" }}
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-base font-black text-[#242424]">Clusters</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {clusters.length} clusters
            </p>
          </div>
          <button
            onClick={() => setClusterModal("add")}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #0097b2, #004385)",
              boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
            }}
          >
            <PlusCircle size={15} />
            Add Cluster
          </button>
        </div>

        <div
          className="h-px w-full rounded-full mb-5"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
          }}
        />

        {loadingClusters ? (
          <div className="text-center py-8 text-gray-400 animate-pulse text-sm">
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
                  className="relative group rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: isSelected ? color.bg : "white",
                    border: isSelected ? "none" : "1px solid rgba(0,0,0,0.08)",
                    boxShadow: isSelected
                      ? `0 8px 20px ${color.shadow}`
                      : "0 2px 8px rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Actions */}
                  <div className="absolute top-2.5 right-2.5 hidden group-hover:flex gap-1 z-10">
                    <button
                      onClick={(e) => openEditCluster(e, cluster)}
                      className="p-1 rounded-lg transition"
                      style={{
                        background: isSelected
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(0,151,178,0.08)",
                        color: isSelected ? "white" : "#0097b2",
                      }}
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteClusterModal(cluster);
                      }}
                      className="p-1 rounded-lg transition"
                      style={{
                        background: isSelected
                          ? "rgba(255,255,255,0.25)"
                          : "rgba(239,68,68,0.08)",
                        color: isSelected ? "white" : "#ef4444",
                      }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {/* Icon */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                    style={{
                      background: isSelected
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(0,151,178,0.08)",
                    }}
                  >
                    <Building2
                      size={15}
                      style={{ color: isSelected ? "white" : "#0097b2" }}
                    />
                  </div>

                  {/* Info */}
                  <h3
                    className="text-xs font-black truncate leading-tight"
                    style={{ color: isSelected ? "white" : "#242424" }}
                  >
                    {cluster.cluster_name}
                  </h3>
                  <p
                    className="text-xs mt-0.5"
                    style={{
                      color: isSelected
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(0,0,0,0.4)",
                    }}
                  >
                    {cluster.cluster_code}
                  </p>

                  {/* Supervisor */}
                  <div className="flex items-center gap-1 mt-2">
                    <UserCircle
                      size={11}
                      style={{
                        color: isSelected
                          ? "rgba(255,255,255,0.6)"
                          : "rgba(0,0,0,0.3)",
                      }}
                    />
                    <p
                      className="text-xs"
                      style={{
                        color: isSelected
                          ? "rgba(255,255,255,0.6)"
                          : "rgba(0,0,0,0.3)",
                      }}
                    >
                      No supervisor
                    </p>
                  </div>

                  {/* School Count */}
                  <div
                    className="h-px w-full my-2"
                    style={{
                      background: isSelected
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,0,0,0.06)",
                    }}
                  />
                  <p
                    className="text-xs font-bold"
                    style={{ color: isSelected ? "white" : "#0097b2" }}
                  >
                    {cluster.school_count}{" "}
                    {cluster.school_count === 1 ? "school" : "schools"}
                  </p>
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
              className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1"
              style={{
                background:
                  selectedCluster?.id === "unassigned"
                    ? "linear-gradient(135deg, #ef4444, #f87171)"
                    : "white",
                border:
                  selectedCluster?.id === "unassigned"
                    ? "none"
                    : "1px solid rgba(0,0,0,0.08)",
                boxShadow:
                  selectedCluster?.id === "unassigned"
                    ? "0 8px 20px rgba(239,68,68,0.35)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                style={{
                  background:
                    selectedCluster?.id === "unassigned"
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(239,68,68,0.08)",
                }}
              >
                <Building2
                  size={15}
                  style={{
                    color:
                      selectedCluster?.id === "unassigned"
                        ? "white"
                        : "#ef4444",
                  }}
                />
              </div>
              <h3
                className="text-xs font-black truncate leading-tight"
                style={{
                  color:
                    selectedCluster?.id === "unassigned" ? "white" : "#242424",
                }}
              >
                Unassigned
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{
                  color:
                    selectedCluster?.id === "unassigned"
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(0,0,0,0.4)",
                }}
              >
                No cluster
              </p>
              <div
                className="h-px w-full my-2"
                style={{
                  background:
                    selectedCluster?.id === "unassigned"
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(0,0,0,0.06)",
                }}
              />
              <p
                className="text-xs font-bold"
                style={{
                  color:
                    selectedCluster?.id === "unassigned" ? "white" : "#ef4444",
                }}
              >
                {unassignedCount} {unassignedCount === 1 ? "school" : "schools"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── School Cards ── */}
      {selectedCluster && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: "white",
            border: "1px solid rgba(0,151,178,0.1)",
          }}
        >
          <div className="flex justify-between items-center mb-5">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                <span>School Management</span>
                <ChevronRight size={11} />
                <span className="font-semibold" style={{ color: "#0097b2" }}>
                  {selectedCluster.cluster_name}
                </span>
              </div>
              <h2 className="text-base font-black text-[#242424]">
                Schools under {selectedCluster.cluster_name}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {schools.length} {schools.length === 1 ? "school" : "schools"}
              </p>
            </div>
            {selectedCluster.id !== "unassigned" && (
              <button
                onClick={openAddSchool}
                className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                  boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
                }}
              >
                <PlusCircle size={15} />
                Add School
              </button>
            )}
          </div>

          <div
            className="h-px w-full rounded-full mb-5"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
            }}
          />

          {loadingSchools ? (
            <div className="text-center py-8 text-gray-400 animate-pulse text-sm">
              Loading...
            </div>
          ) : schools.length === 0 ? (
            <div
              className="text-center py-10 text-gray-400"
              style={{
                border: "2px dashed rgba(0,151,178,0.2)",
                borderRadius: "1rem",
              }}
            >
              <School size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No schools found.</p>
              {selectedCluster.id !== "unassigned" && (
                <p className="text-xs mt-1">Click "Add School" to add one.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {schools.map((school) => (
                <div
                  key={school.id}
                  className="group relative rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.1)",
                  }}
                >
                  {/* Actions */}
                  <div className="absolute top-3 right-3 hidden group-hover:flex gap-1">
                    <button
                      onClick={() => openEditSchool(school)}
                      className="p-1.5 rounded-lg transition"
                      style={{
                        background: "rgba(0,151,178,0.08)",
                        color: "#0097b2",
                      }}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteSchoolModal(school)}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #0097b2, #004385)",
                      }}
                    >
                      <School size={15} className="text-white" />
                    </div>
                    <div className="pr-10">
                      <h3 className="text-sm font-black text-[#242424] leading-tight">
                        {school.school_name}
                      </h3>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "#0097b2" }}
                      >
                        {school.school_id}
                      </p>
                      {school.cluster_name && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {school.cluster_name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Add Cluster Modal ── */}
      {clusterModal === "add" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-black text-[#242424]">
                  Add New Cluster
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Create a cluster and add schools inline
                </p>
              </div>
              <button
                onClick={closeClusterModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cluster Fields */}
            <div className="flex flex-col gap-4 mb-5">
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  Cluster Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cluster 1"
                  value={clusterForm.cluster_name}
                  onChange={(e) =>
                    setClusterForm({
                      ...clusterForm,
                      cluster_name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                />
              </div>
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  Cluster Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. CLS-001"
                  value={clusterForm.cluster_code}
                  onChange={(e) =>
                    setClusterForm({
                      ...clusterForm,
                      cluster_code: e.target.value,
                    })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                />
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-px w-full rounded-full mb-4"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
              }}
            />

            {/* Schools */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <label
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "#0097b2" }}
                >
                  Schools
                  <span className="ml-1 text-gray-400 normal-case font-normal">
                    (
                    {
                      schoolRows.filter((s) => s.school_name && s.school_id)
                        .length
                    }{" "}
                    ready)
                  </span>
                </label>
                <button
                  onClick={addSchoolRow}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition"
                  style={{
                    background: "rgba(0,151,178,0.08)",
                    color: "#0097b2",
                  }}
                >
                  <Plus size={12} />
                  Add Row
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {schoolRows.map((row, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="School Name"
                      value={row.school_name}
                      onChange={(e) =>
                        updateSchoolRow(index, "school_name", e.target.value)
                      }
                      className="flex-1 rounded-xl px-3 py-2 text-sm text-[#242424]"
                      style={{
                        background: "rgba(248,248,255,0.8)",
                        border: "1px solid rgba(0,151,178,0.15)",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="School ID"
                      value={row.school_id}
                      onChange={(e) =>
                        updateSchoolRow(index, "school_id", e.target.value)
                      }
                      className="w-28 rounded-xl px-3 py-2 text-sm text-[#242424]"
                      style={{
                        background: "rgba(248,248,255,0.8)",
                        border: "1px solid rgba(0,151,178,0.15)",
                      }}
                    />
                    <button
                      onClick={() => removeSchoolRow(index)}
                      disabled={schoolRows.length === 1}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Leave blank rows empty — they will be ignored.
              </p>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeClusterModal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCluster}
                className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                Add Cluster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Cluster Modal ── */}
      {clusterModal === "edit" && (
        <ModalWrapper title="Edit Cluster" onClose={closeClusterModal}>
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                style={{ color: "#0097b2" }}
              >
                Cluster Name
              </label>
              <input
                type="text"
                value={clusterForm.cluster_name}
                onChange={(e) =>
                  setClusterForm({
                    ...clusterForm,
                    cluster_name: e.target.value,
                  })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                style={{
                  background: "rgba(248,248,255,0.8)",
                  border: "1px solid rgba(0,151,178,0.2)",
                }}
              />
            </div>
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                style={{ color: "#0097b2" }}
              >
                Cluster Code
              </label>
              <input
                type="text"
                value={clusterForm.cluster_code}
                onChange={(e) =>
                  setClusterForm({
                    ...clusterForm,
                    cluster_code: e.target.value,
                  })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                style={{
                  background: "rgba(248,248,255,0.8)",
                  border: "1px solid rgba(0,151,178,0.2)",
                }}
              />
            </div>
          </div>
          {!clusterConfirm ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={closeClusterModal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setClusterConfirm(true)}
                className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              <p className="mb-2 font-semibold text-yellow-700">
                Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setClusterConfirm(false)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-xs"
                >
                  Go Back
                </button>
                <button
                  onClick={handleEditCluster}
                  className="flex-1 px-3 py-1.5 rounded-xl text-white transition hover:opacity-90 text-xs"
                  style={{
                    background: "linear-gradient(135deg, #0097b2, #004385)",
                  }}
                >
                  Yes, Save
                </button>
              </div>
            </div>
          )}
        </ModalWrapper>
      )}

      {/* ── Delete Cluster Modal ── */}
      {deleteClusterModal && (
        <ModalWrapper
          title="Delete Cluster"
          onClose={() => setDeleteClusterModal(null)}
        >
          <p className="text-sm text-gray-500 mb-2">
            You are about to permanently delete:
          </p>
          <p className="font-bold text-[#242424] mb-1">
            {deleteClusterModal.cluster_name}
          </p>
          <p className="text-xs text-gray-400 mb-1">
            Schools under this cluster will become unassigned.
          </p>
          <p className="text-sm text-red-500 mb-5 mt-2">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteClusterModal(null)}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCluster}
              className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
            >
              Yes, Delete
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* ── Add / Edit School Modal ── */}
      {(schoolModal === "add" || schoolModal === "edit") && (
        <ModalWrapper
          title={schoolModal === "add" ? "Add New School" : "Edit School"}
          onClose={closeSchoolModal}
        >
          <div className="flex flex-col gap-4 mb-4">
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                style={{ color: "#0097b2" }}
              >
                School Name
              </label>
              <input
                type="text"
                placeholder="e.g. Tiaong Elementary School"
                value={schoolForm.school_name}
                onChange={(e) =>
                  setSchoolForm({ ...schoolForm, school_name: e.target.value })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                style={{
                  background: "rgba(248,248,255,0.8)",
                  border: "1px solid rgba(0,151,178,0.2)",
                }}
              />
            </div>
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                style={{ color: "#0097b2" }}
              >
                School ID
              </label>
              <input
                type="text"
                placeholder="e.g. 123456"
                value={schoolForm.school_id}
                onChange={(e) =>
                  setSchoolForm({ ...schoolForm, school_id: e.target.value })
                }
                className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                style={{
                  background: "rgba(248,248,255,0.8)",
                  border: "1px solid rgba(0,151,178,0.2)",
                }}
              />
            </div>
          </div>
          {schoolModal === "edit" && !schoolConfirm ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={closeSchoolModal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setSchoolConfirm(true)}
                className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                Save Changes
              </button>
            </div>
          ) : schoolModal === "edit" && schoolConfirm ? (
            <div
              className="p-3 rounded-xl text-sm"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              <p className="mb-2 font-semibold text-yellow-700">
                Are you sure?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setSchoolConfirm(false)}
                  className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-xs"
                >
                  Go Back
                </button>
                <button
                  onClick={handleEditSchool}
                  className="flex-1 px-3 py-1.5 rounded-xl text-white transition hover:opacity-90 text-xs"
                  style={{
                    background: "linear-gradient(135deg, #0097b2, #004385)",
                  }}
                >
                  Yes, Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end gap-2">
              <button
                onClick={closeSchoolModal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSchool}
                className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                Add School
              </button>
            </div>
          )}
        </ModalWrapper>
      )}

      {/* ── Delete School Modal ── */}
      {deleteSchoolModal && (
        <ModalWrapper
          title="Delete School"
          onClose={() => setDeleteSchoolModal(null)}
        >
          <p className="text-sm text-gray-500 mb-2">
            You are about to permanently delete:
          </p>
          <p className="font-bold text-[#242424] mb-1">
            {deleteSchoolModal.school_name}
          </p>
          <p className="text-xs text-gray-400 mb-1">
            {deleteSchoolModal.school_id}
          </p>
          <p className="text-sm text-red-500 mb-5 mt-2">
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setDeleteSchoolModal(null)}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteSchool}
              className="px-4 py-2 text-sm rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
            >
              Yes, Delete
            </button>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
};

const ModalWrapper = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div
      className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
      style={{ border: "1px solid rgba(0,151,178,0.15)" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base font-black text-[#242424]">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-red-500 transition"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default SchoolManagementCards;
