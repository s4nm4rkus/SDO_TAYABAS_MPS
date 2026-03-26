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

const API = `${import.meta.env.VITE_API_URL}/api/subjects`;
const ITEMS_PER_PAGE = 10;

const SubjectTable = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ subject_name: "", subject_code: "" });
  const [confirm, setConfirm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("subject_name");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchSubjects = async () => {
    try {
      const res = await axios.get(API, { headers });
      setSubjects(res.data);
    } catch {
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setForm({ subject_name: "", subject_code: "" });
    setConfirm(false);
  };

  const openEdit = (subject) => {
    setSelected(subject);
    setForm({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code,
    });
    setModal("edit");
  };

  const handleAdd = async () => {
    if (!form.subject_name || !form.subject_code)
      return alert("All fields are required.");
    try {
      await axios.post(API, form, { headers });
      await fetchSubjects();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = async () => {
    if (!form.subject_name || !form.subject_code)
      return alert("All fields are required.");
    try {
      await axios.put(`${API}/${selected.id}`, form, { headers });
      await fetchSubjects();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/${selected.id}`, { headers });
      await fetchSubjects();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const valA = a[sortField]?.toString().toLowerCase() ?? "";
      const valB = b[sortField]?.toString().toLowerCase() ?? "";
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [subjects, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedSubjects.length / ITEMS_PER_PAGE);
  const paginated = sortedSubjects.slice(
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

  return (
    <div
      className="rounded-2xl"
      style={{ background: "white", border: "1px solid rgba(0,151,178,0.1)" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-5 border-b border-gray-100">
        <div>
          <h2 className="text-base font-black text-[#242424]">Subjects</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {subjects.length} total subjects
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl transition hover:opacity-90"
          style={{
            background: "linear-gradient(135deg, #0097b2, #004385)",
            boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
          }}
        >
          <PlusCircle size={15} />
          Add Subject
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead style={{ background: "rgba(248,248,255,0.8)" }}>
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                #
              </th>
              <SortableTh field="subject_name" label="Subject Name" />
              <SortableTh field="subject_code" label="Code" />
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10 text-gray-400 animate-pulse text-sm"
                >
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10 text-gray-400 text-sm"
                >
                  No subjects found.
                </td>
              </tr>
            ) : (
              paginated.map((subject, index) => (
                <tr
                  key={subject.id}
                  className="border-t border-gray-50 hover:bg-gray-50/50 transition"
                >
                  <td className="px-4 py-3 text-gray-400 text-xs">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#242424]">
                    {subject.subject_name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={{
                        background: "rgba(0,151,178,0.08)",
                        border: "1px solid rgba(0,151,178,0.2)",
                        color: "#0097b2",
                      }}
                    >
                      {subject.subject_code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-1.5">
                      <button
                        onClick={() => openEdit(subject)}
                        className="p-1.5 rounded-lg transition hover:scale-105"
                        style={{
                          background: "rgba(0,151,178,0.08)",
                          color: "#0097b2",
                        }}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelected(subject);
                          setModal("delete");
                        }}
                        className="p-1.5 rounded-lg bg-red-50 text-red-500 transition hover:scale-105"
                      >
                        <Trash2 size={14} />
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
        <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100 text-sm text-gray-500">
          <p className="text-xs">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, subjects.length)} of{" "}
            {subjects.length}
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
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {modal === "add" && (
        <ModalWrapper title="Add New Subject" onClose={closeModal}>
          <SubjectForm form={form} setForm={setForm} />
          <div className="flex justify-end gap-2 mt-5">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 text-sm rounded-xl text-white transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #0097b2, #004385)",
              }}
            >
              Add Subject
            </button>
          </div>
        </ModalWrapper>
      )}

      {/* Edit Modal */}
      {modal === "edit" && (
        <ModalWrapper title="Edit Subject" onClose={closeModal}>
          <SubjectForm form={form} setForm={setForm} />
          {!confirm ? (
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => setConfirm(true)}
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
              className="mt-4 p-3 rounded-xl text-sm"
              style={{
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              <p className="mb-2 font-semibold text-yellow-700">
                Are you sure?
              </p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirm(false)}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition text-xs"
                >
                  Go Back
                </button>
                <button
                  onClick={handleEdit}
                  className="px-3 py-1.5 rounded-xl text-white transition hover:opacity-90 text-xs"
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

      {/* Delete Modal */}
      {modal === "delete" && (
        <ModalWrapper title="Delete Subject" onClose={closeModal}>
          <p className="text-sm text-gray-500 mb-2">
            You are about to permanently delete:
          </p>
          <p className="font-bold text-[#242424] mb-1">
            {selected?.subject_name}
          </p>
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full mb-4 inline-block"
            style={{
              background: "rgba(0,151,178,0.08)",
              border: "1px solid rgba(0,151,178,0.2)",
              color: "#0097b2",
            }}
          >
            {selected?.subject_code}
          </span>
          <p className="text-sm text-red-500 mb-5 mt-2">
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
        </ModalWrapper>
      )}
    </div>
  );
};

const SubjectForm = ({ form, setForm }) => (
  <div className="flex flex-col gap-4">
    <div>
      <label
        className="text-xs font-semibold uppercase tracking-wider mb-1.5 block"
        style={{ color: "#0097b2" }}
      >
        Subject Name
      </label>
      <input
        type="text"
        placeholder="e.g. Mathematics"
        value={form.subject_name}
        onChange={(e) => setForm({ ...form, subject_name: e.target.value })}
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
        Subject Code
      </label>
      <input
        type="text"
        placeholder="e.g. MATH"
        value={form.subject_code}
        onChange={(e) => setForm({ ...form, subject_code: e.target.value })}
        className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
        style={{
          background: "rgba(248,248,255,0.8)",
          border: "1px solid rgba(0,151,178,0.2)",
        }}
      />
    </div>
  </div>
);

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

export default SubjectTable;
