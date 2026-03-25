import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  School,
  GraduationCap,
  PlusCircle,
  Pencil,
  Trash2,
  X,
  Search,
  ChevronUp,
  ChevronDown,
  User,
} from "lucide-react";
import axios from "axios";

const BASE = "http://localhost:5000/api/students";

const emptyForm = {
  lrn: "",
  firstname: "",
  middlename: "",
  lastname: "",
  gender: "",
  birthdate: "",
  address: "",
  contact_number: "",
};

const MySection = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [section, setSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingSection, setLoadingSection] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [search, setSearch] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [sortField, setSortField] = useState("lastname");
  const [sortOrder, setSortOrder] = useState("asc");

  // Modal
  const [modal, setModal] = useState(null); // "add" | "edit" | "delete"
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchSection = async () => {
    try {
      const res = await axios.get(`${BASE}/my-section`, { headers });
      setSection(res.data);
    } catch {
      setSection(null);
    } finally {
      setLoadingSection(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get(BASE, { headers });
      setStudents(res.data);
    } catch {
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchSection();
    fetchStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter + Sort
  const filtered = students
    .filter((s) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        s.firstname?.toLowerCase().includes(q) ||
        s.lastname?.toLowerCase().includes(q) ||
        s.lrn?.toLowerCase().includes(q);
      const matchGender = filterGender === "all" || s.gender === filterGender;
      return matchSearch && matchGender;
    })
    .sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

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

  // Modal handlers
  const openAdd = () => {
    setForm(emptyForm);
    setFormError("");
    setModal("add");
  };

  const openEdit = (student) => {
    setSelected(student);
    setForm({
      lrn: student.lrn || "",
      firstname: student.firstname || "",
      middlename: student.middlename || "",
      lastname: student.lastname || "",
      gender: student.gender || "",
      birthdate: student.birthdate ? student.birthdate.split("T")[0] : "",
      address: student.address || "",
      contact_number: student.contact_number || "",
    });
    setFormError("");
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleAdd = async () => {
    if (!form.lrn || !form.firstname || !form.lastname || !form.gender)
      return setFormError(
        "LRN, first name, last name and gender are required.",
      );
    setFormLoading(true);
    try {
      await axios.post(BASE, form, { headers });
      await fetchStudents();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!form.lrn || !form.firstname || !form.lastname || !form.gender)
      return setFormError(
        "LRN, first name, last name and gender are required.",
      );
    setFormLoading(true);
    try {
      await axios.put(`${BASE}/${selected.id}`, form, { headers });
      await fetchStudents();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE}/${selected.id}`, { headers });
      await fetchStudents();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const male = students.filter((s) => s.gender === "Male").length;
  const female = students.filter((s) => s.gender === "Female").length;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">My Section</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage your students for the active school year
          </p>
        </div>

        {/* Stat Cards */}
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: "Total Students",
              value: students.length,
              icon: <Users size={18} className="text-white" />,
              bg: "linear-gradient(135deg, #0097b2, #004385)",
              shadow: "rgba(0,151,178,0.35)",
            },
            {
              label: "Male",
              value: male,
              icon: <User size={18} className="text-white" />,
              bg: "linear-gradient(135deg, #3b82f6, #60a5fa)",
              shadow: "rgba(59,130,246,0.35)",
            },
            {
              label: "Female",
              value: female,
              icon: <User size={18} className="text-white" />,
              bg: "linear-gradient(135deg, #ec4899, #f472b6)",
              shadow: "rgba(236,72,153,0.35)",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-5 py-3 rounded-2xl"
              style={{
                background: card.bg,
                boxShadow: `0 6px 18px ${card.shadow}`,
              }}
            >
              <div className="p-1.5 rounded-lg bg-white/20">{card.icon}</div>
              <div>
                <p className="text-xl font-black text-white leading-none">
                  {loadingStudents ? "..." : card.value}
                </p>
                <p className="text-xs text-white/80 tracking-wider uppercase mt-0.5">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div
        className="h-px w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      {/* Section Info Card */}
      {loadingSection ? (
        <div className="text-center py-4 text-gray-400 animate-pulse text-sm">
          Loading section info...
        </div>
      ) : !section ? (
        <div
          className="p-4 rounded-2xl text-center"
          style={{
            background: "rgba(249,115,22,0.06)",
            border: "1px solid rgba(249,115,22,0.2)",
          }}
        >
          <p className="text-sm text-orange-500 font-semibold">
            No section assigned yet.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Contact your school head to assign you to a section.
          </p>
        </div>
      ) : (
        <div
          className="flex flex-wrap gap-4 p-4 rounded-2xl"
          style={{
            background: "rgba(0,151,178,0.04)",
            border: "1px solid rgba(0,151,178,0.15)",
          }}
        >
          {[
            {
              icon: <BookOpen size={15} style={{ color: "#0097b2" }} />,
              label: "Section",
              value: section.section_name,
            },
            {
              icon: <GraduationCap size={15} style={{ color: "#8b5cf6" }} />,
              label: "Grade Level",
              value: section.grade_name,
            },
            {
              icon: <School size={15} style={{ color: "#10b981" }} />,
              label: "School",
              value: section.school_name,
            },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white">{item.icon}</div>
              <div>
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-black text-[#242424]">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters + Add Button */}
      {section && (
        <>
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name or LRN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#242424]"
                style={{
                  background: "white",
                  border: "1px solid rgba(0,151,178,0.2)",
                }}
              />
            </div>

            {/* Gender Filter */}
            <div className="flex gap-2">
              {[
                { value: "all", label: "All" },
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterGender(f.value)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold transition"
                  style={
                    filterGender === f.value
                      ? {
                          background:
                            "linear-gradient(135deg, #0097b2, #004385)",
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

            {/* Add Button */}
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #0097b2, #004385)",
                boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
              }}
            >
              <PlusCircle size={15} />
              Add Student
            </button>
          </div>

          {/* Table */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "white",
              border: "1px solid rgba(0,151,178,0.1)",
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead style={{ background: "rgba(248,248,255,0.8)" }}>
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      #
                    </th>
                    <SortableTh field="lrn" label="LRN" />
                    <SortableTh field="lastname" label="Last Name" />
                    <SortableTh field="firstname" label="First Name" />
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Middle Name
                    </th>
                    <SortableTh field="gender" label="Gender" />
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Birthdate
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loadingStudents ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-10 text-gray-400 animate-pulse text-sm"
                      >
                        Loading students...
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-10 text-gray-400"
                      >
                        <Users size={28} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No students found.</p>
                        <p className="text-xs mt-1">
                          Click "Add Student" to add one.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((student, index) => (
                      <tr
                        key={student.id}
                        className="border-t border-gray-50 hover:bg-gray-50/50 transition"
                      >
                        <td className="px-4 py-3 text-gray-400 text-xs">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-600">
                          {student.lrn}
                        </td>
                        <td className="px-4 py-3 font-semibold text-[#242424]">
                          {student.lastname}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {student.firstname}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {student.middlename || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={
                              student.gender === "Male"
                                ? {
                                    background: "rgba(59,130,246,0.08)",
                                    border: "1px solid rgba(59,130,246,0.2)",
                                    color: "#3b82f6",
                                  }
                                : {
                                    background: "rgba(236,72,153,0.08)",
                                    border: "1px solid rgba(236,72,153,0.2)",
                                    color: "#ec4899",
                                  }
                            }
                          >
                            {student.gender}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {student.birthdate
                            ? new Date(student.birthdate).toLocaleDateString(
                                "en-PH",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => openEdit(student)}
                              className="p-1.5 rounded-lg transition hover:scale-105"
                              style={{
                                background: "rgba(0,151,178,0.08)",
                                color: "#0097b2",
                              }}
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => {
                                setSelected(student);
                                setModal("delete");
                              }}
                              className="p-1.5 rounded-lg bg-red-50 text-red-500 transition hover:scale-105"
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

            {/* Footer */}
            {!loadingStudents && filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Showing {filtered.length} of {students.length} students
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Add / Edit Modal ── */}
      {(modal === "add" || modal === "edit") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-base font-black text-[#242424]">
                  {modal === "add" ? "Add New Student" : "Edit Student"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {modal === "add"
                    ? `Adding to ${section?.section_name} — ${section?.grade_name}`
                    : `Editing ${selected?.firstname} ${selected?.lastname}`}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div
                className="mb-4 p-3 rounded-xl text-sm text-red-600"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                }}
              >
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* LRN */}
              <div className="sm:col-span-2">
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  LRN <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="12-digit Learner Reference Number"
                  value={form.lrn}
                  onChange={(e) => setForm({ ...form, lrn: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                />
              </div>

              {/* Last Name */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  Last Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dela Cruz"
                  value={form.lastname}
                  onChange={(e) =>
                    setForm({ ...form, lastname: e.target.value })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                />
              </div>

              {/* First Name */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Juan"
                  value={form.firstname}
                  onChange={(e) =>
                    setForm({ ...form, firstname: e.target.value })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                />
              </div>

              {/* Middle Name */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  Middle Name{" "}
                  <span className="text-gray-300 normal-case font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Santos"
                  value={form.middlename}
                  onChange={(e) =>
                    setForm({ ...form, middlename: e.target.value })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                />
              </div>

              {/* Gender */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  Sex <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              {/* Birthdate */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  Birthdate{" "}
                  <span className="text-gray-300 normal-case font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="date"
                  value={form.birthdate}
                  onChange={(e) =>
                    setForm({ ...form, birthdate: e.target.value })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                />
              </div>

              {/* Contact Number */}
              <div>
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  Contact Number{" "}
                  <span className="text-gray-300 normal-case font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 09xxxxxxxxx"
                  value={form.contact_number}
                  onChange={(e) =>
                    setForm({ ...form, contact_number: e.target.value })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label
                  className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
                  style={{ color: "#0097b2" }}
                >
                  Address{" "}
                  <span className="text-gray-300 normal-case font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Brgy. San Jose, Tiaong, Quezon"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
                  style={{
                    background: "rgba(248,248,255,0.8)",
                    border: "1px solid rgba(0,151,178,0.2)",
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={modal === "add" ? handleAdd : handleEdit}
                disabled={formLoading}
                className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90 disabled:opacity-40"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                {formLoading
                  ? "Saving..."
                  : modal === "add"
                    ? "Add Student"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {modal === "delete" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-black text-[#242424]">
                Delete Student
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              You are about to permanently delete:
            </p>
            <p className="font-bold text-[#242424] mb-1">
              {selected?.lastname}, {selected?.firstname}
            </p>
            <p className="text-xs text-gray-400 mb-1">LRN: {selected?.lrn}</p>
            <p className="text-sm text-red-500 mb-5 mt-3">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
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

export default MySection;
