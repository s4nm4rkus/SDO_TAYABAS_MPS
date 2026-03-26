import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  School,
  CalendarDays,
  TrendingUp,
  PrinterIcon,
  Download,
  Users,
} from "lucide-react";
import axios from "axios";

const BASE = `${import.meta.env.VITE_API_URL}/api/sh-mps`;
const SCHOOLS_API = `${import.meta.env.VITE_API_URL}/api/sections/schools`;
const YEARS_API = `${import.meta.env.VITE_API_URL}/api/school-years/active`;

const getMPSColor = (mps) => {
  if (!mps) return "#d1d5db";
  const val = Number(mps);
  if (val >= 90) return "#10b981";
  if (val >= 75) return "#0097b2";
  if (val >= 60) return "#f59e0b";
  return "#ef4444";
};

const getMPSBg = (mps) => {
  if (!mps) return "transparent";
  const val = Number(mps);
  if (val >= 90) return "rgba(16,185,129,0.08)";
  if (val >= 75) return "rgba(0,151,178,0.08)";
  if (val >= 60) return "rgba(245,158,11,0.08)";
  return "rgba(239,68,68,0.08)";
};

const computeAverages = (data) => {
  const validMale = data.filter((r) => r.male.mps !== null);
  const validFemale = data.filter((r) => r.female.mps !== null);
  const validClass = data.filter((r) => r.class.mps !== null);
  const avg = (arr, key) =>
    arr.length
      ? (arr.reduce((s, r) => s + Number(r[key].mps), 0) / arr.length).toFixed(
          2,
        )
      : null;
  const avgSD = (arr, key) =>
    arr.length
      ? (
          arr.reduce((s, r) => s + Number(r[key].sd || 0), 0) / arr.length
        ).toFixed(2)
      : null;
  return {
    male: { mps: avg(validMale, "male"), sd: avgSD(validMale, "male") },
    female: {
      mps: avg(validFemale, "female"),
      sd: avgSD(validFemale, "female"),
    },
    class: { mps: avg(validClass, "class"), sd: avgSD(validClass, "class") },
  };
};

const MPSCell = ({ val, isSD, bold }) => {
  if (isSD)
    return (
      <span className={`text-xs text-gray-500 ${bold ? "font-semibold" : ""}`}>
        {val ?? "—"}
      </span>
    );
  if (!val) return <span className="text-xs text-gray-300">—</span>;
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-lg ${bold ? "font-black" : "font-semibold"}`}
      style={{ color: getMPSColor(val), background: getMPSBg(val) }}
    >
      {val}%
    </span>
  );
};

const GradeTable = ({ gradeData, periodName }) => {
  const averages = computeAverages(gradeData.subjects);
  const hasData = gradeData.subjects.some((r) => r.class.mps !== null);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(0,151,178,0.1)" }}
    >
      {/* Grade Header */}
      <div
        className="px-5 py-4 border-b border-gray-100"
        style={{ background: "rgba(0,151,178,0.04)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-black text-[#242424]">
              {gradeData.grade_name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {periodName} · {gradeData.section_count}{" "}
              {gradeData.section_count === 1 ? "section" : "sections"} combined
            </p>

            {/* Sections + Advisers */}
            <div className="flex flex-wrap gap-2 mt-2">
              {gradeData.sections?.map((sec, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    background: sec.adviser_name
                      ? "rgba(0,151,178,0.08)"
                      : "rgba(249,115,22,0.08)",
                    border: `1px solid ${
                      sec.adviser_name
                        ? "rgba(0,151,178,0.2)"
                        : "rgba(249,115,22,0.2)"
                    }`,
                  }}
                >
                  <BookOpen
                    size={11}
                    style={{ color: sec.adviser_name ? "#0097b2" : "#f97316" }}
                  />
                  <span className="text-xs font-semibold text-[#242424]">
                    {sec.section_name}
                  </span>
                  <span className="text-xs text-gray-300">·</span>
                  <Users
                    size={10}
                    style={{ color: sec.adviser_name ? "#0097b2" : "#f97316" }}
                  />
                  {sec.adviser_name ? (
                    <span className="text-xs" style={{ color: "#0097b2" }}>
                      {sec.adviser_name}
                    </span>
                  ) : (
                    <span className="text-xs text-orange-400">No adviser</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Class Average */}
          {averages.class.mps && (
            <div className="text-right shrink-0">
              <p className="text-xs text-gray-400">Class Average</p>
              <p
                className="text-xl font-black"
                style={{ color: getMPSColor(averages.class.mps) }}
              >
                {averages.class.mps}%
              </p>
            </div>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="px-5 py-6 text-center text-gray-400 text-xs">
          No scores encoded for this quarter yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "rgba(248,248,255,0.8)" }}>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  Learning Area
                </th>
                <th
                  className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider border-b border-gray-100"
                  style={{ color: "#3b82f6" }}
                  colSpan={2}
                >
                  Male
                </th>
                <th
                  className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider border-b border-gray-100"
                  style={{ color: "#ec4899" }}
                  colSpan={2}
                >
                  Female
                </th>
                <th
                  className="px-4 py-2.5 text-center text-xs font-semibold uppercase tracking-wider border-b border-gray-100"
                  style={{ color: "#0097b2" }}
                  colSpan={2}
                >
                  Class
                </th>
              </tr>
              <tr style={{ background: "rgba(248,248,255,0.5)" }}>
                <th className="px-4 py-1.5 border-b border-gray-100" />
                {["MPS", "SD", "MPS", "SD", "MPS", "SD"].map((h, i) => (
                  <th
                    key={i}
                    className="px-4 py-1.5 text-center text-xs text-gray-400 border-b border-gray-100"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {gradeData.subjects.map((row) => (
                <tr
                  key={row.subject_id}
                  className="border-t border-gray-50 hover:bg-gray-50/30 transition"
                >
                  <td className="px-4 py-2.5 font-semibold text-[#242424] text-sm">
                    {row.subject_name}
                    <span className="ml-2 text-xs text-gray-400">
                      ({row.subject_code})
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={row.male.mps} isSD={false} />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={row.male.sd} isSD={true} />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={row.female.mps} isSD={false} />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={row.female.sd} isSD={true} />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={row.class.mps} isSD={false} />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={row.class.sd} isSD={true} />
                  </td>
                </tr>
              ))}

              {/* Average Row */}
              {averages && (
                <tr
                  style={{
                    background: "rgba(0,151,178,0.04)",
                    borderTop: "2px solid rgba(0,151,178,0.15)",
                  }}
                >
                  <td className="px-4 py-2.5 font-black text-[#242424] text-sm">
                    Average
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={averages.male.mps} isSD={false} bold />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={averages.male.sd} isSD={true} bold />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={averages.female.mps} isSD={false} bold />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={averages.female.sd} isSD={true} bold />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={averages.class.mps} isSD={false} bold />
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <MPSCell val={averages.class.sd} isSD={true} bold />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const SchoolHeadMPSReport = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [reportData, setReportData] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [gradeLevels, setGradeLevels] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [selectedGradeId, setSelectedGradeId] = useState("all");
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [activeYear, setActiveYear] = useState(null);
  const [assignedSchools, setAssignedSchools] = useState([]);
  const printRef = useRef();

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const [periodsRes, schoolsRes, yearRes] = await Promise.all([
          axios.get(`${BASE}/grading-periods`, { headers }),
          axios.get(SCHOOLS_API, { headers }),
          axios.get(YEARS_API),
        ]);
        setPeriods(periodsRes.data);
        setAssignedSchools(schoolsRes.data);
        setActiveYear(yearRes.data);
        const active = periodsRes.data.find((p) => p.is_active);
        if (active) setSelectedPeriodId(active.id);
      } catch (err) {
        console.error(err);
      } finally {
        setInitLoading(false);
      }
    };
    fetchInit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedPeriodId) return;
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${BASE}/report/${selectedPeriodId}`, {
          headers,
        });
        setReportData(res.data.report);
        setGradeLevels(res.data.gradeLevels);
        setSelectedGradeId("all");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriodId]);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);

  const displayData =
    selectedGradeId === "all"
      ? reportData || []
      : reportData?.filter((g) => g.grade_level_id === selectedGradeId) || [];

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>MPS Report — ${selectedPeriod?.period_name}</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 5px 8px; text-align: center; }
            th { background: #f0f9ff; font-weight: bold; }
            td:first-child, th:first-child { text-align: left; }
            .avg-row td { font-weight: bold; background: #f0f9ff; }
            .grade-header { margin: 20px 0 4px; font-size: 13px; font-weight: bold; color: #004385; }
            .grade-sub { color: #666; font-size: 10px; margin-bottom: 6px; }
            .report-header { margin-bottom: 16px; padding-bottom: 10px; border-bottom: 1px solid #ddd; }
            .report-header h2 { margin: 0 0 4px; font-size: 15px; }
            .report-header p { margin: 2px 0; color: #555; }
            @media print { .page-break { page-break-before: always; } }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleExportCSV = () => {
    if (!reportData || !selectedPeriod) return;
    const gradesToExport =
      selectedGradeId === "all"
        ? reportData
        : reportData.filter((g) => g.grade_level_id === selectedGradeId);

    const rows = [
      [`MPS Report — ${selectedPeriod.period_name}`],
      [
        `School: ${assignedSchools.map((s) => s.school_name).join(", ")}`,
        `SY: ${activeYear?.year_label || ""}`,
      ],
      [],
    ];

    gradesToExport.forEach((grade) => {
      const avgs = computeAverages(grade.subjects);
      rows.push([grade.grade_name, `${grade.section_count} sections combined`]);
      rows.push([
        `Sections: ${grade.sections?.map((s) => `${s.section_name} (${s.adviser_name || "No adviser"})`).join(", ")}`,
      ]);
      rows.push([
        "Subject",
        "Male MPS",
        "Male SD",
        "Female MPS",
        "Female SD",
        "Class MPS",
        "Class SD",
      ]);
      grade.subjects.forEach((r) => {
        rows.push([
          r.subject_name,
          r.male.mps ? `${r.male.mps}%` : "—",
          r.male.sd ?? "—",
          r.female.mps ? `${r.female.mps}%` : "—",
          r.female.sd ?? "—",
          r.class.mps ? `${r.class.mps}%` : "—",
          r.class.sd ?? "—",
        ]);
      });
      rows.push([
        "Average",
        avgs.male.mps ? `${avgs.male.mps}%` : "—",
        avgs.male.sd ?? "—",
        avgs.female.mps ? `${avgs.female.mps}%` : "—",
        avgs.female.sd ?? "—",
        avgs.class.mps ? `${avgs.class.mps}%` : "—",
        avgs.class.sd ?? "—",
      ]);
      rows.push([]);
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MPS_Report_${selectedPeriod.period_name}_${selectedGradeId === "all" ? "All_Grades" : gradeLevels.find((g) => g.id === selectedGradeId)?.grade_name}.csv`;
    a.click();
  };

  if (initLoading)
    return (
      <div className="text-center py-20 text-gray-400 animate-pulse text-sm">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">MPS Report</h1>
          <p className="text-sm text-gray-400 mt-1">
            Mean Percentage Score by Grade Level — All Sections Combined
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-xl transition hover:opacity-90"
            style={{
              background: "rgba(0,151,178,0.08)",
              color: "#0097b2",
              border: "1px solid rgba(0,151,178,0.2)",
            }}
          >
            <PrinterIcon size={14} />
            Print
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 text-white text-sm rounded-xl transition hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #0097b2, #004385)",
              boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
            }}
          >
            <Download size={14} />
            Export CSV
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

      {/* ── Info Cards ── */}
      <div className="flex flex-wrap gap-3">
        {assignedSchools.map((school) => (
          <div
            key={school.id}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{
              background: "rgba(0,151,178,0.04)",
              border: "1px solid rgba(0,151,178,0.12)",
            }}
          >
            <School size={14} style={{ color: "#10b981" }} />
            <div>
              <p className="text-xs text-gray-400">School</p>
              <p className="text-sm font-black text-[#242424]">
                {school.school_name}
              </p>
            </div>
          </div>
        ))}
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: "rgba(0,151,178,0.04)",
            border: "1px solid rgba(0,151,178,0.12)",
          }}
        >
          <CalendarDays size={14} style={{ color: "#f97316" }} />
          <div>
            <p className="text-xs text-gray-400">School Year</p>
            <p className="text-sm font-black text-[#242424]">
              {activeYear ? `SY ${activeYear.year_label}` : "—"}
            </p>
          </div>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: "rgba(0,151,178,0.04)",
            border: "1px solid rgba(0,151,178,0.12)",
          }}
        >
          <TrendingUp size={14} style={{ color: "#8b5cf6" }} />
          <div>
            <p className="text-xs text-gray-400">Grade Levels</p>
            <p className="text-sm font-black text-[#242424]">
              {gradeLevels.length}
            </p>
          </div>
        </div>
      </div>

      {/* ── Quarter Tabs ── */}
      <div className="flex flex-wrap gap-2">
        {periods.map((period) => {
          const isSelected = selectedPeriodId === period.id;
          return (
            <button
              key={period.id}
              onClick={() => setSelectedPeriodId(period.id)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition"
              style={
                isSelected
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
              {period.period_name}
              {!!period.is_active && (
                <span
                  className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                  style={
                    isSelected
                      ? { background: "rgba(255,255,255,0.25)", color: "white" }
                      : { background: "rgba(16,185,129,0.1)", color: "#10b981" }
                  }
                >
                  Active
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Grade Level Filter ── */}
      {gradeLevels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedGradeId("all")}
            className="px-4 py-2 rounded-xl text-sm font-semibold transition"
            style={
              selectedGradeId === "all"
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
            All Grades
          </button>
          {gradeLevels.map((grade) => {
            const isSelected = selectedGradeId === grade.id;
            return (
              <button
                key={grade.id}
                onClick={() => setSelectedGradeId(grade.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition"
                style={
                  isSelected
                    ? {
                        background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                        color: "white",
                        boxShadow: "0 4px 12px rgba(139,92,246,0.3)",
                      }
                    : {
                        background: "white",
                        color: "#242424",
                        border: "1px solid rgba(139,92,246,0.2)",
                      }
                }
              >
                <BookOpen size={13} />
                {grade.grade_name}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Report Content ── */}
      {loading ? (
        <div className="text-center py-12 text-gray-400 animate-pulse text-sm">
          Loading report...
        </div>
      ) : !reportData?.length ? (
        <div
          className="text-center py-12 text-gray-400"
          style={{
            border: "2px dashed rgba(0,151,178,0.2)",
            borderRadius: "1rem",
          }}
        >
          <TrendingUp size={28} className="mx-auto mb-2 opacity-30" />
          <p className="text-sm">No data found for selected quarter.</p>
          <p className="text-xs mt-1">Teachers need to encode scores first.</p>
        </div>
      ) : (
        <div ref={printRef} className="flex flex-col gap-6">
          {/* Print header */}
          <div className="hidden print:block mb-2">
            <div className="report-header">
              <h2>MPS Report — {selectedPeriod?.period_name}</h2>
              <p>
                School: {assignedSchools.map((s) => s.school_name).join(", ")}
              </p>
              <p>School Year: SY {activeYear?.year_label}</p>
              <p>Table: MEAN PERCENTAGE SCORE (MPS) by Learning Area</p>
            </div>
          </div>

          {/* Grade Tables */}
          {displayData.map((gradeData, index) => (
            <div
              key={gradeData.grade_level_id}
              className={index > 0 ? "print:page-break" : ""}
            >
              <GradeTable
                gradeData={gradeData}
                periodName={selectedPeriod?.period_name}
              />
            </div>
          ))}

          {/* Legend */}
          <div className="flex flex-wrap gap-4 pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
              MPS Legend:
            </p>
            {[
              { label: "Outstanding (≥90%)", color: "#10b981" },
              { label: "Satisfactory (75-89%)", color: "#0097b2" },
              { label: "Developing (60-74%)", color: "#f59e0b" },
              { label: "Beginning (<60%)", color: "#ef4444" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span
                  className="w-3 h-3 rounded-full inline-block"
                  style={{ background: item.color }}
                />
                <span className="text-xs text-gray-500">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolHeadMPSReport;
