import { useState, useMemo, useEffect } from "react";
import {
  PlusCircle,
  Pencil,
  Trash2,
  X,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  UserX,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const API = `${import.meta.env.VITE_API_URL}/api/users`;
const SCHOOLS_API = `${import.meta.env.VITE_API_URL}/api/schools`;
const CLUSTERS_API = `${import.meta.env.VITE_API_URL}/api/clusters`;
const ITEMS_PER_PAGE = 10;

const roleBadge = {
  admin: {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    color: "#ef4444",
  },
  school_head: {
    bg: "rgba(0,151,178,0.08)",
    border: "rgba(0,151,178,0.2)",
    color: "#0097b2",
  },
  teacher: {
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    color: "#10b981",
  },
  supervisor: {
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
    color: "#8b5cf6",
  },
};

const roleTabs = ["all", "admin", "supervisor", "school_head", "teacher"];

// Check if user is unassigned
const isUnassigned = (user) => {
  if (user.role === "admin") return false;
  if (user.role === "supervisor") return !user.cluster_id;
  if (user.role === "school_head") return !user.schools?.length;
  if (user.role === "teacher") return !user.school_id;
  return false;
};

// School assignment display
const SchoolAssignment = ({ user }) => {
  const [show, setShow] = useState(false);

  if (user.role === "admin") return <span className="text-gray-400">—</span>;

  if (user.role === "supervisor") {
    return user.cluster_name ? (
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          color: "#8b5cf6",
        }}
      >
        {user.cluster_name}
      </span>
    ) : (
      <span className="text-xs flex items-center gap-1 text-orange-400">
        <AlertCircle size={11} /> No cluster
      </span>
    );
  }

  if (user.role === "teacher") {
    return user.school_name ? (
      <span
        className="text-xs px-2 py-0.5 rounded-full"
        style={{
          background: "rgba(16,185,129,0.08)",
          border: "1px solid rgba(16,185,129,0.2)",
          color: "#10b981",
        }}
      >
        {user.school_name}
      </span>
    ) : (
      <span className="text-xs flex items-center gap-1 text-orange-400">
        <AlertCircle size={11} /> No school
      </span>
    );
  }

  if (user.role === "school_head") {
    const schools = user.schools || [];
    if (!schools.length)
      return (
        <span className="text-xs flex items-center gap-1 text-orange-400">
          <AlertCircle size={11} /> No school
        </span>
      );
    if (schools.length === 1)
      return (
        <span
          className="text-xs px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(0,151,178,0.08)",
            border: "1px solid rgba(0,151,178,0.2)",
            color: "#0097b2",
          }}
        >
          {schools[0].school_name}
        </span>
      );
    return (
      <div className="relative inline-block">
        <button
          onClick={() => setShow(!show)}
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition"
          style={{
            background: "rgba(0,151,178,0.08)",
            border: "1px solid rgba(0,151,178,0.2)",
            color: "#0097b2",
          }}
        >
          {schools.length} schools <ChevronDown size={11} />
        </button>
        {show && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShow(false)}
            />
            <div
              className="absolute left-0 top-7 z-20 bg-white rounded-xl shadow-lg p-2 min-w-48"
              style={{ border: "1px solid rgba(0,151,178,0.15)" }}
            >
              {schools.map((s) => (
                <div
                  key={s.id}
                  className="px-3 py-1.5 rounded-lg text-xs text-[#242424] hover:bg-gray-50"
                >
                  {s.school_name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  return <span className="text-gray-400">—</span>;
};

// Assignment fields inside modal
const AssignmentFields = ({ form, setForm, schools, clusters }) => {
  if (form.role === "teacher")
    return (
      <div>
        <label
          className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
          style={{ color: "#0097b2" }}
        >
          Assign to School
        </label>
        <select
          value={form.school_id}
          onChange={(e) => setForm({ ...form, school_id: e.target.value })}
          className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
          style={{
            background: "rgba(248,248,255,0.8)",
            border: "1px solid rgba(0,151,178,0.2)",
          }}
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.school_name}
            </option>
          ))}
        </select>
      </div>
    );

  if (form.role === "school_head")
    return (
      <div>
        <label
          className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
          style={{ color: "#0097b2" }}
        >
          Assign to School
        </label>
        <select
          value={form.school_ids?.[0] || form.school_id || ""}
          onChange={(e) =>
            setForm({
              ...form,
              school_id: e.target.value,
              school_ids: e.target.value ? [e.target.value] : [],
            })
          }
          className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
          style={{
            background: "rgba(248,248,255,0.8)",
            border: "1px solid rgba(0,151,178,0.2)",
          }}
        >
          <option value="">Select School</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>
              {s.school_name}
            </option>
          ))}
        </select>
      </div>
    );

  if (form.role === "supervisor")
    return (
      <div>
        <label
          className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
          style={{ color: "#0097b2" }}
        >
          Assign to Cluster
        </label>
        <select
          value={form.cluster_id}
          onChange={(e) => setForm({ ...form, cluster_id: e.target.value })}
          className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
          style={{
            background: "rgba(248,248,255,0.8)",
            border: "1px solid rgba(0,151,178,0.2)",
          }}
        >
          <option value="">Select Cluster</option>
          {clusters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.cluster_name}
            </option>
          ))}
        </select>
      </div>
    );

  return null;
};

const UserTable = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("fullname");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");

  // Add modal
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    school_id: "",
    cluster_id: "",
    school_ids: [],
  });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({
    role: "",
    school_id: "",
    cluster_id: "",
    school_ids: [],
  });
  const [editConfirm, setEditConfirm] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(API, { headers });
      setUsers(res.data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await axios.get(SCHOOLS_API, { headers });
      setSchools(res.data);
    } catch {
      setSchools([]);
    }
  };

  const fetchClusters = async () => {
    try {
      const res = await axios.get(CLUSTERS_API, { headers });
      setClusters(res.data);
    } catch {
      setClusters([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchSchools();
    fetchClusters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add
  const openAddModal = () => {
    setAddForm({
      fullname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
      school_id: "",
      cluster_id: "",
      school_ids: [],
    });
    setAddError("");
    setShowPassword(false);
    setShowConfirm(false);
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
    setAddError("");
  };

  const handleAdd = async () => {
    const { fullname, username, password, confirmPassword, role } = addForm;
    if (!fullname || !username || !password || !role)
      return setAddError("All required fields must be filled.");
    if (password !== confirmPassword)
      return setAddError("Passwords do not match.");
    if (password.length < 6)
      return setAddError("Password must be at least 6 characters.");
    if (role === "teacher" && !addForm.school_id)
      return setAddError("Please assign a school.");
    if (
      role === "school_head" &&
      !addForm.school_ids?.[0] &&
      !addForm.school_id
    )
      return setAddError("Please assign a school.");
    if (role === "supervisor" && !addForm.cluster_id)
      return setAddError("Please assign a cluster.");

    setAddLoading(true);
    try {
      await axios.post(API, addForm, { headers });
      await fetchUsers();
      closeAddModal();
    } catch (err) {
      setAddError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setAddLoading(false);
    }
  };

  // Edit
  const openEditModal = (user) => {
    setEditModal(user);
    setEditForm({
      role: user.role || "",
      school_id: user.school_id || "",
      cluster_id: user.cluster_id || "",
      school_ids: (user.schools || []).map((s) => String(s.id)),
    });
    setEditConfirm(false);
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditConfirm(false);
  };

  const handleEdit = async () => {
    const data = editForm;
    if (!data.role) return alert("Please select a role.");
    if (data.role === "teacher" && !data.school_id)
      return alert("Please select a school.");
    if (data.role === "school_head" && !data.school_ids?.[0] && !data.school_id)
      return alert("Please select a school.");
    if (data.role === "supervisor" && !data.cluster_id)
      return alert("Please select a cluster.");

    try {
      await axios.put(`${API}/${editModal.id}/assign`, data, { headers });
      await fetchUsers();
      closeEditModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  // Toggle / Delete
  const handleToggleStatus = async (user) => {
    try {
      await axios.put(`${API}/${user.id}/status`, {}, { headers });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/${deleteModal.id}`, { headers });
      await fetchUsers();
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  // Sort + Filter
  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const filteredUsers = useMemo(() => {
    return activeTab === "all"
      ? users
      : users.filter((u) => u.role === activeTab);
  }, [users, activeTab]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const paginated = sortedUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronUp size={13} className="text-gray-300" />;
    return sortOrder === "asc" ? (
      <ChevronUp size={13} style={{ color: "#0097b2" }} />
    ) : (
      <ChevronDown size={13} style={{ color: "#0097b2" }} />
    );
  };

  const SortableTh = ({ field, label }) => (
    <th
      className="px-4 py-3 cursor-pointer select-none hover:bg-gray-50 transition text-xs font-semibold uppercase tracking-wider text-gray-500"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <SortIcon field={field} />
      </div>
    </th>
  );

  // Tab counts
  const tabCount = (role) =>
    role === "all" ? users.length : users.filter((u) => u.role === role).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Role Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {roleTabs.map((tab) => {
          const isActive = activeTab === tab;
          const badge = roleBadge[tab];
          return (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition"
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, #0097b2, #004385)",
                      color: "white",
                      boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
                    }
                  : {
                      background: "white",
                      color: "#242424",
                      border: "1px solid rgba(0,151,178,0.2)",
                    }
              }
            >
              {tab === "all" ? "All" : tab.replace("_", " ")}
              <span
                className="px-1.5 py-0.5 rounded-full text-xs"
                style={
                  isActive
                    ? { background: "rgba(255,255,255,0.25)", color: "white" }
                    : {
                        background: badge ? badge.bg : "rgba(0,0,0,0.05)",
                        color: badge ? badge.color : "#666",
                      }
                }
              >
                {tabCount(tab)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div
        className="rounded-2xl"
        style={{ background: "white", border: "1px solid rgba(0,151,178,0.1)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-black text-[#242424]">All Users</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {filteredUsers.length}{" "}
              {activeTab === "all"
                ? "total users"
                : activeTab.replace("_", " ") + "s"}
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #0097b2, #004385)",
              boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
            }}
          >
            <PlusCircle size={15} />
            Add User
          </button>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead style={{ background: "rgba(248,248,255,0.8)" }}>
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  #
                </th>
                <SortableTh field="fullname" label="Full Name" />
                <SortableTh field="username" label="Username" />
                <SortableTh field="email" label="Email" />
                <SortableTh field="role" label="Role" />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Assignment
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">
                  Status
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-gray-400 animate-pulse text-sm"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-10 text-gray-400 text-sm"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                paginated.map((user, index) => {
                  const badge = roleBadge[user.role] || {
                    bg: "rgba(0,0,0,0.05)",
                    border: "rgba(0,0,0,0.1)",
                    color: "#666",
                  };
                  const unassigned = isUnassigned(user);
                  return (
                    <tr
                      key={user.id}
                      className="border-t border-gray-50 hover:bg-gray-50/50 transition"
                      style={
                        unassigned
                          ? { background: "rgba(251,146,60,0.03)" }
                          : {}
                      }
                    >
                      <td className="px-4 py-3 text-gray-400 text-xs">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{
                              background:
                                "linear-gradient(135deg, #0097b2, #004385)",
                            }}
                          >
                            {user.fullname?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-[#242424] leading-none">
                              {user.fullname || "—"}
                            </p>
                            {unassigned && (
                              <p className="text-xs text-orange-400 mt-0.5 flex items-center gap-1">
                                <AlertCircle size={10} /> Unassigned
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {user.username}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {user.email || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: badge.bg,
                            border: `1px solid ${badge.border}`,
                            color: badge.color,
                          }}
                        >
                          {user.role?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <SchoolAssignment user={user} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            user.is_active
                              ? "bg-green-50 text-green-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 rounded-lg transition hover:scale-105"
                            style={{
                              background: "rgba(0,151,178,0.08)",
                              color: "#0097b2",
                            }}
                            title="Edit Assignment"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1.5 rounded-lg transition hover:scale-105 ${
                              user.is_active
                                ? "bg-yellow-50 text-yellow-500"
                                : "bg-green-50 text-green-500"
                            }`}
                            title={user.is_active ? "Deactivate" : "Activate"}
                          >
                            {user.is_active ? (
                              <UserX size={14} />
                            ) : (
                              <UserCheck size={14} />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteModal(user)}
                            className="p-1.5 rounded-lg bg-red-50 text-red-500 transition hover:scale-105"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100 text-sm text-gray-500">
            <p className="text-xs">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, sortedUsers.length)} of{" "}
              {sortedUsers.length}
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1,
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
                      className="px-3 py-1 rounded-lg border text-xs transition"
                      style={
                        currentPage === p
                          ? {
                              background:
                                "linear-gradient(135deg, #0097b2, #004385)",
                              color: "white",
                              border: "none",
                            }
                          : { borderColor: "#e5e7eb" }
                      }
                    >
                      {p}
                    </button>
                  ),
                )}
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Add User Modal ── */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-black text-[#242424]">
                  Add New User
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Create and assign in one step
                </p>
              </div>
              <button
                onClick={closeAddModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {addError && (
              <div
                className="mb-4 p-3 rounded-xl text-sm text-red-600"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {addError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {[
                {
                  label: "Full Name",
                  key: "fullname",
                  type: "text",
                  placeholder: "e.g. Juan Dela Cruz",
                },
                {
                  label: "Username",
                  key: "username",
                  type: "text",
                  placeholder: "e.g. juandelacruz",
                },
                {
                  label: "Email",
                  key: "email",
                  type: "email",
                  placeholder: "e.g. juan@email.com",
                  optional: true,
                },
              ].map(({ label, key, type, placeholder, optional }) => (
                <div key={key}>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                    style={{ color: "#0097b2" }}
                  >
                    {label}{" "}
                    {optional && (
                      <span className="text-gray-300 normal-case font-normal">
                        (optional)
                      </span>
                    )}
                  </label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={addForm[key]}
                    onChange={(e) =>
                      setAddForm({ ...addForm, [key]: e.target.value })
                    }
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                    style={{
                      background: "rgba(248,248,255,0.8)",
                      border: "1px solid rgba(0,151,178,0.2)",
                    }}
                  />
                </div>
              ))}

              {/* Role */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  Role
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) =>
                    setAddForm({
                      ...addForm,
                      role: e.target.value,
                      school_id: "",
                      cluster_id: "",
                      school_ids: [],
                    })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="school_head">School Head</option>
                  <option value="teacher">Teacher</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>

              {/* Assignment */}
              {addForm.role && addForm.role !== "admin" && (
                <AssignmentFields
                  form={addForm}
                  setForm={setAddForm}
                  schools={schools}
                  clusters={clusters}
                />
              )}

              {/* Password */}
              {[
                {
                  label: "Password",
                  key: "password",
                  show: showPassword,
                  toggle: () => setShowPassword(!showPassword),
                  placeholder: "Min. 6 characters",
                },
                {
                  label: "Confirm Password",
                  key: "confirmPassword",
                  show: showConfirm,
                  toggle: () => setShowConfirm(!showConfirm),
                  placeholder: "Re-enter password",
                },
              ].map(({ label, key, show, toggle, placeholder }) => (
                <div key={key}>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                    style={{ color: "#0097b2" }}
                  >
                    {label}
                  </label>
                  <div className="relative">
                    <input
                      type={show ? "text" : "password"}
                      placeholder={placeholder}
                      value={addForm[key]}
                      onChange={(e) =>
                        setAddForm({ ...addForm, [key]: e.target.value })
                      }
                      className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424] pr-10"
                      style={{
                        background: "rgba(248,248,255,0.8)",
                        border: "1px solid rgba(0,151,178,0.2)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={addLoading}
                className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                {addLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit User Modal ── */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-black text-[#242424]">
                  Edit Assignment
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editModal.fullname}
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Info */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-4"
              style={{
                background: "rgba(0,151,178,0.06)",
                border: "1px solid rgba(0,151,178,0.15)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                {editModal.fullname?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#242424]">
                  {editModal.fullname}
                </p>
                <p className="text-xs text-gray-400">{editModal.username}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Role */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  Role
                </label>
                <select
                  value={editForm.role}
                  onChange={(e) =>
                    setEditForm({
                      role: e.target.value,
                      school_id: "",
                      cluster_id: "",
                      school_ids: [],
                    })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="school_head">School Head</option>
                  <option value="teacher">Teacher</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>

              {/* Assignment */}
              {editForm.role && editForm.role !== "admin" && (
                <AssignmentFields
                  form={editForm}
                  setForm={setEditForm}
                  schools={schools}
                  clusters={clusters}
                />
              )}
            </div>

            <div
              className="h-px w-full rounded-full my-4"
              style={{
                background:
                  "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
              }}
            />

            {!editConfirm ? (
              <div className="flex justify-end gap-2">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setEditConfirm(true)}
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
                    onClick={() => setEditConfirm(false)}
                    className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-xs"
                  >
                    Go Back
                  </button>
                  <button
                    onClick={handleEdit}
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
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-black text-[#242424]">
                Delete User
              </h2>
              <button
                onClick={() => setDeleteModal(null)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              You are about to permanently delete:
            </p>
            <p className="font-bold text-[#242424] mb-1">
              {deleteModal.fullname}
            </p>
            <p className="text-xs text-gray-400 mb-1">{deleteModal.username}</p>
            <p className="text-sm text-red-500 mb-5 mt-3">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModal(null)}
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

export default UserTable;
