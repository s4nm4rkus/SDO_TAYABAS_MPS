import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  School,
  CalendarDays,
  Clock,
  TrendingUp,
  Building2,
  CheckCircle,
  GraduationCap,
  UserCheck,
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

const getMPSLabel = (mps) => {
  if (!mps) return "No data";
  const val = Number(mps);
  if (val >= 90) return "Outstanding";
  if (val >= 75) return "Satisfactory";
  if (val >= 60) return "Developing";
  return "Beginning";
};

const AdminDashboard = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());

  const getUser = () => {
    try {
      return JSON.parse(atob(token.split(".")[1]));
    } catch {
      return null;
    }
  };
  const user = getUser();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${BASE}/overview`, { headers });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getGreeting = () => {
    const h = now.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
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

  const {
    active_year,
    active_quarter,
    quarters,
    stats,
    cluster_mps,
    school_mps,
    clusters,
  } = data || {};

  // Best/Lowest cluster
  const clusterWithMPS = cluster_mps?.filter((c) => c.class_mps) || [];
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

  // Best/Lowest school
  const schoolWithMPS = school_mps?.filter((s) => s.class_mps) || [];
  const bestSchool = schoolWithMPS.length
    ? schoolWithMPS.reduce((a, b) =>
        Number(a.class_mps) > Number(b.class_mps) ? a : b,
      )
    : null;
  const lowestSchool = schoolWithMPS.length
    ? schoolWithMPS.reduce((a, b) =>
        Number(a.class_mps) < Number(b.class_mps) ? a : b,
      )
    : null;

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
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-10 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute left-1/2 -bottom-6 w-20 h-20 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-white/70 text-sm">{getGreeting()},</p>
          <h1 className="text-2xl font-black text-white mt-0.5">
            {user?.fullname || "Administrator"}! 👋
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <Building2 size={12} className="text-white" />
              <span className="text-xs text-white font-semibold">
                DepEd Tayabas City Division
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
              <Building2 size={12} className="text-white" />
              <span className="text-xs text-white font-semibold">
                {stats?.total_clusters || 0} Clusters ·{" "}
                {stats?.total_schools || 0} Schools
              </span>
            </div>
            {active_quarter && (
              <div className="flex items-center gap-1.5 bg-green-400/30 rounded-full px-3 py-1 border border-green-400/40">
                <span className="text-xs text-green-200 font-semibold">
                  Active: {active_quarter.period_name}
                </span>
              </div>
            )}
            {active_year && (
              <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1">
                <CalendarDays size={12} className="text-white" />
                <span className="text-xs text-white font-semibold">
                  SY {active_year.year_label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
        {[
          {
            label: "Clusters",
            value: stats?.total_clusters,
            icon: <Building2 size={18} className="text-white" />,
            bg: "linear-gradient(135deg, #0097b2, #004385)",
            shadow: "rgba(0,151,178,0.35)",
          },
          {
            label: "Schools",
            value: stats?.total_schools,
            icon: <School size={18} className="text-white" />,
            bg: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
            shadow: "rgba(139,92,246,0.35)",
          },
          {
            label: "Sections",
            value: stats?.total_sections,
            icon: <BookOpen size={18} className="text-white" />,
            bg: "linear-gradient(135deg, #10b981, #059669)",
            shadow: "rgba(16,185,129,0.35)",
          },
          {
            label: "Teachers",
            value: stats?.total_teachers,
            icon: <Users size={18} className="text-white" />,
            bg: "linear-gradient(135deg, #f97316, #fb923c)",
            shadow: "rgba(249,115,22,0.35)",
          },
          {
            label: "Students",
            value: stats?.total_students,
            icon: <GraduationCap size={18} className="text-white" />,
            bg: "linear-gradient(135deg, #14b8a6, #0d9488)",
            shadow: "rgba(20,184,166,0.35)",
          },
          {
            label: "Male",
            value: stats?.male_students,
            icon: <Users size={18} className="text-white" />,
            bg: "linear-gradient(135deg, #3b82f6, #60a5fa)",
            shadow: "rgba(59,130,246,0.35)",
          },
          {
            label: "Female",
            value: stats?.female_students,
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
                {loading ? "..." : (card.value ?? "—")}
              </p>
              <p className="text-xs text-white/80 uppercase tracking-wider mt-0.5">
                {card.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Best/Lowest Badges ── */}
      {!loading && (bestCluster || bestSchool) && (
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
          {lowestCluster && lowestCluster.id !== bestCluster?.id && (
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
          {lowestSchool && lowestSchool.school_id !== bestSchool?.school_id && (
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

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── MPS per Cluster bar chart ── */}
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
                {active_quarter?.period_name || "No active quarter"} · Class MPS
              </p>
            </div>
            <TrendingUp size={18} style={{ color: "#0097b2" }} />
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-400 animate-pulse text-sm">
              Loading...
            </div>
          ) : !clusterWithMPS.length ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400">
              <TrendingUp size={28} className="mb-2 opacity-30" />
              <p className="text-sm">No MPS data yet.</p>
              <p className="text-xs mt-1">
                Teachers need to encode scores first.
              </p>
            </div>
          ) : (
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
              {/* Bars */}
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
                  {clusterWithMPS.map((cluster) => {
                    const mps = Number(cluster.class_mps);
                    const maleMps = cluster.male_mps
                      ? Number(cluster.male_mps)
                      : null;
                    const femaleMps = cluster.female_mps
                      ? Number(cluster.female_mps)
                      : null;
                    const color = getMPSColor(cluster.class_mps);
                    return (
                      <div
                        key={cluster.id}
                        className="flex-1 flex flex-col items-center gap-1 group relative min-w-0"
                      >
                        {/* Tooltip */}
                        <div
                          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10
                          hidden group-hover:flex flex-col items-center
                          bg-[#242424] text-white text-xs rounded-xl px-3 py-2 shadow-lg
                          whitespace-nowrap pointer-events-none"
                        >
                          <span className="font-black">
                            {cluster.cluster_name}
                          </span>
                          <span className="text-white/70">Class: {mps}%</span>
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
                              height: `${(mps / 100) * 100}%`,
                              flex: maleMps || femaleMps ? "1.4" : "1",
                              maxWidth: maleMps || femaleMps ? "20%" : "60%",
                              background: color,
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
                        <span className="text-xs font-semibold text-gray-500 text-center truncate w-full mt-1">
                          {cluster.cluster_name?.replace("Cluster ", "C")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          {!loading && clusterWithMPS.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-3 mt-3 border-t border-gray-100">
              {[
                { label: "≥90% Outstanding", color: "#10b981" },
                { label: "75-89% Satisfactory", color: "#0097b2" },
                { label: "60-74% Developing", color: "#f59e0b" },
                { label: "<60% Beginning", color: "#ef4444" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: item.color }}
                  />
                  <span className="text-xs text-gray-400">{item.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Column: Quarter Progress + Assignment Status ── */}
        <div className="flex flex-col gap-6">
          {/* Quarter Progress */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "white",
              border: "1px solid rgba(0,151,178,0.1)",
            }}
          >
            <h2 className="text-base font-black text-[#242424] mb-4">
              Quarter Progress
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {loading ? (
                <div className="col-span-2 text-center py-4 text-gray-400 animate-pulse text-sm">
                  Loading...
                </div>
              ) : (
                quarters?.map((q) => {
                  const isActive = !!q.is_active;
                  const activeOrder =
                    quarters.find((p) => !!p.is_active)?.order_num || 1;
                  const isPast = !isActive && q.order_num < activeOrder;
                  const isUpcoming = !isActive && q.order_num > activeOrder;
                  return (
                    <div
                      key={q.id}
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
                          {q.period_name}
                        </span>
                        {isActive && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{
                              background: "rgba(0,151,178,0.1)",
                              color: "#0097b2",
                            }}
                          >
                            Active
                          </span>
                        )}
                        {isPast && (
                          <CheckCircle size={14} style={{ color: "#10b981" }} />
                        )}
                        {isUpcoming && (
                          <span className="text-xs text-gray-300">🔒</span>
                        )}
                      </div>
                      <p
                        className="text-xs"
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
                          : isPast
                            ? "Completed"
                            : "In progress"}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Assignment Status */}
          <div
            className="rounded-2xl p-5"
            style={{
              background: "white",
              border: "1px solid rgba(0,151,178,0.1)",
            }}
          >
            <h2 className="text-base font-black text-[#242424] mb-4">
              Assignment Status
            </h2>
            {loading ? (
              <div className="text-center py-4 text-gray-400 animate-pulse text-sm">
                Loading...
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Sections */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <BookOpen size={13} style={{ color: "#0097b2" }} />
                      <span className="text-xs font-semibold text-[#242424]">
                        Sections with Adviser
                      </span>
                    </div>
                    <span
                      className="text-xs font-black"
                      style={{ color: "#0097b2" }}
                    >
                      {stats?.assigned_sections}/{stats?.total_sections}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width:
                          stats?.total_sections > 0
                            ? `${(stats.assigned_sections / stats.total_sections) * 100}%`
                            : "0%",
                        background: "linear-gradient(135deg, #0097b2, #004385)",
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {stats?.total_sections - stats?.assigned_sections || 0}{" "}
                    sections without adviser
                  </p>
                </div>

                {/* Clusters with supervisor */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Building2 size={13} style={{ color: "#8b5cf6" }} />
                      <span className="text-xs font-semibold text-[#242424]">
                        Clusters with Supervisor
                      </span>
                    </div>
                    <span
                      className="text-xs font-black"
                      style={{ color: "#8b5cf6" }}
                    >
                      {clusters?.filter((c) => c.supervisor_name).length || 0}/
                      {stats?.total_clusters || 0}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width:
                          stats?.total_clusters > 0
                            ? `${((clusters?.filter((c) => c.supervisor_name).length || 0) / stats.total_clusters) * 100}%`
                            : "0%",
                        background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {(stats?.total_clusters || 0) -
                      (clusters?.filter((c) => c.supervisor_name).length ||
                        0)}{" "}
                    clusters without supervisor
                  </p>
                </div>

                {/* Quick stats row */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
                  {[
                    {
                      label: "Male",
                      value: stats?.male_students,
                      icon: <Users size={13} />,
                      color: "#3b82f6",
                    },
                    {
                      label: "Female",
                      value: stats?.female_students,
                      icon: <Users size={13} />,
                      color: "#ec4899",
                    },
                    {
                      label: "Total",
                      value: stats?.total_students,
                      icon: <GraduationCap size={13} />,
                      color: "#10b981",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="text-center p-2.5 rounded-xl"
                      style={{
                        background: "rgba(0,0,0,0.02)",
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        className="flex justify-center mb-1"
                        style={{ color: item.color }}
                      >
                        {item.icon}
                      </div>
                      <p className="text-base font-black text-[#242424]">
                        {item.value ?? "—"}
                      </p>
                      <p className="text-xs text-gray-400">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
