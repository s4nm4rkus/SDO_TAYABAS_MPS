import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  School,
  GraduationCap,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  CalendarDays,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";

const STUDENTS_API = "http://localhost:5000/api/students";
const ASSESSMENTS_API = "http://localhost:5000/api/assessments";

const TeacherDashboard = () => {
  const [activeYear, setActiveYear] = useState(null);
  const [section, setSection] = useState(null);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = now.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatDate = () =>
    now.toLocaleDateString("en-PH", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatTime = () =>
    now.toLocaleTimeString("en-PH", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const getUser = () => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  };
  const user = getUser();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          sectionRes,
          studentsRes,
          subjectsRes,
          periodsRes,
          reportRes,
          yearRes,
        ] = await Promise.all([
          axios.get(`${STUDENTS_API}/my-section`, { headers }),
          axios.get(STUDENTS_API, { headers }),
          axios.get(`${ASSESSMENTS_API}/subjects`, { headers }),
          axios.get(`${ASSESSMENTS_API}/grading-periods`, { headers }),
          axios.get(`${ASSESSMENTS_API}/report`, { headers }),
          axios.get("http://localhost:5000/api/school-years/active"),
        ]);
        setSection(sectionRes.data);
        setStudents(studentsRes.data);
        setSubjects(subjectsRes.data);
        setPeriods(periodsRes.data);
        setReport(reportRes.data);
        setActiveYear(yearRes.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activePeriod = periods.find((p) => p.is_active);
  const activeReport = activePeriod && report?.report?.[activePeriod.id];

  const getMPSColor = (mps) => {
    if (!mps) return "#d1d5db";
    const val = Number(mps);
    if (val >= 90) return "#10b981";
    if (val >= 75) return "#0097b2";
    if (val >= 60) return "#f59e0b";
    return "#ef4444";
  };

  const encodingStatus = subjects.map((subject) => {
    const hasData = activeReport?.data?.find(
      (r) => r.subject_id === subject.id && r.class.mps !== null,
    );
    return { ...subject, encoded: !!hasData };
  });

  const encodedCount = encodingStatus.filter((s) => s.encoded).length;
  const male = students.filter((s) => s.gender === "Male").length;
  const female = students.filter((s) => s.gender === "Female").length;
  const barData = activeReport?.data?.filter((r) => r.class.mps !== null) || [];

  const bestSubject = barData.length
    ? barData.reduce((a, b) =>
        Number(a.class.mps) > Number(b.class.mps) ? a : b,
      )
    : null;

  const lowestSubject = barData.length
    ? barData.reduce((a, b) =>
        Number(a.class.mps) < Number(b.class.mps) ? a : b,
      )
    : null;

  if (loading)
    return (
      <div className="text-center py-20 text-gray-400 animate-pulse text-sm">
        Loading dashboard...
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <CalendarDays size={13} />
          <span>{formatDate()}</span>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
          style={{
            background: "rgba(0,151,178,0.06)",
            border: "1px solid rgba(0,151,178,0.15)",
          }}
        >
          <Clock size={13} style={{ color: "#0097b2" }} />
          <span className="text-xs font-black text-[#242424] tracking-wider font-mono">
            {formatTime()}
          </span>
          <span className="text-xs text-gray-400">PHT</span>
        </div>
      </div>

      {/* ── Welcome Banner ── */}
      <div
        className="relative rounded-2xl px-6 py-5 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0097b2, #004385)",
          boxShadow: "0 8px 24px rgba(0,151,178,0.35)",
        }}
      >
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-8 w-24 h-24 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-white/70 text-sm">{getGreeting()},</p>
          <h1 className="text-2xl font-black text-white mt-0.5">
            {user?.fullname || "Teacher"}! 👋
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {section ? (
              <>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                  <BookOpen size={12} className="text-white" />
                  <span className="text-xs text-white font-semibold">
                    {section.section_name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                  <GraduationCap size={12} className="text-white" />
                  <span className="text-xs text-white font-semibold">
                    {section.grade_name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                  <School size={12} className="text-white" />
                  <span className="text-xs text-white font-semibold">
                    {section.school_name}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                <AlertCircle size={12} className="text-white" />
                <span className="text-xs text-white">
                  No section assigned yet
                </span>
              </div>
            )}
            {activePeriod && (
              <div className="flex items-center gap-1.5 bg-green-400/30 rounded-full px-3 py-1 border border-green-400/40">
                <span className="text-xs text-green-200 font-semibold">
                  Active: {activePeriod.period_name}
                </span>
              </div>
            )}
            {activeYear && (
              <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                <CalendarDays size={12} className="text-white" />
                <span className="text-xs text-white font-semibold">
                  SY {activeYear.year_label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            icon: <Users size={18} className="text-white" />,
            bg: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            shadow: "rgba(59,130,246,0.35)",
          },
          {
            label: "Female",
            value: female,
            icon: <Users size={18} className="text-white" />,
            bg: "linear-gradient(135deg, #ec4899, #f472b6)",
            shadow: "rgba(236,72,153,0.35)",
          },
          {
            label: "Subjects",
            value: subjects.length,
            icon: <ClipboardList size={18} className="text-white" />,
            bg: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
            shadow: "rgba(139,92,246,0.35)",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{
              background: card.bg,
              boxShadow: `0 6px 18px ${card.shadow}`,
            }}
          >
            <div className="p-2 rounded-xl bg-white/20">{card.icon}</div>
            <div>
              <p className="text-2xl font-black text-white leading-none">
                {card.value}
              </p>
              <p className="text-xs text-white/80 uppercase tracking-wider mt-0.5">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Quick Actions
        </p>
        <div className="flex flex-wrap gap-3">
          {[
            {
              label: "Add Student",
              icon: <Users size={15} />,
              to: "/teacher/section",
              bg: "linear-gradient(135deg, #0097b2, #004385)",
              shadow: "rgba(0,151,178,0.3)",
            },
            {
              label: "Encode MPS",
              icon: <ClipboardList size={15} />,
              to: "/teacher/mps",
              bg: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
              shadow: "rgba(139,92,246,0.3)",
            },
            {
              label: "View Report",
              icon: <TrendingUp size={15} />,
              to: "/teacher/report",
              bg: "linear-gradient(135deg, #10b981, #059669)",
              shadow: "rgba(16,185,129,0.3)",
            },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-sm font-semibold transition hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: action.bg,
                boxShadow: `0 4px 12px ${action.shadow}`,
              }}
            >
              {action.icon}
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Quarter Progress ── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "white", border: "1px solid rgba(0,151,178,0.1)" }}
      >
        <h2 className="text-base font-black text-[#242424] mb-4">
          Quarter Progress
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {periods.map((period) => {
            const isActive = !!period.is_active;
            const quarterData = report?.report?.[period.id]?.data || [];
            const hasData = quarterData.some((r) => r.class.mps !== null);
            const encodedSubjects = quarterData.filter(
              (r) => r.class.mps !== null,
            ).length;
            const isPast = !isActive && hasData;
            const isUpcoming = !isActive && !hasData;

            return (
              <div
                key={period.id}
                className="flex flex-col gap-2 p-4 rounded-2xl"
                style={{
                  background: isActive
                    ? "rgba(0,151,178,0.06)"
                    : isPast
                      ? "rgba(16,185,129,0.06)"
                      : "rgba(0,0,0,0.02)",
                  border: isActive
                    ? "1px solid rgba(0,151,178,0.2)"
                    : isPast
                      ? "1px solid rgba(16,185,129,0.2)"
                      : "1px dashed rgba(0,0,0,0.1)",
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#242424]">
                    {period.period_name}
                  </span>
                  {isPast && (
                    <CheckCircle size={15} style={{ color: "#10b981" }} />
                  )}
                  {isActive && (
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(0,151,178,0.1)",
                        color: "#0097b2",
                      }}
                    >
                      Active
                    </span>
                  )}
                  {isUpcoming && (
                    <span className="text-xs text-gray-300">🔒</span>
                  )}
                </div>
                <div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width:
                          subjects.length > 0
                            ? `${(encodedSubjects / subjects.length) * 100}%`
                            : "0%",
                        background: isActive
                          ? "linear-gradient(135deg, #0097b2, #004385)"
                          : isPast
                            ? "#10b981"
                            : "#d1d5db",
                      }}
                    />
                  </div>
                  <p
                    className="text-xs mt-1"
                    style={{
                      color: isActive
                        ? "#0097b2"
                        : isPast
                          ? "#10b981"
                          : "#9ca3af",
                    }}
                  >
                    {isUpcoming
                      ? "Not started"
                      : `${encodedSubjects}/${subjects.length} subjects`}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Grid: Chart + Encoding Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MPS Bar Chart */}
        <div
          className="lg:col-span-2 rounded-2xl p-5"
          style={{
            background: "white",
            border: "1px solid rgba(0,151,178,0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-[#242424]">
                MPS Overview
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Class MPS per subject —{" "}
                {activePeriod?.period_name || "No active quarter"}
              </p>
            </div>
            <TrendingUp size={18} style={{ color: "#0097b2" }} />
          </div>

          {barData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <TrendingUp size={28} className="mb-2 opacity-30" />
              <p className="text-sm">No MPS data for active quarter yet.</p>
              <p className="text-xs mt-1">Encode scores to see the chart.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative">
                <div className="flex">
                  <div
                    className="flex flex-col justify-between text-right pr-2 pb-8"
                    style={{ height: "200px" }}
                  >
                    {[100, 75, 50, 25, 0].map((val) => (
                      <span key={val} className="text-xs text-gray-300">
                        {val}%
                      </span>
                    ))}
                  </div>
                  <div className="flex-1 relative">
                    <div
                      className="absolute inset-0 flex flex-col justify-between pb-8"
                      style={{ height: "200px" }}
                    >
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="w-full border-t border-dashed border-gray-100"
                        />
                      ))}
                    </div>
                    <div
                      className="flex items-end gap-3 px-2"
                      style={{ height: "200px", paddingBottom: "32px" }}
                    >
                      {barData.map((row) => {
                        const mps = Number(row.class.mps);
                        const maleMps = row.male.mps
                          ? Number(row.male.mps)
                          : null;
                        const femaleMps = row.female.mps
                          ? Number(row.female.mps)
                          : null;
                        const color = getMPSColor(row.class.mps);

                        return (
                          <div
                            key={row.subject_id}
                            className="flex-1 flex flex-col items-center gap-1 group relative"
                          >
                            <div
                              className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10
                              hidden group-hover:flex flex-col items-center
                              bg-[#242424] text-white text-xs rounded-xl px-3 py-2 shadow-lg
                              whitespace-nowrap pointer-events-none"
                            >
                              <span className="font-black">
                                {row.subject_name}
                              </span>
                              <span className="text-white/70">
                                Class: {mps}%
                              </span>
                              {maleMps && (
                                <span className="text-blue-300">
                                  Male: {maleMps}%
                                </span>
                              )}
                              {femaleMps && (
                                <span className="text-pink-300">
                                  Female: {femaleMps}%
                                </span>
                              )}
                              <div
                                className="absolute top-full left-1/2 -translate-x-1/2
                                border-4 border-transparent border-t-[#242424]"
                              />
                            </div>
                            <span
                              className="text-xs font-black mb-1"
                              style={{ color }}
                            >
                              {mps}%
                            </span>
                            <div
                              className="flex items-end justify-center gap-0.5 w-full"
                              style={{ height: "140px" }}
                            >
                              {maleMps && (
                                <div
                                  className="flex-1 rounded-t-md transition-all duration-700 min-w-0"
                                  style={{
                                    height: `${(maleMps / 100) * 100}%`,
                                    background: "rgba(59,130,246,0.65)",
                                    maxWidth: "15%",
                                  }}
                                />
                              )}
                              <div
                                className="rounded-t-md transition-all duration-700 min-w-0"
                                style={{
                                  height: `${(mps / 100) * 100}%`,
                                  background: color,
                                  flex: maleMps || femaleMps ? "1.4" : "1",
                                  maxWidth:
                                    maleMps || femaleMps ? "40%" : "60%",
                                }}
                              />
                              {femaleMps && (
                                <div
                                  className="flex-1 rounded-t-md transition-all duration-700 min-w-0"
                                  style={{
                                    height: `${(femaleMps / 100) * 100}%`,
                                    background: "rgba(236,72,153,0.65)",
                                    maxWidth: "15%",
                                  }}
                                />
                              )}
                            </div>
                            <span className="text-xs font-semibold text-gray-500 truncate w-full text-center mt-1">
                              {row.subject_code}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "rgba(59,130,246,0.6)" }}
                  />
                  <span className="text-xs text-gray-400">Male</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "#0097b2" }}
                  />
                  <span className="text-xs text-gray-400">Class MPS</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: "rgba(236,72,153,0.6)" }}
                  />
                  <span className="text-xs text-gray-400">Female</span>
                </div>
                <div className="ml-auto flex flex-wrap gap-3">
                  {[
                    { label: "≥90% Outstanding", color: "#10b981" },
                    { label: "75-89% Satisfactory", color: "#0097b2" },
                    { label: "60-74% Developing", color: "#f59e0b" },
                    { label: "<60% Beginning", color: "#ef4444" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: item.color }}
                      />
                      <span className="text-xs text-gray-400">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Encoding Status */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: "white",
            border: "1px solid rgba(0,151,178,0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-black text-[#242424]">
                Encoding Status
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {encodedCount}/{subjects.length} subjects encoded
              </p>
            </div>
            <ClipboardList size={18} style={{ color: "#0097b2" }} />
          </div>
          <div className="mb-4">
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width:
                    subjects.length > 0
                      ? `${(encodedCount / subjects.length) * 100}%`
                      : "0%",
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1 text-right">
              {subjects.length > 0
                ? `${((encodedCount / subjects.length) * 100).toFixed(0)}% complete`
                : "No subjects"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {encodingStatus.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                No subjects found for your grade level.
              </p>
            ) : (
              encodingStatus.map((subject) => (
                <div
                  key={subject.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition"
                  style={{
                    background: subject.encoded
                      ? "rgba(16,185,129,0.06)"
                      : "rgba(248,248,255,0.8)",
                    border: `1px solid ${subject.encoded ? "rgba(16,185,129,0.2)" : "rgba(0,0,0,0.06)"}`,
                  }}
                >
                  {subject.encoded ? (
                    <CheckCircle size={15} style={{ color: "#10b981" }} />
                  ) : (
                    <AlertCircle size={15} className="text-gray-300" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#242424] leading-none">
                      {subject.subject_name}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: subject.encoded ? "#10b981" : "#9ca3af" }}
                    >
                      {subject.encoded ? "Scores encoded" : "Not yet encoded"}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-400">
                    {subject.subject_code}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {barData.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {bestSubject && (
            <div
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{
                background: "rgba(16,185,129,0.06)",
                border: "1px solid rgba(16,185,129,0.2)",
              }}
            >
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(16,185,129,0.15)" }}
              >
                <span className="text-lg">🏆</span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                  Highest MPS
                </p>
                <p className="text-sm font-black text-[#242424] mt-0.5">
                  {bestSubject.subject_name}
                </p>
                <p className="text-xs text-gray-400">
                  {bestSubject.subject_code}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black" style={{ color: "#10b981" }}>
                  {bestSubject.class.mps}%
                </p>
                <p className="text-xs text-gray-400">Class MPS</p>
              </div>
            </div>
          )}

          {lowestSubject &&
            lowestSubject.subject_id !== bestSubject?.subject_id && (
              <div
                className="flex items-center gap-4 p-5 rounded-2xl"
                style={{
                  background: "rgba(249,115,22,0.06)",
                  border: "1px solid rgba(249,115,22,0.2)",
                }}
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(249,115,22,0.15)" }}
                >
                  <span className="text-lg">⚠️</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Needs Attention
                  </p>
                  <p className="text-sm font-black text-[#242424] mt-0.5">
                    {lowestSubject.subject_name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {lowestSubject.subject_code}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className="text-2xl font-black"
                    style={{ color: "#f97316" }}
                  >
                    {lowestSubject.class.mps}%
                  </p>
                  <p className="text-xs text-gray-400">Class MPS</p>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
