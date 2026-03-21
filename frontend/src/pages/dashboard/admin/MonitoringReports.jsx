import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  School,
  CalendarDays,
  TrendingUp,
  PrinterIcon,
  Download,
  Users,
  Building2,
  ChevronRight,
  ArrowLeft,
  BarChart2,
} from "lucide-react";
import axios from "axios";

const BASE = "http://localhost:5000/api/admin/monitoring";

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

const getMPSLabel = (mps) => {
  if (!mps) return "No data";
  const val = Number(mps);
  if (val >= 90) return "Outstanding";
  if (val >= 75) return "Satisfactory";
  if (val >= 60) return "Developing";
  return "Beginning";
};

const computeAverages = (data) => {
  if (!data?.length)
    return {
      male: { mps: null, sd: null },
      female: { mps: null, sd: null },
      class: { mps: null, sd: null },
    };
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

const MPSTable = ({ subjects, title, subtitle, adviser }) => {
  const averages = computeAverages(subjects || []);
  const hasData = subjects?.some((r) => r.class.mps !== null);

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: "white", border: "1px solid rgba(0,151,178,0.1)" }}
    >
      <div
        className="px-5 py-3 border-b border-gray-100 flex items-center justify-between"
        style={{ background: "rgba(248,248,255,0.8)" }}
      >
        <div>
          <p className="text-sm font-black text-[#242424]">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
          {adviser !== undefined && (
            <div className="flex items-center gap-1.5 mt-1">
              <Users
                size={11}
                style={{ color: adviser ? "#0097b2" : "#f97316" }}
              />
              {adviser ? (
                <span
                  className="text-xs font-semibold"
                  style={{ color: "#0097b2" }}
                >
                  Adviser: {adviser}
                </span>
              ) : (
                <span className="text-xs text-orange-400 font-semibold">
                  No adviser assigned
                </span>
              )}
            </div>
          )}
        </div>
        {averages.class.mps && (
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">Class Avg</p>
            <p
              className="text-xl font-black"
              style={{ color: getMPSColor(averages.class.mps) }}
            >
              {averages.class.mps}%
            </p>
          </div>
        )}
      </div>

      {!subjects?.length || !hasData ? (
        <div className="px-5 py-8 flex flex-col items-center justify-center text-gray-400">
          <TrendingUp size={24} className="mb-2 opacity-20" />
          <p className="text-sm font-semibold">No scores encoded yet</p>
          <p className="text-xs mt-0.5">
            Waiting for teacher to encode scores.
          </p>
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
              {subjects.map((row) => (
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
            </tbody>
          </table>
        </div>
      )}

      <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-4">
        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
          Legend:
        </p>
        {[
          { label: "Outstanding (≥90%)", color: "#10b981" },
          { label: "Satisfactory (75-89%)", color: "#0097b2" },
          { label: "Developing (60-74%)", color: "#f59e0b" },
          { label: "Beginning (<60%)", color: "#ef4444" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: item.color }}
            />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Vertical Bar Chart ──
const BarChart = ({
  data,
  labelKey,
  mpsKey,
  maleMpsKey,
  femaleMpsKey,
  title,
  subtitle,
}) => {
  if (!data?.length)
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <BarChart2 size={28} className="mb-2 opacity-30" />
        <p className="text-sm">No MPS data yet.</p>
      </div>
    );

  return (
    <div className="flex flex-col gap-3">
      {title && (
        <div>
          <p className="text-sm font-black text-[#242424]">{title}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      )}
      <div className="flex gap-2">
        {/* Y axis */}
        <div
          className="flex flex-col justify-between text-right pr-2 shrink-0"
          style={{ height: "220px", paddingBottom: "36px" }}
        >
          {[100, 75, 50, 25, 0].map((val) => (
            <span key={val} className="text-xs text-gray-300">
              {val}%
            </span>
          ))}
        </div>
        {/* Chart */}
        <div className="flex-1 relative min-w-0">
          <div
            className="absolute inset-0 flex flex-col justify-between pointer-events-none"
            style={{ height: "220px", paddingBottom: "36px" }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-full border-t border-dashed border-gray-100"
              />
            ))}
          </div>
          <div
            className="flex items-end justify-around gap-1 px-2"
            style={{ height: "220px", paddingBottom: "36px" }}
          >
            {data.map((item, idx) => {
              const mps = item[mpsKey] ? Number(item[mpsKey]) : null;
              const maleMps =
                maleMpsKey && item[maleMpsKey]
                  ? Number(item[maleMpsKey])
                  : null;
              const femaleMps =
                femaleMpsKey && item[femaleMpsKey]
                  ? Number(item[femaleMpsKey])
                  : null;
              const color = getMPSColor(mps);

              return (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-1 group relative min-w-0"
                >
                  {/* Tooltip */}
                  <div
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10
                    hidden group-hover:flex flex-col items-center
                    bg-[#242424] text-white text-xs rounded-xl px-3 py-2 shadow-lg
                    whitespace-nowrap pointer-events-none"
                  >
                    <span className="font-black">{item[labelKey]}</span>
                    {mps && (
                      <span className="text-white/70">Class: {mps}%</span>
                    )}
                    {maleMps && (
                      <span className="text-blue-300">Male: {maleMps}%</span>
                    )}
                    {femaleMps && (
                      <span className="text-pink-300">
                        Female: {femaleMps}%
                      </span>
                    )}
                    {!mps && <span className="text-gray-400">No data</span>}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#242424]" />
                  </div>

                  {mps && (
                    <span className="text-xs font-black mb-1" style={{ color }}>
                      {mps}%
                    </span>
                  )}

                  <div
                    className="flex items-end justify-center gap-0.5 w-full"
                    style={{ height: "140px" }}
                  >
                    {maleMps && (
                      <div
                        className="rounded-t-md transition-all duration-700 min-w-0"
                        style={{
                          height: `${(maleMps / 100) * 100}%`,
                          flex: "1",
                          maxWidth: "10%",
                          background: "rgba(59,130,246,0.65)",
                        }}
                      />
                    )}
                    <div
                      className="rounded-t-md transition-all duration-700 min-w-0"
                      style={{
                        height: mps ? `${(mps / 100) * 100}%` : "4px",
                        flex: maleMps || femaleMps ? "1.4" : "1",
                        maxWidth: maleMps || femaleMps ? "20%" : "60%",
                        background: mps ? color : "#e5e7eb",
                      }}
                    />
                    {femaleMps && (
                      <div
                        className="rounded-t-md transition-all duration-700 min-w-0"
                        style={{
                          height: `${(femaleMps / 100) * 100}%`,
                          flex: "1",
                          maxWidth: "10%",
                          background: "rgba(236,72,153,0.65)",
                        }}
                      />
                    )}
                  </div>

                  <span className="text-xs font-semibold text-gray-500 text-center truncate w-full mt-1 px-1">
                    {item[labelKey]
                      ?.replace(" Elementary School", " ES")
                      ?.replace(" Elementary", " ES")
                      ?.replace(" School", " S")
                      ?.replace("Cluster ", "C")}
                  </span>
                </div>
              );
            })}
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
              <span className="text-xs text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MonitoringReports = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [activeTab, setActiveTab] = useState("overview");
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Report tab
  const [reportData, setReportData] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [viewMode, setViewMode] = useState("combined");
  const [reportLoading, setReportLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  // Overview filters
  const [selectedClusterFilter, setSelectedClusterFilter] = useState("all");

  const printRef = useRef();

  // Fetch overview
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${BASE}/overview`, { headers });
        setOverview(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setOverviewLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch grading periods
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${BASE}/grading-periods`, { headers });
        setPeriods(res.data);
        const active = res.data.find((p) => p.is_active);
        if (active) setSelectedPeriodId(active.id);
      } catch (err) {
        console.error(err);
      } finally {
        setInitLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch report when period changes
  useEffect(() => {
    if (!selectedPeriodId) return;
    const fetch = async () => {
      setReportLoading(true);
      setSelectedCluster(null);
      setSelectedSchool(null);
      setSelectedGrade(null);
      try {
        const res = await axios.get(`${BASE}/mps-report/${selectedPeriodId}`, {
          headers,
        });
        setReportData(res.data.report);
      } catch (err) {
        console.error(err);
      } finally {
        setReportLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriodId]);

  const selectedPeriod = periods.find((p) => p.id === selectedPeriodId);
  const selectedClusterData = reportData?.find(
    (c) => c.cluster_id === selectedCluster?.cluster_id,
  );
  const selectedSchoolData = selectedClusterData?.schools?.find(
    (s) => s.school_id === selectedSchool?.school_id,
  );
  const selectedGradeData = selectedSchoolData?.grades?.find(
    (g) => g.grade_level_id === selectedGrade?.grade_level_id,
  );

  // Filtered school MPS for overview
  const filteredSchoolMPS =
    selectedClusterFilter === "all"
      ? overview?.school_mps || []
      : overview?.school_mps?.filter(
          (s) => s.cluster_id === Number(selectedClusterFilter),
        ) || [];

  // Best/Lowest school
  const bestSchool = overview?.school_mps?.length
    ? overview.school_mps.reduce((a, b) =>
        Number(a.class_mps) > Number(b.class_mps) ? a : b,
      )
    : null;
  const lowestSchool = overview?.school_mps?.length
    ? overview.school_mps.reduce((a, b) =>
        Number(a.class_mps) < Number(b.class_mps) ? a : b,
      )
    : null;

  // Best/Lowest cluster
  const clusterWithMPS =
    overview?.cluster_mps?.filter((c) => c.class_mps) || [];
  const bestCluster = clusterWithMPS.length
    ? clusterWithMPS.reduce((a, b) =>
        Number(a.class_mps) > Number(b.class_mps) ? a : b,
      )
    : null;
  const lowestCluster = clusterWithMPS.length
    ? clusterWithMPS.reduce((a, b) =>
        Number(a.class_mps) < Number(b.class_mps) ? a : b,
      )
    : null;

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>MPS Report</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 11px; padding: 20px; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0 16px; }
        th, td { border: 1px solid #ddd; padding: 5px 8px; text-align: center; }
        th { background: #f0f9ff; font-weight: bold; }
        td:first-child, th:first-child { text-align: left; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleExportCSV = () => {
    if (!selectedGrade || !selectedPeriod) return;
    const rows = [
      [
        `MPS Report — ${selectedCluster?.cluster_name} — ${selectedSchool?.school_name} — ${selectedPeriod.period_name}`,
      ],
      [],
    ];

    const addTableRows = (subjects, label, adviser) => {
      rows.push([label, adviser ? `Adviser: ${adviser}` : ""]);
      rows.push([
        "Subject",
        "Male MPS",
        "Male SD",
        "Female MPS",
        "Female SD",
        "Class MPS",
        "Class SD",
      ]);
      subjects?.forEach((r) => {
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
      const avgs = computeAverages(subjects);
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
    };

    const gradesToExport =
      selectedGrade.grade_level_id === "all"
        ? selectedSchoolData?.grades || []
        : selectedSchoolData?.grades?.filter(
            (g) => g.grade_level_id === selectedGrade.grade_level_id,
          ) || [];

    gradesToExport.forEach((grade) => {
      rows.push([`=== ${grade.grade_name} ===`]);
      if (viewMode === "combined" || viewMode === "both")
        addTableRows(grade.combined, `${grade.grade_name} — Combined`);
      if (viewMode === "section" || viewMode === "both")
        grade.sections?.forEach((sec) =>
          addTableRows(
            sec.subjects,
            `Section ${sec.section_name}`,
            sec.adviser_name,
          ),
        );
    });

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MPS_${selectedSchool?.school_name}_${selectedGrade.grade_level_id === "all" ? "All_Grades" : selectedGrade.grade_name}_${selectedPeriod.period_name}.csv`;
    a.click();
  };

  const currentStep = !selectedCluster
    ? 1
    : !selectedSchool
      ? 2
      : !selectedGrade
        ? 3
        : 4;

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">
            Monitoring & Reports
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Division-wide MPS monitoring and analysis
          </p>
        </div>
        {activeTab === "report" && currentStep === 4 && (
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
        )}
      </div>

      {/* ── Divider ── */}
      <div
        className="h-px w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      {/* ── Main Tabs ── */}
      <div className="flex gap-2">
        {[
          {
            value: "overview",
            label: "Overview",
            icon: <BarChart2 size={13} />,
          },
          {
            value: "report",
            label: "MPS Report",
            icon: <BookOpen size={13} />,
          },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition"
            style={
              activeTab === tab.value
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
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════
          TAB 1 — OVERVIEW
      ══════════════════════════════ */}
      {activeTab === "overview" &&
        (overviewLoading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse text-sm">
            Loading overview...
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* ── Info Bar ── */}
            <div className="flex flex-wrap gap-3">
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
                    SY {overview?.active_year?.year_label || "—"}
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
                <TrendingUp size={14} style={{ color: "#0097b2" }} />
                <div>
                  <p className="text-xs text-gray-400">Active Quarter</p>
                  <p className="text-sm font-black text-[#242424]">
                    {overview?.active_quarter?.period_name || "None"}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                {
                  label: "Clusters",
                  value: overview?.stats?.total_clusters,
                  icon: <Building2 size={18} className="text-white" />,
                  bg: "linear-gradient(135deg, #0097b2, #004385)",
                  shadow: "rgba(0,151,178,0.35)",
                },
                {
                  label: "Schools",
                  value: overview?.stats?.total_schools,
                  icon: <School size={18} className="text-white" />,
                  bg: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                  shadow: "rgba(139,92,246,0.35)",
                },
                {
                  label: "Sections",
                  value: overview?.stats?.total_sections,
                  icon: <BookOpen size={18} className="text-white" />,
                  bg: "linear-gradient(135deg, #10b981, #059669)",
                  shadow: "rgba(16,185,129,0.35)",
                },
                {
                  label: "Teachers",
                  value: overview?.stats?.total_teachers,
                  icon: <Users size={18} className="text-white" />,
                  bg: "linear-gradient(135deg, #f97316, #fb923c)",
                  shadow: "rgba(249,115,22,0.35)",
                },
                {
                  label: "Students",
                  value: overview?.stats?.total_students,
                  icon: <Users size={18} className="text-white" />,
                  bg: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                  shadow: "rgba(59,130,246,0.35)",
                },
                {
                  label: "Female",
                  value: overview?.stats?.female_students,
                  icon: <Users size={18} className="text-white" />,
                  bg: "linear-gradient(135deg, #ec4899, #f472b6)",
                  shadow: "rgba(236,72,153,0.35)",
                },
              ].map((card, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                  style={{
                    background: card.bg,
                    boxShadow: `0 6px 18px ${card.shadow}`,
                  }}
                >
                  <div className="p-1.5 rounded-xl bg-white/20 shrink-0">
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-xl font-black text-white leading-none">
                      {card.value ?? "—"}
                    </p>
                    <p className="text-xs text-white/80 uppercase tracking-wider mt-0.5">
                      {card.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Best/Lowest Cluster + School ── */}
            {(bestCluster || bestSchool) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {bestCluster && (
                  <div
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{
                      background: "rgba(16,185,129,0.06)",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    <span className="text-xl shrink-0">🏆</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        Best Cluster
                      </p>
                      <p className="text-sm font-black text-[#242424] truncate">
                        {bestCluster.cluster_name}
                      </p>
                      <p className="text-xs" style={{ color: "#10b981" }}>
                        {getMPSLabel(bestCluster.class_mps)}
                      </p>
                    </div>
                    <p
                      className="text-xl font-black shrink-0"
                      style={{ color: "#10b981" }}
                    >
                      {bestCluster.class_mps}%
                    </p>
                  </div>
                )}
                {lowestCluster &&
                  lowestCluster.cluster_id !== bestCluster?.cluster_id && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-2xl"
                      style={{
                        background: "rgba(249,115,22,0.06)",
                        border: "1px solid rgba(249,115,22,0.2)",
                      }}
                    >
                      <span className="text-xl shrink-0">⚠️</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Needs Attention
                        </p>
                        <p className="text-sm font-black text-[#242424] truncate">
                          {lowestCluster.cluster_name}
                        </p>
                        <p className="text-xs" style={{ color: "#f97316" }}>
                          {getMPSLabel(lowestCluster.class_mps)}
                        </p>
                      </div>
                      <p
                        className="text-xl font-black shrink-0"
                        style={{ color: "#f97316" }}
                      >
                        {lowestCluster.class_mps}%
                      </p>
                    </div>
                  )}
                {bestSchool && (
                  <div
                    className="flex items-center gap-3 p-4 rounded-2xl"
                    style={{
                      background: "rgba(16,185,129,0.06)",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    <span className="text-xl shrink-0">🥇</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                        Best School
                      </p>
                      <p className="text-sm font-black text-[#242424] truncate">
                        {bestSchool.school_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {bestSchool.cluster_name}
                      </p>
                    </div>
                    <p
                      className="text-xl font-black shrink-0"
                      style={{ color: "#10b981" }}
                    >
                      {bestSchool.class_mps}%
                    </p>
                  </div>
                )}
                {lowestSchool &&
                  lowestSchool.school_id !== bestSchool?.school_id && (
                    <div
                      className="flex items-center gap-3 p-4 rounded-2xl"
                      style={{
                        background: "rgba(249,115,22,0.06)",
                        border: "1px solid rgba(249,115,22,0.2)",
                      }}
                    >
                      <span className="text-xl shrink-0">📉</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                          Lowest School
                        </p>
                        <p className="text-sm font-black text-[#242424] truncate">
                          {lowestSchool.school_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {lowestSchool.cluster_name}
                        </p>
                      </div>
                      <p
                        className="text-xl font-black shrink-0"
                        style={{ color: "#f97316" }}
                      >
                        {lowestSchool.class_mps}%
                      </p>
                    </div>
                  )}
              </div>
            )}

            {/* ── MPS per Cluster chart ── */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "white",
                border: "1px solid rgba(0,151,178,0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-black text-[#242424]">
                    MPS per Cluster
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {overview?.active_quarter?.period_name ||
                      "No active quarter"}{" "}
                    · Class MPS
                  </p>
                </div>
                <Building2 size={18} style={{ color: "#0097b2" }} />
              </div>
              <BarChart
                data={overview?.cluster_mps?.filter((c) => c.class_mps) || []}
                labelKey="cluster_name"
                mpsKey="class_mps"
                maleMpsKey="male_mps"
                femaleMpsKey="female_mps"
              />
            </div>

            {/* ── MPS per School chart ── */}
            <div
              className="rounded-2xl p-5"
              style={{
                background: "white",
                border: "1px solid rgba(0,151,178,0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-black text-[#242424]">
                    MPS per School
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {overview?.active_quarter?.period_name ||
                      "No active quarter"}{" "}
                    · Class MPS
                  </p>
                </div>
                {/* Cluster filter */}
                <select
                  value={selectedClusterFilter}
                  onChange={(e) => setSelectedClusterFilter(e.target.value)}
                  className="text-xs rounded-xl px-3 py-1.5 text-[#242424]"
                  style={{
                    background: "rgba(0,151,178,0.06)",
                    border: "1px solid rgba(0,151,178,0.15)",
                  }}
                >
                  <option value="all">All Clusters</option>
                  {overview?.clusters?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.cluster_name}
                    </option>
                  ))}
                </select>
              </div>
              <BarChart
                data={filteredSchoolMPS}
                labelKey="school_name"
                mpsKey="class_mps"
                maleMpsKey="male_mps"
                femaleMpsKey="female_mps"
              />
            </div>
          </div>
        ))}

      {/* ══════════════════════════════
          TAB 2 — MPS REPORT
      ══════════════════════════════ */}
      {activeTab === "report" &&
        (initLoading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse text-sm">
            Loading...
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* ── Quarter tabs ── */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Quarter
              </p>
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
                      {period.period_name}
                      {!!period.is_active && (
                        <span
                          className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                          style={
                            isSelected
                              ? {
                                  background: "rgba(255,255,255,0.25)",
                                  color: "white",
                                }
                              : {
                                  background: "rgba(16,185,129,0.1)",
                                  color: "#10b981",
                                }
                          }
                        >
                          Active
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {reportLoading ? (
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
              </div>
            ) : (
              <>
                {/* ── Breadcrumb ── */}
                {selectedCluster && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <button
                      onClick={() => {
                        setSelectedCluster(null);
                        setSelectedSchool(null);
                        setSelectedGrade(null);
                      }}
                      className="hover:text-[#0097b2] transition flex items-center gap-1"
                    >
                      <ArrowLeft size={11} />
                      Clusters
                    </button>
                    <ChevronRight size={11} />
                    <span
                      className="font-semibold"
                      style={{ color: "#0097b2" }}
                    >
                      {selectedCluster.cluster_name}
                    </span>
                    {selectedSchool && (
                      <>
                        <ChevronRight size={11} />
                        <button
                          onClick={() => {
                            setSelectedSchool(null);
                            setSelectedGrade(null);
                          }}
                          className="hover:text-[#10b981] transition"
                        >
                          Schools
                        </button>
                        <ChevronRight size={11} />
                        <span
                          className="font-semibold"
                          style={{ color: "#10b981" }}
                        >
                          {selectedSchool.school_name}
                        </span>
                      </>
                    )}
                    {selectedGrade && (
                      <>
                        <ChevronRight size={11} />
                        <button
                          onClick={() => setSelectedGrade(null)}
                          className="hover:text-[#8b5cf6] transition"
                        >
                          Grades
                        </button>
                        <ChevronRight size={11} />
                        <span
                          className="font-semibold"
                          style={{ color: "#8b5cf6" }}
                        >
                          {selectedGrade.grade_name}
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* ── Step 1: Cluster cards ── */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                    Select Cluster
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {reportData.map((cluster) => {
                      const isSelected =
                        selectedCluster?.cluster_id === cluster.cluster_id;
                      const totalSchools = cluster.schools?.length || 0;
                      const hasData = cluster.schools?.some((s) =>
                        s.grades?.some((g) =>
                          g.combined?.some((sub) => sub.class.mps !== null),
                        ),
                      );
                      return (
                        <button
                          key={cluster.cluster_id}
                          onClick={() => {
                            setSelectedCluster(cluster);
                            setSelectedSchool(null);
                            setSelectedGrade(null);
                          }}
                          className="flex items-center gap-3 p-4 rounded-2xl text-left transition hover:-translate-y-0.5"
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
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                }
                          }
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{
                              background: isSelected
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(0,151,178,0.08)",
                            }}
                          >
                            <Building2
                              size={18}
                              style={{
                                color: isSelected ? "white" : "#0097b2",
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-black truncate"
                              style={{
                                color: isSelected ? "white" : "#242424",
                              }}
                            >
                              {cluster.cluster_name}
                            </p>
                            <p
                              className="text-xs mt-0.5"
                              style={{
                                color: isSelected
                                  ? "rgba(255,255,255,0.7)"
                                  : "rgba(0,0,0,0.4)",
                              }}
                            >
                              {totalSchools}{" "}
                              {totalSchools === 1 ? "school" : "schools"}
                            </p>
                            {!hasData && (
                              <p className="text-xs mt-0.5 text-orange-400">
                                No data yet
                              </p>
                            )}
                          </div>
                          <ChevronRight
                            size={16}
                            style={{
                              color: isSelected
                                ? "rgba(255,255,255,0.7)"
                                : "rgba(0,0,0,0.2)",
                            }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Step 2: School cards ── */}
                {selectedCluster && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                      Select School — {selectedCluster.cluster_name}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedClusterData?.schools?.map((school) => {
                        const isSelected =
                          selectedSchool?.school_id === school.school_id;
                        const totalGrades = school.grades?.length || 0;
                        const hasData = school.grades?.some((g) =>
                          g.combined?.some((s) => s.class.mps !== null),
                        );
                        return (
                          <button
                            key={school.school_id}
                            onClick={() => {
                              setSelectedSchool(school);
                              setSelectedGrade(null);
                            }}
                            className="flex items-center gap-3 p-4 rounded-2xl text-left transition hover:-translate-y-0.5"
                            style={
                              isSelected
                                ? {
                                    background:
                                      "linear-gradient(135deg, #10b981, #059669)",
                                    boxShadow:
                                      "0 6px 18px rgba(16,185,129,0.35)",
                                  }
                                : {
                                    background: "white",
                                    border: "1px solid rgba(16,185,129,0.15)",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                  }
                            }
                          >
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{
                                background: isSelected
                                  ? "rgba(255,255,255,0.2)"
                                  : "rgba(16,185,129,0.08)",
                              }}
                            >
                              <School
                                size={18}
                                style={{
                                  color: isSelected ? "white" : "#10b981",
                                }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p
                                className="text-sm font-black truncate"
                                style={{
                                  color: isSelected ? "white" : "#242424",
                                }}
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
                                {totalGrades} grade{" "}
                                {totalGrades === 1 ? "level" : "levels"}
                              </p>
                              {!hasData && (
                                <p className="text-xs mt-0.5 text-orange-400">
                                  No data yet
                                </p>
                              )}
                            </div>
                            <ChevronRight
                              size={16}
                              style={{
                                color: isSelected
                                  ? "rgba(255,255,255,0.7)"
                                  : "rgba(0,0,0,0.2)",
                              }}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Step 3: Grade tabs ── */}
                {selectedSchool && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                      Select Grade Level — {selectedSchool.school_name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          setSelectedGrade({
                            grade_level_id: "all",
                            grade_name: "All Grades",
                          })
                        }
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                        style={
                          selectedGrade?.grade_level_id === "all"
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
                        <TrendingUp size={13} />
                        All Grades
                      </button>
                      {selectedSchoolData?.grades?.map((grade) => {
                        const isSelected =
                          selectedGrade?.grade_level_id ===
                          grade.grade_level_id;
                        const hasData = grade.combined?.some(
                          (s) => s.class.mps !== null,
                        );
                        return (
                          <button
                            key={grade.grade_level_id}
                            onClick={() => setSelectedGrade(grade)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                            style={
                              isSelected
                                ? {
                                    background:
                                      "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                                    color: "white",
                                    boxShadow:
                                      "0 4px 12px rgba(139,92,246,0.3)",
                                  }
                                : {
                                    background: hasData
                                      ? "white"
                                      : "rgba(0,0,0,0.02)",
                                    color: hasData ? "#242424" : "#9ca3af",
                                    border: hasData
                                      ? "1px solid rgba(139,92,246,0.2)"
                                      : "1px dashed rgba(0,0,0,0.1)",
                                  }
                            }
                          >
                            <BookOpen size={13} />
                            {grade.grade_name}
                            {!hasData && (
                              <span className="text-xs opacity-60">—</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ── Step 4: Tables ── */}
                {selectedGrade && (
                  <div ref={printRef} className="flex flex-col gap-5">
                    {/* View mode */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                        View:
                      </span>
                      {[
                        { value: "combined", label: "Combined" },
                        { value: "section", label: "Per Section" },
                        { value: "both", label: "Both" },
                      ].map((mode) => (
                        <button
                          key={mode.value}
                          onClick={() => setViewMode(mode.value)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                          style={
                            viewMode === mode.value
                              ? {
                                  background:
                                    "linear-gradient(135deg, #0097b2, #004385)",
                                  color: "white",
                                  boxShadow: "0 4px 12px rgba(0,151,178,0.25)",
                                }
                              : {
                                  background: "white",
                                  color: "#242424",
                                  border: "1px solid rgba(0,151,178,0.2)",
                                }
                          }
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>

                    {/* All Grades */}
                    {selectedGrade.grade_level_id === "all" ? (
                      <div className="flex flex-col gap-8">
                        {selectedSchoolData?.grades?.map((grade) => (
                          <div
                            key={grade.grade_level_id}
                            className="flex flex-col gap-4"
                          >
                            <div className="flex items-center gap-2">
                              <BookOpen
                                size={13}
                                style={{ color: "#8b5cf6" }}
                              />
                              <span className="text-sm font-black text-[#242424]">
                                {grade.grade_name}
                              </span>
                              <span className="text-xs text-gray-400">
                                · {grade.section_count}{" "}
                                {grade.section_count === 1
                                  ? "section"
                                  : "sections"}
                              </span>
                              <div className="h-px flex-1 rounded-full bg-gray-100" />
                            </div>
                            {/* Section badges */}
                            <div className="flex flex-wrap gap-2">
                              {grade.sections?.map((sec, i) => (
                                <div
                                  key={i}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                                  style={{
                                    background: sec.adviser_name
                                      ? "rgba(0,151,178,0.06)"
                                      : "rgba(249,115,22,0.06)",
                                    border: `1px solid ${sec.adviser_name ? "rgba(0,151,178,0.2)" : "rgba(249,115,22,0.2)"}`,
                                  }}
                                >
                                  <BookOpen
                                    size={10}
                                    style={{
                                      color: sec.adviser_name
                                        ? "#0097b2"
                                        : "#f97316",
                                    }}
                                  />
                                  <span className="text-xs font-bold text-[#242424]">
                                    {sec.section_name}
                                  </span>
                                  <span className="text-xs text-gray-300">
                                    ·
                                  </span>
                                  <Users
                                    size={10}
                                    style={{
                                      color: sec.adviser_name
                                        ? "#0097b2"
                                        : "#f97316",
                                    }}
                                  />
                                  <span
                                    className="text-xs font-semibold"
                                    style={{
                                      color: sec.adviser_name
                                        ? "#0097b2"
                                        : "#f97316",
                                    }}
                                  >
                                    {sec.adviser_name || "No adviser"}
                                  </span>
                                </div>
                              ))}
                            </div>
                            {(viewMode === "combined" ||
                              viewMode === "both") && (
                              <MPSTable
                                subjects={grade.combined}
                                title={`${grade.grade_name} — Combined MPS`}
                                subtitle={`All ${grade.section_count} sections · ${selectedPeriod?.period_name} · ${selectedSchool?.school_name}`}
                              />
                            )}
                            {(viewMode === "section" || viewMode === "both") &&
                              grade.sections?.map((sec) => (
                                <MPSTable
                                  key={sec.section_id}
                                  subjects={sec.subjects}
                                  title={`${grade.grade_name} — Section ${sec.section_name}`}
                                  subtitle={`${selectedPeriod?.period_name} · ${selectedSchool?.school_name}`}
                                  adviser={sec.adviser_name}
                                />
                              ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        {/* Section badges */}
                        <div className="flex flex-wrap gap-2">
                          {selectedGradeData?.sections?.map((sec, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                              style={{
                                background: sec.adviser_name
                                  ? "rgba(0,151,178,0.06)"
                                  : "rgba(249,115,22,0.06)",
                                border: `1px solid ${sec.adviser_name ? "rgba(0,151,178,0.2)" : "rgba(249,115,22,0.2)"}`,
                              }}
                            >
                              <BookOpen
                                size={10}
                                style={{
                                  color: sec.adviser_name
                                    ? "#0097b2"
                                    : "#f97316",
                                }}
                              />
                              <span className="text-xs font-bold text-[#242424]">
                                {sec.section_name}
                              </span>
                              <span className="text-xs text-gray-300">·</span>
                              <Users
                                size={10}
                                style={{
                                  color: sec.adviser_name
                                    ? "#0097b2"
                                    : "#f97316",
                                }}
                              />
                              <span
                                className="text-xs font-semibold"
                                style={{
                                  color: sec.adviser_name
                                    ? "#0097b2"
                                    : "#f97316",
                                }}
                              >
                                {sec.adviser_name || "No adviser"}
                              </span>
                            </div>
                          ))}
                        </div>
                        {(viewMode === "combined" || viewMode === "both") && (
                          <MPSTable
                            subjects={selectedGradeData?.combined}
                            title={`${selectedGrade.grade_name} — Combined MPS`}
                            subtitle={`All ${selectedGradeData?.section_count} sections · ${selectedPeriod?.period_name} · ${selectedSchool?.school_name}`}
                          />
                        )}
                        {(viewMode === "section" || viewMode === "both") &&
                          selectedGradeData?.sections?.map((sec) => (
                            <MPSTable
                              key={sec.section_id}
                              subjects={sec.subjects}
                              title={`${selectedGrade.grade_name} — Section ${sec.section_name}`}
                              subtitle={`${selectedPeriod?.period_name} · ${selectedSchool?.school_name}`}
                              adviser={sec.adviser_name}
                            />
                          ))}
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
    </div>
  );
};

export default MonitoringReports;
