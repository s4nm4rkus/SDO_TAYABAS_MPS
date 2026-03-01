// src/components/navbar/SideNav.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; // your hook

import { HiMenuAlt3 } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { RiSettings4Line } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineUser, AiOutlineHeart } from "react-icons/ai";
import { FiMessageSquare, FiFolder, FiShoppingCart } from "react-icons/fi";

const SideNav = () => {
  const [open, setOpen] = useState(true);
  const { user } = useAuth(); // get current logged-in user

  // Role-specific menus
  const allMenus = {
    admin: [
      { name: "Dashboard", link: "/admin", icon: MdOutlineDashboard },
      { name: "Academic Setup", link: "/admin/acad", icon: AiOutlineUser },
      {
        name: "School Management",
        link: "/admin/school",
        icon: TbReportAnalytics,
      },
      {
        name: "User Management",
        link: "/admin/users",
        icon: RiSettings4Line,
      },
      {
        name: "Monitoring & Reports",
        link: "/admin/reports",
        icon: RiSettings4Line,
      },
      { name: "Logout", link: "/logout", icon: MdOutlineDashboard },
    ],
    teacher: [
      { name: "Dashboard", link: "/teacher", icon: MdOutlineDashboard },
      { name: "Messages", link: "/teacher/messages", icon: FiMessageSquare },
      { name: "Assignments", link: "/teacher/assignments", icon: FiFolder },
      { name: "Saved", link: "/teacher/saved", icon: AiOutlineHeart },
      { name: "Logout", link: "/logout", icon: MdOutlineDashboard },
    ],
  };

  // Select menus based on role
  const menus = user?.role ? allMenus[user.role] : [];

  return (
    <section className="flex gap-6">
      <div
        className={`bg-[#0e0e0e] min-h-screen ${
          open ? "w-72" : "w-20"
        } duration-500 text-gray-100 px-5`}
      >
        <div className="py-3 flex justify-end">
          <HiMenuAlt3
            size={32}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <div className="mt-4 flex flex-col gap-4 relative">
          {menus?.map((menu, i) => (
            <Link
              to={menu.link}
              key={i}
              className="group flex items-center text-[16px] gap-4 font-medium p-2 hover:bg-gray-800 rounded-md"
            >
              <div>{React.createElement(menu.icon, { size: "24" })}</div>
              <h2
                className={`whitespace-pre duration-500 ${
                  !open && "overflow-hidden"
                }`}
              >
                {menu.name}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SideNav;
