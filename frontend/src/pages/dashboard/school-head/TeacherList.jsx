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
} from "lucide-react";
import axios from "axios";

const API = "http://localhost:5000/api/sections/teacher-list";

const TeacherList = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSchool, setFilterSchool] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortField, setSortField] = useState("fullname");
  const [sortOrder, setSortOrder] = useState("asc");

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

  useEffect(() => {
    fetchTeachers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">Teacher List</h1>
          <p className="text-sm text-gray-400 mt-1">
            Teachers assigned to your school(s) for the active school year
          </p>
        </div>

        {/* Stat Cards */}
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: "Total Teachers",
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
              className="flex items-center gap-3 px-5 py-3 rounded-2xl"
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

      {/* Filters */}
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

      {/* Table */}
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-10 text-gray-400 animate-pulse text-sm"
                  >
                    Loading teachers...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-400">
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
    </div>
  );
};

export default TeacherList;
