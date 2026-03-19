// src/components/navbar/SideNav.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import { HiMenuAlt3 } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { RiSettings4Line } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineUser, AiOutlineHeart, AiOutlineTeam } from "react-icons/ai";
import { FiMessageSquare, FiFolder } from "react-icons/fi";

const SideNav = () => {
  const [open, setOpen] = useState(true);
  const [tooltip, setTooltip] = useState({ visible: false, name: "", y: 0 });
  const { user } = useAuth();
  const location = useLocation();

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
      { name: "Logout", link: "/logout", icon: MdOutlineDashboard },
    ],
    school_head: [
      { name: "Dashboard", link: "/school-head", icon: MdOutlineDashboard },
      { name: "Sections", link: "/school-head/sections", icon: FiFolder },
      { name: "Teachers", link: "/school-head/teachers", icon: AiOutlineTeam },
      {
        name: "Messages",
        link: "/school-head/messages",
        icon: FiMessageSquare,
      },
      { name: "Logout", link: "/logout", icon: MdOutlineDashboard },
    ],
    teacher: [
      { name: "Dashboard", link: "/teacher", icon: MdOutlineDashboard },
      { name: "My Section", link: "/teacher/section", icon: FiFolder },
      { name: "MPS Encoding", link: "/teacher/mps", icon: TbReportAnalytics },
      { name: "MPS Report", link: "/teacher/report", icon: TbReportAnalytics },
      { name: "Logout", link: "/logout", icon: MdOutlineDashboard },
    ],
  };

  const menus = user?.role ? allMenus[user.role] : [];
  const isActive = (link) => location.pathname === link;

  return (
    <section className="flex">
      <div
        className={`bg-[#0e0e0e] sticky top-0 h-screen ${
          open ? "w-72" : "w-20"
        } duration-500 text-gray-100 px-5`}
      >
        {/* Toggle Button */}
        <div className="py-3 flex justify-end">
          <HiMenuAlt3
            size={32}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>

        {/* Menu Items */}
        <div className="mt-4 flex flex-col gap-2 h-[calc(100vh-80px)] overflow-y-auto">
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
                className={`flex items-center text-[16px] gap-4 font-medium p-2 rounded-md transition-colors duration-200 ${
                  isActive(menu.link)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-800 text-gray-300"
                }`}
              >
                <div className="flex-shrink-0">
                  {React.createElement(menu.icon, { size: "24" })}
                </div>
                <h2
                  className={`whitespace-pre duration-500 ${
                    !open && "opacity-0 overflow-hidden w-0"
                  }`}
                >
                  {menu.name}
                </h2>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Tooltip — rendered outside the nav */}
      {!open && tooltip.visible && (
        <div
          className="fixed z-[9999] bg-gray-800 text-white text-xs rounded-md px-3 py-1.5 whitespace-nowrap shadow-lg pointer-events-none"
          style={{ top: tooltip.y, left: 88, transform: "translateY(-50%)" }}
        >
          {tooltip.name}
        </div>
      )}
    </section>
  );
};

export default SideNav;
