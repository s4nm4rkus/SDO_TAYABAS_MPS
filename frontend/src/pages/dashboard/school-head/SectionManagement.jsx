import { useState, useEffect } from "react";
import axios from "axios";
import {
  PlusCircle,
  BookOpen,
  School,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

import SectionHeader from "../../../components/headers/school-head-header/section-management/SectionHeader";
import SectionCard from "../../../components/common/cards/school-head/SectionCard";
import SectionModal from "../../../components/common/modals/school-head/SectionModal";
import AssignAdviserModal from "../../../components/common/modals/school-head/AssignAdviserModal";

const SECTIONS_API = `${import.meta.env.VITE_API_URL}/api/sections`;
const GRADE_LEVELS_API = `${import.meta.env.VITE_API_URL}/api/grade-levels`;
const SCHOOL_YEARS_API = `${import.meta.env.VITE_API_URL}/api/school-years`;

const gradeColors = [
  {
    bg: "rgba(0,151,178,0.08)",
    border: "rgba(0,151,178,0.2)",
    accent: "#0097b2",
  },
  {
    bg: "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
    accent: "#8b5cf6",
  },
  {
    bg: "rgba(249,115,22,0.08)",
    border: "rgba(249,115,22,0.2)",
    accent: "#f97316",
  },
  {
    bg: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.2)",
    accent: "#ec4899",
  },
  {
    bg: "rgba(16,185,129,0.08)",
    border: "rgba(16,185,129,0.2)",
    accent: "#10b981",
  },
  {
    bg: "rgba(245,158,11,0.08)",
    border: "rgba(245,158,11,0.2)",
    accent: "#f59e0b",
  },
  {
    bg: "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
    accent: "#3b82f6",
  },
  {
    bg: "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    accent: "#ef4444",
  },
  {
    bg: "rgba(20,184,166,0.08)",
    border: "rgba(20,184,166,0.2)",
    accent: "#14b8a6",
  },
  {
    bg: "rgba(168,85,247,0.08)",
    border: "rgba(168,85,247,0.2)",
    accent: "#a855f7",
  },
  {
    bg: "rgba(132,204,22,0.08)",
    border: "rgba(132,204,22,0.2)",
    accent: "#84cc16",
  },
  {
    bg: "rgba(244,63,94,0.08)",
    border: "rgba(244,63,94,0.2)",
    accent: "#f43f5e",
  },
];

const SectionManagement = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ── State ──
  const [sections, setSections] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [assignedSchools, setAssignedSchools] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Navigation State ──
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);

  // ── Modal State ──
  const [sectionModal, setSectionModal] = useState(null);
  const [assignModal, setAssignModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [form, setForm] = useState({
    section_name: "",
    grade_level_id: "",
    school_id: "",
  });

  // ── Fetch ──
  const fetchAll = async () => {
    try {
      const [sectionsRes, gradesRes, teachersRes, schoolsRes, yearRes] =
        await Promise.all([
          axios.get(SECTIONS_API, { headers }),
          axios.get(GRADE_LEVELS_API, { headers }),
          axios.get(`${SECTIONS_API}/teachers`, { headers }),
          axios.get(`${SECTIONS_API}/schools`, { headers }),
          axios.get(`${SCHOOL_YEARS_API}/active`),
        ]);
      setSections(sectionsRes.data);
      setGradeLevels(gradesRes.data);
      setTeachers(teachersRes.data);
      setAssignedSchools(schoolsRes.data);
      setActiveYear(yearRes.data);

      // Auto-select school if only one
      if (schoolsRes.data.length === 1) {
        setSelectedSchool(schoolsRes.data[0]);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSections = async () => {
    try {
      const res = await axios.get(SECTIONS_API, { headers });
      setSections(res.data);
    } catch (err) {
      console.error("Failed to fetch sections:", err);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get(`${SECTIONS_API}/teachers`, { headers });
      setTeachers(res.data);
    } catch (err) {
      console.error("Failed to fetch teachers:", err);
    }
  };

  useEffect(
    () => {
      fetchAll();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── Computed ──
  const schoolSections = selectedSchool
    ? sections.filter((s) => s.school_id === selectedSchool.id)
    : [];

  const gradeSections =
    selectedGrade && selectedSchool
      ? sections.filter(
          (s) =>
            s.grade_level_id === selectedGrade.id &&
            s.school_id === selectedSchool.id,
        )
      : [];

  const totalSections = schoolSections.length;
  const assignedSections = schoolSections.filter((s) => s.adviser_id).length;
  const unassignedSections = totalSections - assignedSections;

  // ── Handlers ──
  const handleSelectSchool = (school) => {
    setSelectedSchool(school);
    setSelectedGrade(null);
  };

  const handleSelectGrade = (grade) => {
    if (selectedGrade?.id === grade.id) setSelectedGrade(null);
    else setSelectedGrade(grade);
  };

  const openAdd = () => {
    setForm({
      section_name: "",
      grade_level_id: selectedGrade?.id || "",
      school_id: selectedSchool?.id || "",
    });
    setSelectedSection(null);
    setSectionModal("add");
  };

  const openEdit = (section) => {
    setSelectedSection(section);
    setForm({
      section_name: section.section_name,
      grade_level_id: section.grade_level_id,
      school_id: section.school_id,
    });
    setSectionModal("edit");
  };

  const closeModal = () => {
    setSectionModal(null);
    setSelectedSection(null);
    setForm({ section_name: "", grade_level_id: "", school_id: "" });
  };

  const handleAdd = async () => {
    if (!form.section_name || !form.grade_level_id)
      return alert("All fields are required.");
    try {
      await axios.post(SECTIONS_API, form, { headers });
      await fetchSections();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = async () => {
    if (!form.section_name || !form.grade_level_id)
      return alert("All fields are required.");
    try {
      await axios.put(`${SECTIONS_API}/${selectedSection.id}`, form, {
        headers,
      });
      await fetchSections();
      closeModal();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${SECTIONS_API}/${deleteModal.id}`, { headers });
      await fetchSections();
      setDeleteModal(null);
      if (selectedGrade && gradeSections.length === 1) setSelectedGrade(null);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleAssign = async (adviser_id) => {
    try {
      await axios.put(
        `${SECTIONS_API}/${assignModal.id}/assign`,
        { adviser_id },
        { headers },
      );
      await fetchSections();
      await fetchTeachers();
      setAssignModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong.");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-20 text-gray-400 animate-pulse text-sm">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">
            Section Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage sections and assign advisers for the active school year
          </p>
        </div>

        {/* Stat Cards + School Name */}
        <div className="flex flex-col items-end gap-2">
          {/* School name below cards */}
          {selectedSchool && (
            <div className="flex items-center gap-1.5">
              <School size={12} style={{ color: "#0097b2" }} />
              <span
                className="text-xs font-semibold"
                style={{ color: "#0097b2" }}
              >
                {selectedSchool.school_name}
              </span>
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            {[
              {
                label: "Total Sections",
                value: selectedSchool ? totalSections : sections.length,
                color: "linear-gradient(135deg, #0097b2, #004385)",
                shadow: "rgba(0,151,178,0.35)",
              },
              {
                label: "Assigned",
                value: selectedSchool
                  ? assignedSections
                  : sections.filter((s) => s.adviser_id).length,
                color: "linear-gradient(135deg, #10b981, #059669)",
                shadow: "rgba(16,185,129,0.35)",
              },
              {
                label: "Unassigned",
                value: selectedSchool
                  ? unassignedSections
                  : sections.filter((s) => !s.adviser_id).length,
                color: "linear-gradient(135deg, #f97316, #fb923c)",
                shadow: "rgba(249,115,22,0.35)",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
                style={{
                  background: card.color,
                  boxShadow: `0 6px 18px ${card.shadow}`,
                }}
              >
                <div>
                  <p className="text-lg font-black text-white leading-none">
                    {card.value}
                  </p>
                  <p className="text-xs text-white/80 uppercase tracking-wider mt-0.5">
                    {card.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Active School Year Banner ── */}
      {activeYear && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(0,151,178,0.06)",
            border: "1px solid rgba(0,151,178,0.15)",
          }}
        >
          <div
            className="p-1.5 rounded-lg"
            style={{ background: "rgba(0,151,178,0.1)" }}
          >
            <CalendarDays size={15} style={{ color: "#0097b2" }} />
          </div>
          <div>
            <p className="text-xs text-gray-400">Active School Year</p>
            <p className="text-sm font-black text-[#242424]">
              SY {activeYear.year_label}
            </p>
          </div>
          <div className="ml-auto">
            <span
              className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{
                background: "rgba(16,185,129,0.1)",
                color: "#10b981",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              Active
            </span>
          </div>
        </div>
      )}

      {/* ── Divider ── */}
      <div
        className="h-px w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      {/* ── School Tabs — only if multiple schools ── */}
      {assignedSchools.length > 1 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Your Schools
          </p>
          <div className="flex flex-wrap gap-3">
            {assignedSchools.map((school) => {
              const isSelected = selectedSchool?.id === school.id;
              const count = sections.filter(
                (s) => s.school_id === school.id,
              ).length;
              return (
                <button
                  key={school.id}
                  onClick={() => handleSelectSchool(school)}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 hover:-translate-y-0.5"
                  style={
                    isSelected
                      ? {
                          background:
                            "linear-gradient(135deg, #0097b2, #004385)",
                          boxShadow: "0 6px 18px rgba(0,151,178,0.35)",
                        }
                      : {
                          background: "white",
                          border: "1px solid rgba(0,151,178,0.15)",
                        }
                  }
                >
                  <div
                    className="p-1.5 rounded-lg"
                    style={{
                      background: isSelected
                        ? "rgba(255,255,255,0.2)"
                        : "rgba(0,151,178,0.08)",
                    }}
                  >
                    <School
                      size={15}
                      style={{ color: isSelected ? "white" : "#0097b2" }}
                    />
                  </div>
                  <div className="text-left">
                    <p
                      className="text-sm font-black leading-none"
                      style={{ color: isSelected ? "white" : "#242424" }}
                    >
                      {school.school_name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{
                        color: isSelected
                          ? "rgba(255,255,255,0.7)"
                          : "rgba(0,0,0,0.4)",
                      }}
                    >
                      {count} {count === 1 ? "section" : "sections"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── No School Selected ── */}
      {!selectedSchool && assignedSchools.length > 1 && (
        <div
          className="text-center py-12 text-gray-400"
          style={{
            border: "2px dashed rgba(0,151,178,0.2)",
            borderRadius: "1rem",
          }}
        >
          <School size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">Select a school to manage sections.</p>
        </div>
      )}

      {/* ── Grade Level Cards ── */}
      {selectedSchool && (
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <span>Section Management</span>
            <ChevronRight size={11} />
            <span className="font-semibold" style={{ color: "#0097b2" }}>
              {selectedSchool.school_name}
            </span>
            {selectedGrade && (
              <>
                <ChevronRight size={11} />
                <span className="font-semibold" style={{ color: "#0097b2" }}>
                  {selectedGrade.grade_name}
                </span>
              </>
            )}
          </div>

          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
            Grade Levels
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {gradeLevels.map((grade, index) => {
              const color = gradeColors[index % gradeColors.length];
              const count = sections.filter(
                (s) =>
                  s.grade_level_id === grade.id &&
                  s.school_id === selectedSchool.id,
              ).length;
              const isSelected = selectedGrade?.id === grade.id;
              const hasData = count > 0;

              return (
                <div
                  key={grade.id}
                  onClick={() => handleSelectGrade(grade)}
                  className="rounded-2xl p-4 cursor-pointer transition-all duration-200 hover:-translate-y-1"
                  style={{
                    background: isSelected
                      ? color.accent
                      : hasData
                        ? color.bg
                        : "rgba(0,0,0,0.02)",
                    border: isSelected
                      ? `2px solid ${color.accent}`
                      : hasData
                        ? `1px solid ${color.border}`
                        : "1px dashed rgba(0,0,0,0.1)",
                    boxShadow: isSelected
                      ? `0 8px 20px ${color.border}`
                      : "none",
                    opacity: hasData || isSelected ? 1 : 0.6,
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center mb-2"
                    style={{
                      background: isSelected
                        ? "rgba(255,255,255,0.25)"
                        : hasData
                          ? color.border
                          : "rgba(0,0,0,0.06)",
                    }}
                  >
                    <BookOpen
                      size={15}
                      style={{
                        color: isSelected
                          ? "white"
                          : hasData
                            ? color.accent
                            : "rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                  <p
                    className="text-xs font-black leading-tight"
                    style={{
                      color: isSelected
                        ? "white"
                        : hasData
                          ? "#242424"
                          : "rgba(0,0,0,0.4)",
                    }}
                  >
                    {grade.grade_name}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{
                      color: isSelected
                        ? "rgba(255,255,255,0.75)"
                        : hasData
                          ? color.accent
                          : "rgba(0,0,0,0.3)",
                    }}
                  >
                    {count === 0
                      ? "No sections"
                      : `${count} ${count === 1 ? "section" : "sections"}`}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sections under selected grade ── */}
      {selectedGrade && selectedSchool && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#242424]">
                {selectedGrade.grade_name} — {selectedSchool.school_name}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {gradeSections.length}{" "}
                {gradeSections.length === 1 ? "section" : "sections"} ·{" "}
                {gradeSections.filter((s) => s.adviser_id).length} assigned ·{" "}
                {gradeSections.filter((s) => !s.adviser_id).length} unassigned
              </p>
            </div>
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl transition hover:opacity-90 shrink-0"
              style={{
                background: "linear-gradient(135deg, #0097b2, #004385)",
                boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
              }}
            >
              <PlusCircle size={15} />
              Add Section
            </button>
          </div>

          {gradeSections.length === 0 ? (
            <div
              className="text-center py-12 text-gray-400"
              style={{
                border: "2px dashed rgba(0,151,178,0.2)",
                borderRadius: "1rem",
              }}
            >
              <BookOpen size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                No sections yet for {selectedGrade.grade_name}.
              </p>
              <p className="text-xs mt-1">Click "Add Section" to create one.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {gradeSections.map((section, i) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  index={i}
                  onEdit={openEdit}
                  onDelete={setDeleteModal}
                  onAssign={setAssignModal}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {sectionModal && (
        <SectionModal
          mode={sectionModal}
          form={form}
          setForm={setForm}
          gradeLevels={gradeLevels}
          assignedSchools={assignedSchools}
          onClose={closeModal}
          onSubmit={sectionModal === "add" ? handleAdd : handleEdit}
        />
      )}

      {assignModal && (
        <AssignAdviserModal
          section={assignModal}
          teachers={teachers}
          onClose={() => setAssignModal(null)}
          onAssign={handleAssign}
        />
      )}

      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6"
            style={{ border: "1px solid rgba(0,151,178,0.15)" }}
          >
            <h2 className="text-base font-black text-[#242424] mb-2">
              Delete Section
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              You are about to permanently delete:
            </p>
            <p className="font-bold text-[#242424] mb-1">
              {deleteModal.section_name}
            </p>
            <p className="text-xs text-gray-400 mb-4">
              {deleteModal.grade_name}
            </p>
            <p className="text-sm text-red-500 mb-5">
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

export default SectionManagement;
