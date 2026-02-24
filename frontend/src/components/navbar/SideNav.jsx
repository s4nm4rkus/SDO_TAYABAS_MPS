import React, { useState } from "react";
import { HiMenuAlt3 } from "react-icons/hi";
import { MdOutlineDashboard } from "react-icons/md";
import { RiSettings4Line } from "react-icons/ri";
import { TbReportAnalytics } from "react-icons/tb";
import { AiOutlineUser, AiOutlineHeart } from "react-icons/ai";
import { FiMessageSquare, FiFolder, FiShoppingCart } from "react-icons/fi";
import { Link } from "react-router-dom";

const SideNav = () => {
  const menus = [
    { name: "Dashboard", link: "/", icon: MdOutlineDashboard },
    { name: "User", link: "/", icon: AiOutlineUser },
    { name: "Messages", link: "/", icon: FiMessageSquare },
    { name: "Analytics", link: "/", icon: TbReportAnalytics, margin: true },
    { name: "File Manager", link: "/", icon: FiFolder },
    { name: "Cart", link: "/", icon: FiShoppingCart },
    { name: "Saved", link: "/", icon: AiOutlineHeart, margin: true },
    { name: "Setting", link: "/", icon: RiSettings4Line },
  ];
  const [open, setOpen] = useState(true);
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
              to={menu?.link}
              key={i}
              className={` ${
                menu?.margin && "mt-5"
              } group flex items-center text-[16px]  gap-4 font-medium p-2 hover:bg-gray-800 rounded-md`}
            >
              <div>{React.createElement(menu?.icon, { size: "24" })}</div>
              <h2
                style={{
                  transitionDelay: `300ms`,
                }}
                className={`whitespace-pre duration-500 ${
                  !open && " overflow-hidden"
                }`}
              >
                {menu?.name}
              </h2>
              <h2
                className={`${
                  open && "hidden"
                } absolute left-49 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-16 group-hover:duration-300 group-hover:w-fit  `}
              >
                {menu?.name}
              </h2>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SideNav;

// import React, { useState } from "react";
// import { HiMenuAlt3 } from "react-icons/hi";
// import { MdOutlineDashboard } from "react-icons/md";
// import { RiSettings4Line } from "react-icons/ri";
// import { TbReportAnalytics } from "react-icons/tb";
// import { AiOutlineUser, AiOutlineHeart } from "react-icons/ai";
// import { FiMessageSquare, FiFolder, FiShoppingCart } from "react-icons/fi";
// import { Link } from "react-router-dom";

// // Define menus per role
// const roleMenus = {
//   admin: [
//     { name: "Dashboard", link: "/admin", icon: MdOutlineDashboard },
//     { name: "Users", link: "/admin/users", icon: AiOutlineUser },
//     {
//       name: "Analytics",
//       link: "/admin/analytics",
//       icon: TbReportAnalytics,
//       margin: true,
//     },
//     { name: "Settings", link: "/admin/settings", icon: RiSettings4Line },
//   ],
//   teacher: [
//     { name: "Dashboard", link: "/teacher", icon: MdOutlineDashboard },
//     { name: "My Classes", link: "/teacher/classes", icon: FiFolder },
//     { name: "Messages", link: "/teacher/messages", icon: FiMessageSquare },
//     {
//       name: "Saved",
//       link: "/teacher/saved",
//       icon: AiOutlineHeart,
//       margin: true,
//     },
//   ],
// };

// const SideNav = ({ role }) => {
//   const [open, setOpen] = useState(true);

//   // Pick menus based on role; default to empty array
//   const menus = roleMenus[role] || [];

//   return (
//     <section className="flex gap-6">
//       <div
//         className={`bg-[#0e0e0e] min-h-screen ${open ? "w-72" : "w-20"} duration-500 text-gray-100 px-5`}
//       >
//         <div className="py-3 flex justify-end">
//           <HiMenuAlt3
//             size={32}
//             className="cursor-pointer"
//             onClick={() => setOpen(!open)}
//           />
//         </div>
//         <div className="mt-4 flex flex-col gap-4 relative">
//           {menus?.map((menu, i) => (
//             <Link
//               to={menu.link}
//               key={i}
//               className={`${menu?.margin && "mt-5"} group flex items-center text-[16px] gap-4 font-medium p-2 hover:bg-gray-800 rounded-md`}
//             >
//               <div>{React.createElement(menu.icon, { size: "24" })}</div>
//               <h2
//                 style={{ transitionDelay: `300ms` }}
//                 className={`whitespace-pre duration-500 ${!open && "overflow-hidden"}`}
//               >
//                 {menu.name}
//               </h2>
//               <h2
//                 className={`${open && "hidden"} absolute left-49 bg-white font-semibold whitespace-pre text-gray-900 rounded-md drop-shadow-lg px-0 py-0 w-0 overflow-hidden group-hover:px-2 group-hover:py-1 group-hover:left-16 group-hover:duration-300 group-hover:w-fit`}
//               >
//                 {menu.name}
//               </h2>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default SideNav;
