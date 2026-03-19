import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  School,
  CalendarDays,
  PrinterIcon,
  Download,
  TrendingUp,
} from "lucide-react";
import axios from "axios";

const BASE = "http://localhost:5000/api/assessments";

// Color for MPS value
const getMPSColor = (mps) => {
  if (!mps) return "text-gray-300";
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

const MPSReport = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [activeYear, setActiveYear] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriodId, setSelectedPeriodId] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const [reportRes, yearRes] = await Promise.all([
          axios.get(`${BASE}/report`, { headers }),
          axios.get("http://localhost:5000/api/school-years/active"),
        ]);
        setData(reportRes.data);
        setActiveYear(yearRes.data);
        const active = reportRes.data.periods.find((p) => p.is_active);
        setSelectedPeriodId(active?.id || reportRes.data.periods[0]?.id);
      } catch (err) {
        console.error("Failed to fetch report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>MPS Report</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: center; }
            th { background: #f0f9ff; font-weight: bold; }
            td:first-child { text-align: left; }
            tr:last-child { font-weight: bold; background: #f8f8ff; }
            .header { margin-bottom: 16px; }
            .header h2 { margin: 0; font-size: 16px; }
            .header p { margin: 2px 0; color: #666; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const handleExportCSV = () => {
    if (!data || !selectedPeriodId) return;
    const quarter = data.report[selectedPeriodId];
    if (!quarter) return;

    const rows = [
      [`MPS Report - ${quarter.period_name}`],
      [
        `Section: ${data.section}`,
        `Grade: ${data.grade}`,
        `School: ${data.school}`,
      ],
      [],
      [
        "Subject",
        "Male MPS",
        "Male SD",
        "Female MPS",
        "Female SD",
        "Class MPS",
        "Class SD",
      ],
    ];

    quarter.data.forEach((row) => {
      rows.push([
        row.subject_name,
        row.male.mps ? `${row.male.mps}%` : "—",
        row.male.sd ?? "—",
        row.female.mps ? `${row.female.mps}%` : "—",
        row.female.sd ?? "—",
        row.class.mps ? `${row.class.mps}%` : "—",
        row.class.sd ?? "—",
      ]);
    });

    // Average row
    const avg = computeAverages(quarter.data);
    rows.push([
      "Average",
      avg.male.mps ? `${avg.male.mps}%` : "—",
      avg.male.sd ?? "—",
      avg.female.mps ? `${avg.female.mps}%` : "—",
      avg.female.sd ?? "—",
      avg.class.mps ? `${avg.class.mps}%` : "—",
      avg.class.sd ?? "—",
    ]);

    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `MPS_${data.section}_${quarter.period_name}.csv`;
    a.click();
  };

  // Compute averages for a quarter
  const computeAverages = (quarterData) => {
    const validMale = quarterData.filter((r) => r.male.mps !== null);
    const validFemale = quarterData.filter((r) => r.female.mps !== null);
    const validClass = quarterData.filter((r) => r.class.mps !== null);

    const avg = (arr, key) => {
      if (!arr.length) return null;
      return (
        arr.reduce((sum, r) => sum + Number(r[key].mps), 0) / arr.length
      ).toFixed(2);
    };

    const avgSD = (arr, key) => {
      if (!arr.length) return null;
      return (
        arr.reduce((sum, r) => sum + Number(r[key].sd || 0), 0) / arr.length
      ).toFixed(2);
    };

    return {
      male: { mps: avg(validMale, "male"), sd: avgSD(validMale, "male") },
      female: {
        mps: avg(validFemale, "female"),
        sd: avgSD(validFemale, "female"),
      },
      class: { mps: avg(validClass, "class"), sd: avgSD(validClass, "class") },
    };
  };

  if (loading)
    return (
      <div className="text-center py-20 text-gray-400 animate-pulse text-sm">
        Loading report...
      </div>
    );

  if (!data)
    return (
      <div className="text-center py-20 text-gray-400 text-sm">
        No report data found.
      </div>
    );

  const selectedQuarter = data.report[selectedPeriodId];
  const averages = selectedQuarter
    ? computeAverages(selectedQuarter.data)
    : null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">MPS Report</h1>
          <p className="text-sm text-gray-400 mt-1">
            Mean Percentage Score by Learning Area
          </p>
        </div>

        {/* Action Buttons */}
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

      {/* Divider */}
      <div
        className="h-px w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      {/* Section Info */}
      <div className="flex flex-wrap gap-3">
        {[
          {
            icon: <BookOpen size={14} style={{ color: "#0097b2" }} />,
            label: "Section",
            value: data.section,
          },
          {
            icon: <TrendingUp size={14} style={{ color: "#8b5cf6" }} />,
            label: "Grade Level",
            value: data.grade,
          },
          {
            icon: <School size={14} style={{ color: "#10b981" }} />,
            label: "School",
            value: data.school,
          },
          {
            icon: <CalendarDays size={14} style={{ color: "#f97316" }} />,
            label: "School Year",
            value: activeYear ? `SY ${activeYear.year_label}` : "—",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{
              background: "rgba(0,151,178,0.04)",
              border: "1px solid rgba(0,151,178,0.12)",
            }}
          >
            {item.icon}
            <div>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-sm font-black text-[#242424]">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quarter Tabs */}
      <div className="flex flex-wrap gap-2">
        {data.periods.map((period) => {
          const isSelected = selectedPeriodId === period.id;
          const quarterData = data.report[period.id]?.data || [];
          const hasData = quarterData.some((r) => r.class.mps !== null);

          return (
            <button
              key={period.id}
              onClick={() => setSelectedPeriodId(period.id)}
              className="relative px-5 py-2.5 rounded-xl text-sm font-semibold transition"
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
              {!hasData && !isSelected && (
                <span className="ml-2 text-xs text-gray-300">—</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Report Table */}
      {selectedQuarter && (
        <div ref={printRef}>
          {/* Print Header — only shows when printing */}
          <div className="hidden print:block mb-4">
            <h2 className="text-lg font-bold">
              {selectedQuarter.period_name} Assessment Result
            </h2>
            <p>
              Section: {data.section} | Grade: {data.grade} | School:{" "}
              {data.school}
            </p>
            <p>Table: MEAN PERCENTAGE SCORE (MPS) by Learning Area</p>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "white",
              border: "1px solid rgba(0,151,178,0.1)",
            }}
          >
            {/* Table Header */}
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-black text-[#242424]">
                {selectedQuarter.period_name} — MPS by Learning Area
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {data.section} · {data.grade} · {data.school}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "rgba(248,248,255,0.8)" }}>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 border-b border-gray-100">
                      Learning Area
                    </th>
                    {/* Male */}
                    <th
                      className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-b border-gray-100"
                      style={{ color: "#3b82f6" }}
                      colSpan={2}
                    >
                      Male
                    </th>
                    {/* Female */}
                    <th
                      className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-b border-gray-100"
                      style={{ color: "#ec4899" }}
                      colSpan={2}
                    >
                      Female
                    </th>
                    {/* Class */}
                    <th
                      className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider border-b border-gray-100"
                      style={{ color: "#0097b2" }}
                      colSpan={2}
                    >
                      Class
                    </th>
                  </tr>
                  <tr style={{ background: "rgba(248,248,255,0.5)" }}>
                    <th className="px-4 py-2 border-b border-gray-100"></th>
                    <th className="px-4 py-2 text-center text-xs text-gray-400 border-b border-gray-100">
                      MPS
                    </th>
                    <th className="px-4 py-2 text-center text-xs text-gray-400 border-b border-gray-100">
                      SD
                    </th>
                    <th className="px-4 py-2 text-center text-xs text-gray-400 border-b border-gray-100">
                      MPS
                    </th>
                    <th className="px-4 py-2 text-center text-xs text-gray-400 border-b border-gray-100">
                      SD
                    </th>
                    <th className="px-4 py-2 text-center text-xs text-gray-400 border-b border-gray-100">
                      MPS
                    </th>
                    <th className="px-4 py-2 text-center text-xs text-gray-400 border-b border-gray-100">
                      SD
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedQuarter.data.map((row) => (
                    <tr
                      key={row.subject_id}
                      className="border-t border-gray-50 hover:bg-gray-50/30 transition"
                    >
                      <td className="px-4 py-3 font-semibold text-[#242424]">
                        {row.subject_name}
                        <span className="ml-2 text-xs text-gray-400">
                          ({row.subject_code})
                        </span>
                      </td>

                      {/* Male */}
                      <td className="px-4 py-3 text-center">
                        {row.male.mps ? (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-lg"
                            style={{
                              color: getMPSColor(row.male.mps),
                              background: getMPSBg(row.male.mps),
                            }}
                          >
                            {row.male.mps}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">
                        {row.male.sd ?? "—"}
                      </td>

                      {/* Female */}
                      <td className="px-4 py-3 text-center">
                        {row.female.mps ? (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-lg"
                            style={{
                              color: getMPSColor(row.female.mps),
                              background: getMPSBg(row.female.mps),
                            }}
                          >
                            {row.female.mps}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">
                        {row.female.sd ?? "—"}
                      </td>

                      {/* Class */}
                      <td className="px-4 py-3 text-center">
                        {row.class.mps ? (
                          <span
                            className="text-xs font-semibold px-2 py-1 rounded-lg"
                            style={{
                              color: getMPSColor(row.class.mps),
                              background: getMPSBg(row.class.mps),
                            }}
                          >
                            {row.class.mps}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-500">
                        {row.class.sd ?? "—"}
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
                      <td className="px-4 py-3 font-black text-[#242424] text-sm">
                        Average
                      </td>

                      {/* Male Average */}
                      <td className="px-4 py-3 text-center">
                        {averages.male.mps ? (
                          <span
                            className="text-xs font-black px-2 py-1 rounded-lg"
                            style={{
                              color: getMPSColor(averages.male.mps),
                              background: getMPSBg(averages.male.mps),
                            }}
                          >
                            {averages.male.mps}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                        {averages.male.sd ?? "—"}
                      </td>

                      {/* Female Average */}
                      <td className="px-4 py-3 text-center">
                        {averages.female.mps ? (
                          <span
                            className="text-xs font-black px-2 py-1 rounded-lg"
                            style={{
                              color: getMPSColor(averages.female.mps),
                              background: getMPSBg(averages.female.mps),
                            }}
                          >
                            {averages.female.mps}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                        {averages.female.sd ?? "—"}
                      </td>

                      {/* Class Average */}
                      <td className="px-4 py-3 text-center">
                        {averages.class.mps ? (
                          <span
                            className="text-xs font-black px-2 py-1 rounded-lg"
                            style={{
                              color: getMPSColor(averages.class.mps),
                              background: getMPSBg(averages.class.mps),
                            }}
                          >
                            {averages.class.mps}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-semibold text-gray-600">
                        {averages.class.sd ?? "—"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="px-5 py-3 border-t border-gray-100 flex flex-wrap gap-4">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                MPS Legend:
              </p>
              {[
                {
                  label: "Outstanding (≥90%)",
                  color: "#10b981",
                  bg: "rgba(16,185,129,0.08)",
                },
                {
                  label: "Satisfactory (75-89%)",
                  color: "#0097b2",
                  bg: "rgba(0,151,178,0.08)",
                },
                {
                  label: "Developing (60-74%)",
                  color: "#f59e0b",
                  bg: "rgba(245,158,11,0.08)",
                },
                {
                  label: "Beginning (<60%)",
                  color: "#ef4444",
                  bg: "rgba(239,68,68,0.08)",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full inline-block"
                    style={{ background: item.color }}
                  />
                  <span className="text-xs text-gray-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Best & Lowest */}
      {(() => {
        const withData = selectedQuarter.data.filter(
          (r) => r.class.mps !== null,
        );
        if (!withData.length) return null;
        const best = withData.reduce((a, b) =>
          Number(a.class.mps) > Number(b.class.mps) ? a : b,
        );
        const lowest = withData.reduce((a, b) =>
          Number(a.class.mps) < Number(b.class.mps) ? a : b,
        );
        const isSame = best.subject_id === lowest.subject_id;

        return (
          <div className="px-5 py-4 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Best */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
              >
                <span className="text-xl shrink-0">🏆</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    Best Subject
                  </p>
                  <p className="text-xs font-black text-[#242424] truncate">
                    {best.subject_name}
                  </p>
                  <p className="text-xs text-gray-400">{best.subject_code}</p>
                </div>
                <p
                  className="text-lg font-black shrink-0"
                  style={{ color: "#10b981" }}
                >
                  {best.class.mps}%
                </p>
              </div>

              {/* Lowest */}
              {!isSame && (
                <div
                  className="flex items-center gap-3 p-3 rounded-xl"
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
                    <p className="text-xs font-black text-[#242424] truncate">
                      {lowest.subject_name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {lowest.subject_code}
                    </p>
                  </div>
                  <p
                    className="text-lg font-black shrink-0"
                    style={{ color: "#f97316" }}
                  >
                    {lowest.class.mps}%
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Empty State */}
      {selectedQuarter &&
        selectedQuarter.data.every((r) => r.class.mps === null) && (
          <div
            className="text-center py-12 text-gray-400"
            style={{
              border: "2px dashed rgba(0,151,178,0.2)",
              borderRadius: "1rem",
            }}
          >
            <TrendingUp size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              No scores encoded for {selectedQuarter.period_name} yet.
            </p>
            <p className="text-xs mt-1">Go to MPS Encoding to add scores.</p>
          </div>
        )}
    </div>
  );
};

export default MPSReport;
