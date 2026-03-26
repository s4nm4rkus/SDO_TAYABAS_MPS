import { useState, useEffect } from "react";
import {
  BookOpen,
  ClipboardList,
  ChevronRight,
  Save,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import axios from "axios";

const BASE = `${import.meta.env.VITE_API_URL}/api/assessments`;

const MPSEncoding = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [section, setSection] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Step state
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [totalItems, setTotalItems] = useState("");

  // Assessment + scores
  const [assessment, setAssessment] = useState(null);
  const [students, setStudents] = useState([]);
  const [scores, setScores] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sectionRes, subjectsRes, periodsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/students/my-section`, {
            headers,
          }),
          axios.get(`${BASE}/subjects`, { headers }),
          axios.get(`${BASE}/grading-periods`, { headers }),
        ]);
        setSection(sectionRes.data);
        setSubjects(subjectsRes.data);
        setPeriods(periodsRes.data);

        // Auto-select active period
        const active = periodsRes.data.find((p) => p.is_active);
        if (active) setSelectedPeriod(active);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load assessment when subject + period + total_items are set
  const handleLoadAssessment = async () => {
    if (!selectedSubject || !selectedPeriod || !totalItems)
      return setError("Please select subject, quarter and enter total items.");
    if (Number(totalItems) < 1)
      return setError("Total items must be at least 1.");

    setError("");
    try {
      const res = await axios.post(
        `${BASE}/start`,
        {
          subject_id: selectedSubject.id,
          grading_period_id: selectedPeriod.id,
          total_items: Number(totalItems),
        },
        { headers },
      );

      setAssessment(res.data.assessment);
      setStudents(res.data.students);

      // Initialize scores from existing data
      const initialScores = {};
      res.data.students.forEach((s) => {
        initialScores[s.id] = s.score !== null ? String(s.score) : "";
      });
      setScores(initialScores);
      setSaved(false);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleScoreChange = (studentId, value) => {
    // Only allow numbers and decimal
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) return;
    // Don't allow score > total_items
    if (value !== "" && Number(value) > Number(assessment?.total_items)) return;
    setScores({ ...scores, [studentId]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    const scoresToSave = students
      .filter((s) => scores[s.id] !== "" && scores[s.id] !== undefined)
      .map((s) => ({
        student_id: s.id,
        score: Number(scores[s.id]),
      }));

    if (!scoresToSave.length)
      return setError("Please enter at least one score.");

    setSaving(true);
    setError("");
    try {
      await axios.post(
        `${BASE}/scores`,
        {
          assessment_id: assessment.id,
          scores: scoresToSave,
        },
        { headers },
      );
      setSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSelectedSubject(null);
    setTotalItems("");
    setAssessment(null);
    setStudents([]);
    setScores({});
    setSaved(false);
    setError("");
  };

  // Compute live MPS preview
  const computePreview = () => {
    if (!students.length || !assessment) return null;

    const withScores = students.filter(
      (s) => scores[s.id] !== "" && scores[s.id] !== undefined,
    );
    if (!withScores.length) return null;

    const maleStudents = withScores.filter((s) => s.gender === "Male");
    const femaleStudents = withScores.filter((s) => s.gender === "Female");

    const computeMPS = (arr) => {
      if (!arr.length) return null;
      const avg =
        arr.reduce((sum, s) => sum + Number(scores[s.id]), 0) / arr.length;
      return ((avg / assessment.total_items) * 100).toFixed(2);
    };

    const computeSD = (arr) => {
      if (!arr.length) return null;
      const avg =
        arr.reduce((sum, s) => sum + Number(scores[s.id]), 0) / arr.length;
      const variance =
        arr.reduce(
          (sum, s) => sum + Math.pow(Number(scores[s.id]) - avg, 2),
          0,
        ) / arr.length;
      return Math.sqrt(variance).toFixed(2);
    };

    return {
      male: {
        mps: computeMPS(maleStudents),
        sd: computeSD(maleStudents),
        count: maleStudents.length,
      },
      female: {
        mps: computeMPS(femaleStudents),
        sd: computeSD(femaleStudents),
        count: femaleStudents.length,
      },
      class: {
        mps: computeMPS(withScores),
        sd: computeSD(withScores),
        count: withScores.length,
      },
    };
  };

  const preview = computePreview();
  const encodedCount = students.filter(
    (s) => scores[s.id] !== "" && scores[s.id] !== undefined,
  ).length;

  if (loading)
    return (
      <div className="text-center py-20 text-gray-400 animate-pulse text-sm">
        Loading...
      </div>
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#242424]">MPS Encoding</h1>
          <p className="text-sm text-gray-400 mt-1">
            Encode assessment scores for your section
          </p>
        </div>
        {section && (
          <div
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
            style={{
              background: "rgba(0,151,178,0.06)",
              border: "1px solid rgba(0,151,178,0.15)",
            }}
          >
            <BookOpen size={14} style={{ color: "#0097b2" }} />
            <span className="text-sm font-black text-[#242424]">
              {section.section_name}
            </span>
            <span className="text-xs text-gray-400">·</span>
            <span className="text-xs text-gray-500">{section.grade_name}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        className="h-px w-full rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,151,178,0.3), transparent)",
        }}
      />

      {/* Step 1 — Select Quarter + Subject + Total Items */}
      {!assessment ? (
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Step 1 — Select Quarter, Subject and Total Items
          </p>

          {/* Quarter Tabs */}
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wider mb-2 block"
              style={{ color: "#0097b2" }}
            >
              Quarter
            </label>
            <div className="flex flex-wrap gap-2">
              {periods.map((period) => (
                <button
                  key={period.id}
                  onClick={() => setSelectedPeriod(period)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition"
                  style={
                    selectedPeriod?.id === period.id
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
                  {period.is_active ? (
                    <span
                      className="ml-2 text-xs px-1.5 py-0.5 rounded-full"
                      style={
                        selectedPeriod?.id === period.id
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
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Cards */}
          <div>
            <label
              className="text-xs font-semibold uppercase tracking-wider mb-2 block"
              style={{ color: "#0097b2" }}
            >
              Subject
            </label>
            {subjects.length === 0 ? (
              <div
                className="text-center py-8 text-gray-400 text-sm"
                style={{
                  border: "2px dashed rgba(0,151,178,0.2)",
                  borderRadius: "1rem",
                }}
              >
                No subjects found for your grade level.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => setSelectedSubject(subject)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition"
                    style={
                      selectedSubject?.id === subject.id
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
                    <ClipboardList size={14} />
                    {subject.subject_name}
                    <span className="text-xs opacity-70">
                      ({subject.subject_code})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Total Items */}
          <div className="max-w-xs">
            <label
              className="text-xs font-semibold uppercase tracking-wider mb-2 block"
              style={{ color: "#0097b2" }}
            >
              Total Items (Max Score)
            </label>
            <input
              type="number"
              placeholder="e.g. 60"
              min="1"
              value={totalItems}
              onChange={(e) => setTotalItems(e.target.value)}
              className="w-full rounded-xl px-4 py-2.5 text-sm text-[#242424]"
              style={{
                background: "white",
                border: "1px solid rgba(0,151,178,0.2)",
              }}
            />
            <p className="text-xs text-gray-400 mt-1">
              The maximum possible score for this assessment.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-600"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Proceed Button */}
          <div>
            <button
              onClick={handleLoadAssessment}
              disabled={!selectedPeriod || !selectedSubject || !totalItems}
              className="flex items-center gap-2 px-6 py-2.5 text-white text-sm rounded-xl transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #0097b2, #004385)",
                boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
              }}
            >
              Proceed to Score Encoding
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      ) : (
        /* Step 2 — Score Encoding */
        <div className="flex flex-col gap-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button
              onClick={handleReset}
              className="hover:text-[#0097b2] transition"
            >
              MPS Encoding
            </button>
            <ChevronRight size={11} />
            <span style={{ color: "#0097b2" }}>
              {selectedPeriod?.period_name}
            </span>
            <ChevronRight size={11} />
            <span style={{ color: "#0097b2" }}>
              {selectedSubject?.subject_name}
            </span>
          </div>

          {/* Assessment Info */}
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Quarter", value: selectedPeriod?.period_name },
              { label: "Subject", value: selectedSubject?.subject_name },
              { label: "Total Items", value: assessment?.total_items },
              { label: "Students", value: students.length },
              {
                label: "Encoded",
                value: `${encodedCount} / ${students.length}`,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="px-4 py-2.5 rounded-xl"
                style={{
                  background: "rgba(0,151,178,0.06)",
                  border: "1px solid rgba(0,151,178,0.12)",
                }}
              >
                <p className="text-xs text-gray-400">{item.label}</p>
                <p className="text-sm font-black text-[#242424]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Score Table */}
          <div
            className="rounded-2xl overflow-hidden"
            style={{
              background: "white",
              border: "1px solid rgba(0,151,178,0.1)",
            }}
          >
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-black text-[#242424]">
                Student Scores
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Enter score out of {assessment?.total_items} for each student
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead style={{ background: "rgba(248,248,255,0.8)" }}>
                  <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                      #
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Student
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      LRN
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">
                      Gender
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">
                      Score{" "}
                      <span className="normal-case font-normal text-gray-400">
                        (out of {assessment?.total_items})
                      </span>
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center">
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const score = scores[student.id];
                    const percentage =
                      score !== "" && score !== undefined
                        ? (
                            (Number(score) / assessment.total_items) *
                            100
                          ).toFixed(1)
                        : null;

                    return (
                      <tr
                        key={student.id}
                        className="border-t border-gray-50 hover:bg-gray-50/50 transition"
                      >
                        <td className="px-4 py-2.5 text-gray-400 text-xs">
                          {index + 1}
                        </td>
                        <td className="px-4 py-2.5">
                          <p className="font-semibold text-[#242424] text-sm">
                            {student.lastname}, {student.firstname}
                          </p>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-mono text-gray-500">
                          {student.lrn}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className="text-xs font-semibold px-2 py-0.5 rounded-full"
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
                        <td className="px-4 py-2.5 text-center">
                          <input
                            type="number"
                            min="0"
                            max={assessment?.total_items}
                            step="0.01"
                            placeholder="—"
                            value={score ?? ""}
                            onChange={(e) =>
                              handleScoreChange(student.id, e.target.value)
                            }
                            className="w-20 text-center rounded-xl px-3 py-1.5 text-sm text-[#242424] transition"
                            style={{
                              background:
                                score !== "" && score !== undefined
                                  ? "rgba(0,151,178,0.06)"
                                  : "rgba(248,248,255,0.8)",
                              border: `1px solid ${
                                score !== "" && score !== undefined
                                  ? "rgba(0,151,178,0.3)"
                                  : "rgba(0,151,178,0.15)"
                              }`,
                            }}
                          />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          {percentage ? (
                            <span
                              className="text-xs font-bold"
                              style={{
                                color:
                                  Number(percentage) >= 75
                                    ? "#10b981"
                                    : "#f97316",
                              }}
                            >
                              {percentage}%
                            </span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live MPS Preview */}
          {preview && (
            <div
              className="rounded-2xl p-4"
              style={{
                background: "rgba(0,151,178,0.04)",
                border: "1px solid rgba(0,151,178,0.15)",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Live MPS Preview
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left py-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500"></th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        MPS
                      </th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        SD
                      </th>
                      <th className="text-center py-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Count
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "Male", data: preview.male, color: "#3b82f6" },
                      {
                        label: "Female",
                        data: preview.female,
                        color: "#ec4899",
                      },
                      { label: "Class", data: preview.class, color: "#0097b2" },
                    ].map((row) => (
                      <tr key={row.label} className="border-t border-gray-100">
                        <td
                          className="py-2 px-3 font-semibold text-xs"
                          style={{ color: row.color }}
                        >
                          {row.label}
                        </td>
                        <td className="py-2 px-3 text-center font-black text-sm text-[#242424]">
                          {row.data.mps ? `${row.data.mps}%` : "—"}
                        </td>
                        <td className="py-2 px-3 text-center text-sm text-gray-500">
                          {row.data.sd ?? "—"}
                        </td>
                        <td className="py-2 px-3 text-center text-xs text-gray-400">
                          {row.data.count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-600"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving || encodedCount === 0}
              className="flex items-center gap-2 px-6 py-2.5 text-white text-sm rounded-xl transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "linear-gradient(135deg, #0097b2, #004385)",
                boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
              }}
            >
              <Save size={15} />
              {saving ? "Saving..." : "Save Scores"}
            </button>

            {saved && (
              <div className="flex items-center gap-1.5 text-sm text-green-600">
                <CheckCircle size={15} />
                Scores saved successfully!
              </div>
            )}

            <button
              onClick={handleReset}
              className="px-4 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition ml-auto"
            >
              ← Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MPSEncoding;
