import { useState, useEffect, useMemo } from "react";
import {
  Users,
  School,
  BookOpen,
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

const API = "http://localhost:5000/api/sections/teacher-list";
const CREATE_API = "http://localhost:5000/api/sections/teachers/create";
const UPDATE_API = "http://localhost:5000/api/sections/teachers";
const SCHOOLS_API = "http://localhost:5000/api/sections/schools";

// ── Reusable form fields ──
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

const TeacherList = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [teachers, setTeachers] = useState([]);
  const [assignedSchools, setAssignedSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSchool, setFilterSchool] = useState("all");
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
  const [showAddPassword, setShowAddPassword] = useState(false);
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
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [showEditConfirm, setShowEditConfirm] = useState(false);

  // Delete modal
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Unassign modal
  const [unassignModal, setUnassignModal] = useState(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(API, { headers });
      setTeachers(res.data);
    } catch {
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await axios.get(SCHOOLS_API, { headers });
      setAssignedSchools(res.data);
    } catch {
      setAssignedSchools([]);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Add handlers ──
  const openAddModal = () => {
    setAddForm({
      fullname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      school_id:
        assignedSchools.length === 1 ? String(assignedSchools[0].id) : "",
    });
    setAddError("");
    setShowAddPassword(false);
    setShowAddConfirm(false);
    setAddModal(true);
  };

  const closeAddModal = () => {
    setAddModal(false);
    setAddError("");
  };

  const handleCreate = async () => {
    const { fullname, username, password, confirmPassword } = addForm;
    if (!fullname || !username || !password)
      return setAddError("Full name, username and password are required.");
    if (password !== confirmPassword)
      return setAddError("Passwords do not match.");
    if (password.length < 6)
      return setAddError("Password must be at least 6 characters.");
    if (assignedSchools.length > 1 && !addForm.school_id)
      return setAddError("Please select a school.");

    setAddLoading(true);
    try {
      await axios.post(CREATE_API, addForm, { headers });
      await fetchTeachers();
      closeAddModal();
    } catch (err) {
      setAddError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setAddLoading(false);
    }
  };

  // ── Edit handlers ──
  const openEditModal = (teacher) => {
    setEditModal(teacher);
    setEditForm({
      fullname: teacher.fullname || "",
      username: teacher.username || "",
      email: teacher.email || "",
      password: "",
      confirmPassword: "",
      school_id: String(teacher.school_id || ""),
    });
    setEditError("");
    setShowEditPassword(false);
    setShowEditConfirm(false);
  };

  const closeEditModal = () => {
    setEditModal(null);
    setEditError("");
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
      await axios.put(`${UPDATE_API}/${editModal.id}`, editForm, { headers });
      await fetchTeachers();
      closeEditModal();
    } catch (err) {
      setEditError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setEditLoading(false);
    }
  };

  // ── Delete handler ──
  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`${UPDATE_API}/${deleteModal.id}`, { headers });
      await fetchTeachers();
      setDeleteModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Unassign handler ──
  const handleUnassign = async () => {
    setUnassignLoading(true);
    try {
      await axios.put(
        `${UPDATE_API}/${unassignModal.id}/unassign`,
        {},
        { headers },
      );
      await fetchTeachers();
      setUnassignModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    } finally {
      setUnassignLoading(false);
    }
  };

  // ── Filter + Sort ──
  const schools = useMemo(() => {
    const unique = [
      ...new Map(teachers.map((t) => [t.school_id, t.school_name])).entries(),
    ];
    return unique.map(([id, name]) => ({ id, name }));
  }, [teachers]);

  const total = teachers.length;
  const assigned = teachers.filter((t) => t.section_id).length;
  const unassigned = total - assigned;

  const filtered = useMemo(() => {
    let result = [...teachers];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.fullname?.toLowerCase().includes(q) ||
          t.username?.toLowerCase().includes(q) ||
          t.section_name?.toLowerCase().includes(q),
      );
    }
    if (filterSchool !== "all")
      result = result.filter((t) => String(t.school_id) === filterSchool);
    if (filterStatus === "assigned")
      result = result.filter((t) => t.section_id);
    else if (filterStatus === "unassigned")
      result = result.filter((t) => !t.section_id);

    return result.sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [teachers, search, filterSchool, filterStatus, sortField, sortOrder]);

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

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">Teacher List</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage teachers assigned to your school(s)
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
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 text-white text-sm rounded-xl transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #0097b2, #004385)",
              boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
            }}
          >
            <PlusCircle size={15} />
            Add Teacher
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
            placeholder="Search teacher or section..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#242424]"
            style={{
              background: "white",
              border: "1px solid rgba(0,151,178,0.2)",
            }}
          />
        </div>
        {schools.length > 1 && (
          <select
            value={filterSchool}
            onChange={(e) => setFilterSchool(e.target.value)}
            className="rounded-xl px-4 py-2.5 text-sm text-[#242424]"
            style={{
              background: "white",
              border: "1px solid rgba(0,151,178,0.2)",
            }}
          >
            <option value="all">All Schools</option>
            {schools.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.name}
              </option>
            ))}
          </select>
        )}
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
                <SortableTh field="fullname" label="Teacher" />
                <SortableTh field="school_name" label="School" />
                <SortableTh field="section_name" label="Section" />
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Grade Level
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
                    colSpan={7}
                    className="text-center py-10 text-gray-400 animate-pulse text-sm"
                  >
                    Loading teachers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    <Users size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No teachers found.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((teacher, index) => (
                  <tr
                    key={teacher.id}
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
                          {teacher.fullname?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#242424] leading-none">
                            {teacher.fullname}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {teacher.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <School size={13} style={{ color: "#0097b2" }} />
                        <span className="text-xs text-gray-600">
                          {teacher.school_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {teacher.section_name ? (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: "rgba(0,151,178,0.08)",
                            border: "1px solid rgba(0,151,178,0.2)",
                            color: "#0097b2",
                          }}
                        >
                          {teacher.section_name}
                        </span>
                      ) : (
                        <span className="text-xs text-orange-400 flex items-center gap-1">
                          <UserX size={12} /> No section
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {teacher.grade_name ? (
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={13} className="text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {teacher.grade_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {teacher.section_id ? (
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
                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(teacher)}
                          className="p-1.5 rounded-lg transition hover:scale-105"
                          style={{
                            background: "rgba(0,151,178,0.08)",
                            color: "#0097b2",
                          }}
                          title="Edit Teacher"
                        >
                          <Pencil size={13} />
                        </button>

                        {/* Unassign — only if assigned */}
                        {teacher.section_id && (
                          <button
                            onClick={() => setUnassignModal(teacher)}
                            className="p-1.5 rounded-lg transition hover:scale-105"
                            style={{
                              background: "rgba(245,158,11,0.08)",
                              color: "#f59e0b",
                            }}
                            title="Unassign from Section"
                          >
                            <UserMinus size={13} />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteModal(teacher)}
                          className="p-1.5 rounded-lg transition hover:scale-105"
                          style={{
                            background: "rgba(239,68,68,0.08)",
                            color: "#ef4444",
                          }}
                          title="Delete Teacher"
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
              Showing {filtered.length} of {total} teachers
            </p>
          </div>
        )}
      </div>

      {/* ── Add Teacher Modal ── */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-black text-[#242424]">
                  Add Teacher
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Create a teacher account for your school
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

            <div className="flex flex-col gap-4">
              {assignedSchools.length > 1 ? (
                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                    style={{ color: "#0097b2" }}
                  >
                    School
                  </label>
                  <select
                    value={addForm.school_id}
                    onChange={(e) =>
                      setAddForm({ ...addForm, school_id: e.target.value })
                    }
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                    style={{
                      background: "rgba(248,248,255,0.8)",
                      border: "1px solid rgba(0,151,178,0.2)",
                    }}
                  >
                    <option value="">Select School</option>
                    {assignedSchools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.school_name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                assignedSchools.length === 1 && (
                  <div
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                    style={{
                      background: "rgba(0,151,178,0.06)",
                      border: "1px solid rgba(0,151,178,0.15)",
                    }}
                  >
                    <School size={14} style={{ color: "#0097b2" }} />
                    <div>
                      <p className="text-xs text-gray-400">Assigning to</p>
                      <p className="text-sm font-black text-[#242424]">
                        {assignedSchools[0].school_name}
                      </p>
                    </div>
                  </div>
                )
              )}

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
                show={showAddPassword}
                toggle={() => setShowAddPassword(!showAddPassword)}
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
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeAddModal}
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
                {addLoading ? "Creating..." : "Create Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Teacher Modal ── */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-black text-[#242424]">
                  Edit Teacher
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Update teacher account information
                </p>
              </div>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

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
                <p className="text-xs text-gray-400">{editModal.school_name}</p>
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
              {assignedSchools.length > 1 && (
                <div>
                  <label
                    className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                    style={{ color: "#0097b2" }}
                  >
                    School
                  </label>
                  <select
                    value={editForm.school_id}
                    onChange={(e) =>
                      setEditForm({ ...editForm, school_id: e.target.value })
                    }
                    className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                    style={{
                      background: "rgba(248,248,255,0.8)",
                      border: "1px solid rgba(0,151,178,0.2)",
                    }}
                  >
                    {assignedSchools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.school_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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

              <div className="pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-3">
                  Leave password blank to keep existing password.
                </p>
                <div className="flex flex-col gap-4">
                  <PasswordField
                    label="New Password"
                    keyName="password"
                    show={showEditPassword}
                    toggle={() => setShowEditPassword(!showEditPassword)}
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
                onClick={closeEditModal}
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
              Unassign Teacher
            </h2>
            <p className="text-sm text-gray-400 text-center mb-4">
              Remove adviser assignment from section?
            </p>

            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-5"
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
              <div className="flex-1">
                <p className="text-sm font-bold text-[#242424]">
                  {unassignModal.fullname}
                </p>
                <p className="text-xs text-gray-400">
                  Adviser of{" "}
                  <span className="font-semibold text-[#242424]">
                    {unassignModal.section_name}
                  </span>
                  {unassignModal.grade_name && ` · ${unassignModal.grade_name}`}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mb-5">
              The teacher account will remain but will no longer be assigned as
              adviser to any section.
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
              Delete Teacher
            </h2>
            <p className="text-sm text-gray-400 text-center mb-4">
              You are about to permanently delete this account.
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
                <p className="text-xs text-gray-400">
                  {deleteModal.username} · {deleteModal.school_name}
                </p>
              </div>
            </div>

            {deleteModal.section_name && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.15)",
                }}
              >
                <UserX size={13} className="text-red-400 shrink-0" />
                <p className="text-xs text-red-500">
                  This teacher is currently adviser of{" "}
                  <span className="font-bold">{deleteModal.section_name}</span>.
                  Deleting will also remove the adviser assignment.
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

export default TeacherList;
