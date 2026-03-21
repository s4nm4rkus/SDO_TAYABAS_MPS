import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import { HiMenuAlt3 } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { RiSettings4Line } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineUser, AiOutlineTeam } from "react-icons/ai";
import { FiFolder, FiLogOut } from "react-icons/fi";

const SideNav = () => {
  const [open, setOpen] = useState(true);
  const [tooltip, setTooltip] = useState({ visible: false, name: "", y: 0 });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const allMenus = {
    admin: [
      { name: "Dashboard", link: "/admin", icon: MdOutlineDashboard },
      { name: "Academic Setup", link: "/admin/acad", icon: AiOutlineUser },
      {
        name: "School Management",
        link: "/admin/school",
        icon: TbReportAnalytics,
      },
      { name: "User Management", link: "/admin/users", icon: RiSettings4Line },
      {
        name: "Monitoring & Reports",
        link: "/admin/reports",
        icon: TbReportAnalytics,
      },
    ],
    school_head: [
      { name: "Dashboard", link: "/school-head", icon: MdOutlineDashboard },
      { name: "Sections", link: "/school-head/sections", icon: FiFolder },
      { name: "Teachers", link: "/school-head/teachers", icon: AiOutlineTeam },
      {
        name: "MPS Report",
        link: "/school-head/mps-report",
        icon: TbReportAnalytics,
      },
    ],
    teacher: [
      { name: "Dashboard", link: "/teacher", icon: MdOutlineDashboard },
      { name: "My Section", link: "/teacher/section", icon: FiFolder },
      { name: "MPS Encoding", link: "/teacher/mps", icon: TbReportAnalytics },
      { name: "MPS Report", link: "/teacher/report", icon: TbReportAnalytics },
    ],
  };

  const menus = user?.role ? allMenus[user.role] : [];
  const isActive = (link) => location.pathname === link;

  // Get user initials
  const getInitials = () => {
    if (!user?.fullname) return "?";
    const parts = user.fullname.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const getRoleLabel = () => {
    const labels = {
      admin: "Administrator",
      school_head: "School Head",
      teacher: "Teacher",
      supervisor: "Supervisor",
    };
    return labels[user?.role] || user?.role;
  };

  return (
    <section className="flex">
      <div
        className={`sticky top-0 h-screen flex flex-col ${open ? "w-72" : "w-20"} duration-300`}
        style={{
          background: "#0a0a0a",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* ── Top: Toggle + Logo ── */}
        <div
          className="flex items-center justify-between px-4 py-4 shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {open && (
            <div className="flex items-center gap-2.5">
              {/* Colorful Bar Chart Logo */}
              <div className="flex items-end gap-0.5 h-7">
                <div
                  className="w-1.5 rounded-t-sm"
                  style={{ height: "40%", background: "#ef4444" }}
                />
                <div
                  className="w-1.5 rounded-t-sm"
                  style={{ height: "60%", background: "#f59e0b" }}
                />
                <div
                  className="w-1.5 rounded-t-sm"
                  style={{ height: "90%", background: "#10b981" }}
                />
                <div
                  className="w-1.5 rounded-t-sm"
                  style={{ height: "70%", background: "#0097b2" }}
                />
                <div
                  className="w-1.5 rounded-t-sm"
                  style={{ height: "50%", background: "#8b5cf6" }}
                />
              </div>
              <div>
                <p className="text-sm mt-2 font-black text-white leading-none tracking-wide">
                  MPS Tracker
                </p>
                <p className="text-xs" style={{ color: "rgba(0,151,178,0.8)" }}>
                  SDO Tayabas City
                </p>
              </div>
            </div>
          )}

          {/* Collapsed — just the bars */}
          {!open && (
            <div className="flex items-end gap-0.5 h-6 mx-auto">
              <div
                className="w-1 rounded-t-sm"
                style={{ height: "40%", background: "#ef4444" }}
              />
              <div
                className="w-1 rounded-t-sm"
                style={{ height: "60%", background: "#f59e0b" }}
              />
              <div
                className="w-1 rounded-t-sm"
                style={{ height: "90%", background: "#10b981" }}
              />
              <div
                className="w-1 rounded-t-sm"
                style={{ height: "70%", background: "#0097b2" }}
              />
              <div
                className="w-1 rounded-t-sm"
                style={{ height: "50%", background: "#8b5cf6" }}
              />
            </div>
          )}

          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded-lg transition hover:bg-white/10 text-gray-400 hover:text-white ml-auto shrink-0"
          >
            <HiMenuAlt3 size={22} />
          </button>
        </div>

        {/* ── User Info ── */}
        <div
          className={`px-3 py-3 shrink-0 ${open ? "" : "flex justify-center"}`}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          {open ? (
            <div
              className="flex items-center gap-3 px-2 py-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                {getInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-none truncate">
                  {user?.fullname || "User"}
                </p>
                <p
                  className="text-xs mt-0.5 truncate"
                  style={{ color: "#0097b2" }}
                >
                  {getRoleLabel()}
                </p>
              </div>
            </div>
          ) : (
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black"
              style={{
                background: "linear-gradient(135deg, #0097b2, #004385)",
              }}
            >
              {getInitials()}
            </div>
          )}
        </div>

        {/* ── Menu Items ── */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-1">
          {menus?.map((menu, i) => (
            <div
              key={i}
              className="relative"
              onMouseEnter={(e) => {
                if (!open) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setTooltip({
                    visible: true,
                    name: menu.name,
                    y: rect.top + rect.height / 2,
                  });
                }
              }}
              onMouseLeave={() =>
                setTooltip({ visible: false, name: "", y: 0 })
              }
            >
              <Link
                to={menu.link}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${!open ? "justify-center" : ""}`}
                style={
                  isActive(menu.link)
                    ? {
                        background: "linear-gradient(135deg, #0097b2, #004385)",
                        boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
                      }
                    : { color: "rgba(255,255,255,0.5)" }
                }
              >
                <div
                  className="shrink-0"
                  style={{
                    color: isActive(menu.link)
                      ? "white"
                      : "rgba(255,255,255,0.5)",
                  }}
                >
                  {React.createElement(menu.icon, { size: 20 })}
                </div>
                {open && (
                  <span
                    className={`text-sm font-semibold truncate ${isActive(menu.link) ? "text-white" : "text-gray-400"}`}
                  >
                    {menu.name}
                  </span>
                )}
                {open && isActive(menu.link) && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/60 shrink-0" />
                )}
              </Link>
            </div>
          ))}
        </div>

        {/* ── Logout Button ── */}
        <div
          className="px-3 py-3 shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div
            className="relative"
            onMouseEnter={(e) => {
              if (!open) {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  visible: true,
                  name: "Logout",
                  y: rect.top + rect.height / 2,
                });
              }
            }}
            onMouseLeave={() => setTooltip({ visible: false, name: "", y: 0 })}
          >
            <button
              onClick={() => setShowLogoutModal(true)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${!open ? "justify-center" : ""}`}
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.15)",
              }}
            >
              <FiLogOut
                size={20}
                className="text-red-400 shrink-0 group-hover:text-red-300 transition"
              />
              {open && (
                <span className="text-sm font-semibold text-red-400 group-hover:text-red-300 transition">
                  Logout
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Tooltip ── */}
      {!open && tooltip.visible && (
        <div
          className="fixed z-[9999] text-white text-xs rounded-xl px-3 py-1.5 whitespace-nowrap shadow-lg pointer-events-none"
          style={{
            top: tooltip.y,
            left: 88,
            transform: "translateY(-50%)",
            background: "#1a1a1a",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {tooltip.name}
        </div>
      )}

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6"
            style={{ border: "1px solid rgba(0,0,0,0.08)" }}
          >
            {/* Icon */}
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}
            >
              <FiLogOut size={24} className="text-red-500" />
            </div>

            <h2 className="text-lg font-black text-[#242424] text-center mb-1">
              Confirm Logout
            </h2>
            <p className="text-sm text-gray-400 text-center mb-6">
              Are you sure you want to log out of your account?
            </p>

            {/* User info */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-5"
              style={{
                background: "rgba(0,151,178,0.06)",
                border: "1px solid rgba(0,151,178,0.15)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
                style={{
                  background: "linear-gradient(135deg, #0097b2, #004385)",
                }}
              >
                {getInitials()}
              </div>
              <div>
                <p className="text-sm font-bold text-[#242424] leading-none">
                  {user?.fullname}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#0097b2" }}>
                  {getRoleLabel()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 text-sm rounded-xl text-white font-semibold transition hover:opacity-90"
                style={{
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
                }}
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SideNav;
