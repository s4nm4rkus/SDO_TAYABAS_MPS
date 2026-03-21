import { useState, useEffect, useMemo } from "react";
import {
  Users,
  School,
  UserCheck,
  UserX,
  ChevronUp,
  ChevronDown,
  Search,
  PlusCircle,
  X,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  UserMinus,
} from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api/supervisor/school-heads";
const DASH_API = "http://localhost:5000/api/supervisor/dashboard";

const FormField = ({
  label,
  keyName,
  type = "text",
  placeholder,
  optional,
  form,
  setForm,
}) => (
  <div>
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
      value={form[keyName]}
      onChange={(e) => setForm({ ...form, [keyName]: e.target.value })}
      className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
      style={{
        background: "rgba(248,248,255,0.8)",
        border: "1px solid rgba(0,151,178,0.2)",
      }}
    />
  </div>
);

const PasswordField = ({
  label,
  keyName,
  show,
  toggle,
  placeholder,
  form,
  setForm,
}) => (
  <div>
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
        value={form[keyName]}
        onChange={(e) => setForm({ ...form, [keyName]: e.target.value })}
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
);

const SupervisorSchoolHeadList = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [schoolHeads, setSchoolHeads] = useState([]);
  const [clusterSchools, setClusterSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("fullname");
  const [sortOrder, setSortOrder] = useState("asc");

  // Add modal
  const [addModal, setAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    school_id: "",
  });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [showAddPw, setShowAddPw] = useState(false);
  const [showAddConfirm, setShowAddConfirm] = useState(false);

  // Edit modal
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    school_id: "",
  });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [showEditPw, setShowEditPw] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // Delete + Unassign
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [unassignModal, setUnassignModal] = useState(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const fetchData = async () => {
    try {
      const [shRes, dashRes] = await Promise.all([
        axios.get(API, { headers }),
        axios.get(DASH_API, { headers }),
      ]);
      setSchoolHeads(shRes.data);
      setClusterSchools(dashRes.data.schools || []);
    } catch {
      setSchoolHeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = schoolHeads.length;
  const assigned = schoolHeads.filter((sh) => sh.school_id).length;
  const unassigned = total - assigned;

  const filtered = useMemo(() => {
    let result = [...schoolHeads];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (sh) =>
          sh.fullname?.toLowerCase().includes(q) ||
          sh.username?.toLowerCase().includes(q) ||
          sh.school_name?.toLowerCase().includes(q),
      );
    }
    if (filterStatus === "assigned")
      result = result.filter((sh) => sh.school_id);
    else if (filterStatus === "unassigned")
      result = result.filter((sh) => !sh.school_id);
    return result.sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [schoolHeads, search, filterStatus, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronUp size={12} className="text-gray-300" />;
    return sortOrder === "asc" ? (
      <ChevronUp size={12} style={{ color: "#0097b2" }} />
    ) : (
      <ChevronDown size={12} style={{ color: "#0097b2" }} />
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

  // ── Add ──
  const openAdd = () => {
    setAddForm({
      fullname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      school_id: "",
    });
    setAddError("");
    setShowAddPw(false);
    setShowAddConfirm(false);
    setAddModal(true);
  };

  const handleCreate = async () => {
    const { fullname, username, password, confirmPassword } = addForm;
    if (!fullname || !username || !password)
      return setAddError("Full name, username and password are required.");
    if (password !== confirmPassword)
      return setAddError("Passwords do not match.");
    if (password.length < 6)
      return setAddError("Password must be at least 6 characters.");
    setAddLoading(true);
    try {
      await axios.post(API, addForm, { headers });
      await fetchData();
      setAddModal(false);
    } catch (err) {
      setAddError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setAddLoading(false);
    }
  };

  // ── Edit ──
  const openEdit = (sh) => {
    setEditModal(sh);
    setEditForm({
      fullname: sh.fullname || "",
      username: sh.username || "",
      email: sh.email || "",
      password: "",
      confirmPassword: "",
      school_id: sh.school_id ? String(sh.school_id) : "",
    });
    setEditError("");
    setShowEditPw(false);
    setShowEditConfirm(false);
  };

  const handleUpdate = async () => {
    const { fullname, username, password, confirmPassword } = editForm;
    if (!fullname || !username)
      return setEditError("Full name and username are required.");
    if (password && password !== confirmPassword)
      return setEditError("Passwords do not match.");
    if (password && password.length < 6)
      return setEditError("Password must be at least 6 characters.");
    setEditLoading(true);
    try {
      await axios.put(`${API}/${editModal.id}`, editForm, { headers });
      await fetchData();
      setEditModal(null);
    } catch (err) {
      setEditError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${API}/${deleteModal.id}`, { headers });
      await fetchData();
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Unassign ──
  const handleUnassign = async () => {
    setUnassignLoading(true);
    try {
      await axios.put(`${API}/${unassignModal.id}/unassign`, {}, { headers });
      await fetchData();
      setUnassignModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setUnassignLoading(false);
    }
  };

  // School dropdown — reused in both modals
  const SchoolDropdown = ({ value, onChange }) => (
    <div>
      <label
        className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
        style={{ color: "#0097b2" }}
      >
        Assign to School{" "}
        <span className="text-gray-300 normal-case font-normal">
          (optional)
        </span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
        style={{
          background: "rgba(248,248,255,0.8)",
          border: "1px solid rgba(0,151,178,0.2)",
        }}
      >
        <option value="">No school (Unassigned)</option>
        {clusterSchools.map((s) => (
          <option key={s.id} value={s.id}>
            {s.school_name}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">
            School Head List
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage school heads in your cluster
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {[
            {
              label: "Total",
              value: total,
              icon: <Users size={18} className="text-white" />,
              bg: "linear-gradient(135deg, #0097b2, #004385)",
              shadow: "rgba(0,151,178,0.35)",
            },
            {
              label: "Assigned",
              value: assigned,
              icon: <UserCheck size={18} className="text-white" />,
              bg: "linear-gradient(135deg, #10b981, #059669)",
              shadow: "rgba(16,185,129,0.35)",
            },
            {
              label: "Unassigned",
              value: unassigned,
              icon: <UserX size={18} className="text-white" />,
              bg: "linear-gradient(135deg, #f97316, #fb923c)",
              shadow: "rgba(249,115,22,0.35)",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{
                background: card.bg,
                boxShadow: `0 6px 18px ${card.shadow}`,
              }}
            >
              <div className="p-1.5 rounded-lg bg-white/20">{card.icon}</div>
              <div>
                <p className="text-xl font-black text-white leading-none">
                  {loading ? "..." : card.value}
                </p>
                <p className="text-xs text-white/80 tracking-wider uppercase mt-0.5">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm rounded-xl transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #0097b2, #004385)",
              boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
            }}
          >
            <PlusCircle size={15} />
            Add School Head
          </button>
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        className="h-px w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search school head or school..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#242424]"
            style={{
              background: "white",
              border: "1px solid rgba(0,151,178,0.2)",
            }}
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "assigned", label: "Assigned" },
            { value: "unassigned", label: "Unassigned" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold transition"
              style={
                filterStatus === f.value
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
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid rgba(0,151,178,0.1)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead style={{ background: "rgba(248,248,255,0.8)" }}>
              <tr>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  #
                </th>
                <SortableTh field="fullname" label="School Head" />
                <SortableTh field="school_name" label="School" />
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
                    colSpan={5}
                    className="text-center py-10 text-gray-400 animate-pulse text-sm"
                  >
                    Loading school heads...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No school heads found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((sh, index) => (
                  <tr
                    key={sh.id}
                    className="border-t border-gray-50 hover:bg-gray-50/50 transition"
                  >
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {index + 1}
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
                          {sh.fullname?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#242424] leading-none">
                            {sh.fullname}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {sh.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {sh.school_name ? (
                        <div className="flex items-center gap-1.5">
                          <School size={13} style={{ color: "#0097b2" }} />
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              background: "rgba(0,151,178,0.08)",
                              border: "1px solid rgba(0,151,178,0.2)",
                              color: "#0097b2",
                            }}
                          >
                            {sh.school_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-orange-400 flex items-center gap-1">
                          <UserX size={12} /> No school
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {sh.school_id ? (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600">
                          Assigned
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-500">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openEdit(sh)}
                          className="p-1.5 rounded-lg transition hover:scale-105"
                          style={{
                            background: "rgba(0,151,178,0.08)",
                            color: "#0097b2",
                          }}
                          title="Edit"
                        >
                          <Pencil size={13} />
                        </button>
                        {sh.school_id && (
                          <button
                            onClick={() => setUnassignModal(sh)}
                            className="p-1.5 rounded-lg transition hover:scale-105"
                            style={{
                              background: "rgba(245,158,11,0.08)",
                              color: "#f59e0b",
                            }}
                            title="Unassign from school"
                          >
                            <UserMinus size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteModal(sh)}
                          className="p-1.5 rounded-lg transition hover:scale-105"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            color: "#ef4444",
                          }}
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Showing {filtered.length} of {total} school heads
            </p>
          </div>
        )}
      </div>

      {/* ── Add Modal ── */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-black text-[#242424]">
                  Add School Head
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Create a school head account
                </p>
              </div>
              <button
                onClick={() => setAddModal(false)}
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

            <div className="flex flex-col gap-4">
              <FormField
                label="Full Name"
                keyName="fullname"
                placeholder="e.g. Juan Dela Cruz"
                form={addForm}
                setForm={setAddForm}
              />
              <FormField
                label="Username"
                keyName="username"
                placeholder="e.g. juandelacruz"
                form={addForm}
                setForm={setAddForm}
              />
              <FormField
                label="Email"
                keyName="email"
                type="email"
                placeholder="e.g. juan@email.com"
                optional
                form={addForm}
                setForm={setAddForm}
              />
              <PasswordField
                label="Password"
                keyName="password"
                show={showAddPw}
                toggle={() => setShowAddPw(!showAddPw)}
                placeholder="Min. 6 characters"
                form={addForm}
                setForm={setAddForm}
              />
              <PasswordField
                label="Confirm Password"
                keyName="confirmPassword"
                show={showAddConfirm}
                toggle={() => setShowAddConfirm(!showAddConfirm)}
                placeholder="Re-enter password"
                form={addForm}
                setForm={setAddForm}
              />
              <SchoolDropdown
                value={addForm.school_id}
                onChange={(val) => setAddForm({ ...addForm, school_id: val })}
              />
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setAddModal(false)}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={addLoading}
                className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                {addLoading ? "Creating..." : "Create School Head"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-black text-[#242424]">
                  Edit School Head
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update school head account
                </p>
              </div>
              <button
                onClick={() => setEditModal(null)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Badge */}
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
                {editModal.fullname?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#242424]">
                  {editModal.fullname}
                </p>
                <p className="text-xs text-gray-400">{editModal.username}</p>
              </div>
            </div>

            {editError && (
              <div
                className="mb-4 p-3 rounded-xl text-sm text-red-600"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {editError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <FormField
                label="Full Name"
                keyName="fullname"
                placeholder="e.g. Juan Dela Cruz"
                form={editForm}
                setForm={setEditForm}
              />
              <FormField
                label="Username"
                keyName="username"
                placeholder="e.g. juandelacruz"
                form={editForm}
                setForm={setEditForm}
              />
              <FormField
                label="Email"
                keyName="email"
                type="email"
                placeholder="e.g. juan@email.com"
                optional
                form={editForm}
                setForm={setEditForm}
              />
              <SchoolDropdown
                value={editForm.school_id}
                onChange={(val) => setEditForm({ ...editForm, school_id: val })}
              />
              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3">
                  Leave password blank to keep existing.
                </p>
                <div className="flex flex-col gap-4">
                  <PasswordField
                    label="New Password"
                    keyName="password"
                    show={showEditPw}
                    toggle={() => setShowEditPw(!showEditPw)}
                    placeholder="Min. 6 characters"
                    form={editForm}
                    setForm={setEditForm}
                  />
                  <PasswordField
                    label="Confirm New Password"
                    keyName="confirmPassword"
                    show={showEditConfirm}
                    toggle={() => setShowEditConfirm(!showEditConfirm)}
                    placeholder="Re-enter new password"
                    form={editForm}
                    setForm={setEditForm}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={editLoading}
                className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Unassign Modal ── */}
      {unassignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(245,158,11,0.1)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <UserMinus size={22} className="text-yellow-500" />
            </div>
            <h2 className="text-base font-black text-[#242424] text-center mb-1">
              Unassign School Head
            </h2>
            <p className="text-sm text-gray-400 text-center mb-4">
              Remove school assignment from this account?
            </p>
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-3"
              style={{
                background: "rgba(245,158,11,0.06)",
                border: "1px solid rgba(245,158,11,0.2)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                {unassignModal.fullname?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-[#242424]">
                  {unassignModal.fullname}
                </p>
                <p className="text-xs text-gray-400">
                  Currently at{" "}
                  <span className="font-semibold text-[#242424]">
                    {unassignModal.school_name}
                  </span>
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mb-5">
              The account will remain but will no longer be assigned to any
              school.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setUnassignModal(null)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleUnassign}
                disabled={unassignLoading}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  boxShadow: "0 4px 12px rgba(245,158,11,0.3)",
                }}
              >
                {unassignLoading ? "Unassigning..." : "Yes, Unassign"}
              </button>
            </div>
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
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h2 className="text-base font-black text-[#242424] text-center mb-1">
              Delete School Head
            </h2>
            <p className="text-sm text-gray-400 text-center mb-4">
              Permanently delete this account?
            </p>
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-3"
              style={{
                background: "rgba(239,68,68,0.04)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                {deleteModal.fullname?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-[#242424]">
                  {deleteModal.fullname}
                </p>
                <p className="text-xs text-gray-400">{deleteModal.username}</p>
              </div>
            </div>
            {deleteModal.school_name && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <School size={13} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-500">
                  Currently assigned to{" "}
                  <span className="font-bold">{deleteModal.school_name}</span>.
                  Deleting will remove this assignment.
                </p>
              </div>
            )}
            <p className="text-xs text-red-400 text-center mb-5">
              This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteModal(null)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl text-white font-semibold transition hover:opacity-90 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
                }}
              >
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorSchoolHeadList;
