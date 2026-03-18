// const SectionFilterTabs = ({
//   gradeLevels,
//   activeFilter,
//   setActiveFilter,
//   sections,
// }) => {
//   return (
//     <div className="flex flex-wrap gap-2">
//       {/* All Tab */}
//       <button
//         onClick={() => setActiveFilter("all")}
//         className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
//         style={
//           activeFilter === "all"
//             ? {
//                 background: "linear-gradient(135deg, #0097b2, #004385)",
//                 color: "white",
//                 boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
//               }
//             : {
//                 background: "white",
//                 color: "#242424",
//                 border: "1px solid rgba(0,151,178,0.2)",
//               }
//         }
//       >
//         All
//         <span
//           className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
//           style={
//             activeFilter === "all"
//               ? { background: "rgba(255,255,255,0.25)", color: "white" }
//               : { background: "rgba(0,151,178,0.1)", color: "#0097b2" }
//           }
//         >
//           {sections.length}
//         </span>
//       </button>

//       {/* Grade Level Tabs */}
//       {gradeLevels.map((gl) => {
//         const count = sections.filter(
//           (s) => s.grade_name === gl.grade_name,
//         ).length;
//         if (count === 0) return null; // hide grade levels with no sections
//         const isActive = activeFilter === gl.id;

//         return (
//           <button
//             key={gl.id}
//             onClick={() => setActiveFilter(gl.id)}
//             className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
//             style={
//               isActive
//                 ? {
//                     background: "linear-gradient(135deg, #0097b2, #004385)",
//                     color: "white",
//                     boxShadow: "0 4px 12px rgba(0,151,178,0.3)",
//                   }
//                 : {
//                     background: "white",
//                     color: "#242424",
//                     border: "1px solid rgba(0,151,178,0.2)",
//                   }
//             }
//           >
//             {gl.grade_name}
//             <span
//               className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
//               style={
//                 isActive
//                   ? { background: "rgba(255,255,255,0.25)", color: "white" }
//                   : { background: "rgba(0,151,178,0.1)", color: "#0097b2" }
//               }
//             >
//               {count}
//             </span>
//           </button>
//         );
//       })}
//     </div>
//   );
// };

// export default SectionFilterTabs;
