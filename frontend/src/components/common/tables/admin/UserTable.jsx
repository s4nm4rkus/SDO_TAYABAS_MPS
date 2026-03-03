import { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import AssignDrawer from "../../drawer/admin/AssignDrawer";
import axios from "axios";

const API = "http://localhost:5000/api/users";
const SCHOOLS_API = "http://localhost:5000/api/schools";
const CLUSTERS_API = "http://localhost:5000/api/clusters";
const ITEMS_PER_PAGE = 10;

const token = localStorage.getItem("token");
const headers = { Authorization: `Bearer ${token}` };

const roleBadge = {
  admin: "bg-red-100 text-red-700",
  school_head: "bg-blue-100 text-blue-700",
  teacher: "bg-green-100 text-green-700",
  supervisor: "bg-purple-100 text-purple-700",
};

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("fullname");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);

  // Register modal
  const [registerModal, setRegisterModal] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);

  // Assign drawer
  const [drawer, setDrawer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [assignForm, setAssignForm] = useState({
    role: "",
    school_id: "",
    cluster_id: "",
  });
  const [confirm, setConfirm] = useState(false);

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
  }, []);

  // Register handlers
  const openRegisterModal = () => {
    setRegisterForm({
      fullname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "",
    });
    setRegisterError("");
    setRegisterModal(true);
  };

  const closeRegisterModal = () => {
    setRegisterModal(false);
    setRegisterError("");
  };

  const handleRegister = async () => {
    const { fullname, username, password, confirmPassword, role } =
      registerForm;

    if (!fullname || !username || !password || !role)
      return setRegisterError("All fields are required.");

    if (password !== confirmPassword)
      return setRegisterError("Passwords do not match.");

    if (password.length < 6)
      return setRegisterError("Password must be at least 6 characters.");

    setRegisterLoading(true);
    try {
      await axios.post(API, registerForm, { headers });
      await fetchUsers();
      closeRegisterModal();
    } catch (err) {
      setRegisterError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setRegisterLoading(false);
    }
  };

  // Assign handlers
  const openDrawer = (user) => {
    setSelected(user);
    setAssignForm({
      role: user.role || "",
      school_id: user.school_id || "",
      cluster_id: user.cluster_id || "",
    });
    setConfirm(false);
    setDrawer(true);
  };

  const closeDrawer = () => {
    setDrawer(false);
    setSelected(null);
    setAssignForm({ role: "", school_id: "", cluster_id: "" });
    setConfirm(false);
  };

  const handleAssign = async () => {
    if (!assignForm.role) return alert("Please select a role.");

    if (
      (assignForm.role === "teacher" || assignForm.role === "school_head") &&
      !assignForm.school_id
    )
      return alert("Please select a school.");

    if (assignForm.role === "supervisor" && !assignForm.cluster_id)
      return alert("Please select a cluster.");

    try {
      await axios.put(`${API}/${selected.id}/assign`, assignForm, { headers });
      await fetchUsers();
      closeDrawer();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  // Toggle status
  const handleToggleStatus = async (user) => {
    try {
      await axios.put(`${API}/${user.id}/status`, {}, { headers });
      await fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  // Delete handlers
  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/${deleteModal.id}`, { headers });
      await fetchUsers();
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  // Sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedUsers.length / ITEMS_PER_PAGE);
  const paginated = sortedUsers.slice(
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
    <div
      className={`bg-white rounded-lg shadow-md p-4 transition-all duration-500 ease-in-out ${drawer && selected ? "mr-80" : "mr-0"}`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            User Management
          </h2>
          <p className="text-xs text-gray-400">{users.length} total users</p>
        </div>
        <button
          onClick={openRegisterModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
        >
          <PlusCircle size={16} />
          Add User
        </button>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">#</th>
              <SortableTh field="fullname" label="Full Name" />
              <SortableTh field="username" label="Username" />
              <SortableTh field="email" label="Email" />
              <SortableTh field="role" label="Role" />
              <th className="px-4 py-3">School / Cluster</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-6 text-gray-400 animate-pulse"
                >
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              paginated.map((user, index) => (
                <tr
                  key={user.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {user.fullname}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.username}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {user.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${roleBadge[user.role] || "bg-gray-100 text-gray-600"}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">
                    {user.school_name || user.cluster_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => openDrawer(user)}
                        className="p-1.5 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition"
                        title="Assign"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-1.5 rounded transition ${user.is_active ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                        title={user.is_active ? "Deactivate" : "Activate"}
                      >
                        {user.is_active ? (
                          <UserX size={15} />
                        ) : (
                          <UserCheck size={15} />
                        )}
                      </button>
                      <button
                        onClick={() => setDeleteModal(user)}
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
            {Math.min(currentPage * ITEMS_PER_PAGE, users.length)} of{" "}
            {users.length}
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
                    className={`px-3 py-1 rounded border text-sm transition ${
                      currentPage === p
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-gray-100"
                    }`}
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
      {/* Register Modal */}
      {registerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-700">
                Add New User
              </h2>
              <button
                onClick={closeRegisterModal}
                className="hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error */}
            {registerError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
                {registerError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Juan Dela Cruz"
                  value={registerForm.fullname}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      fullname: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Username
                </label>
                <input
                  type="text"
                  placeholder="e.g. juandelacruz"
                  value={registerForm.username}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      username: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Email <span className="text-gray-300">(optional)</span>
                </label>
                <input
                  type="email"
                  placeholder="e.g. juan@email.com"
                  value={registerForm.email}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, email: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Role</label>
                <select
                  value={registerForm.role}
                  onChange={(e) =>
                    setRegisterForm({ ...registerForm, role: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="school_head">School Head</option>
                  <option value="teacher">Teacher</option>
                  <option value="supervisor">Supervisor</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Min. 6 characters"
                  value={registerForm.password}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      password: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={registerForm.confirmPassword}
                  onChange={(e) =>
                    setRegisterForm({
                      ...registerForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={closeRegisterModal}
                className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRegister}
                disabled={registerLoading}
                style={{ transition: "transform 0.7s ease-in-out" }}
                className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {registerLoading ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      <AssignDrawer
        drawer={drawer}
        selected={selected}
        assignForm={assignForm}
        setAssignForm={setAssignForm}
        schools={schools}
        clusters={clusters}
        confirm={confirm}
        setConfirm={setConfirm}
        onClose={closeDrawer}
        onSave={handleAssign}
      />
      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold">Delete User</h2>
              <button
                onClick={() => setDeleteModal(null)}
                className="hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              You are about to permanently delete:
            </p>
            <p className="font-semibold text-gray-800 mb-4">
              {deleteModal.fullname}
            </p>
            <p className="text-sm text-red-500 mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteModal(null)}
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
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
