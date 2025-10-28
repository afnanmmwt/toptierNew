// "use client";
// import { Icon } from "@iconify/react";
// import React, {
//   createContext,
//   useContext,
//   useState,
//   ReactNode,
//   useEffect,
// } from "react";
// // import Logo from "@components/core/logo";
// import { useRouter } from "next/navigation";
// import { motion, AnimatePresence } from "framer-motion";
// import { useAppSelector, useAppDispatch } from "@lib/redux/store";
// import { setSidebarExpanded } from "@lib/redux/base";
// // import { set } from "lodash";
// import useDictionary from "@hooks/useDict";
// import useLocale from "@hooks/useLocale";
// import useDirection from "@hooks/useDirection"

// // Define the type for the context
// // interface SidebarContextType {
// //   expanded: boolean;
// // }

// // Create a properly typed context
// // export const SidebarContext = createContext<SidebarContextType | undefined>(
// //   undefined
// // );

// // Define props for the Sidebar
// interface SidebarProps {
//   children: ReactNode;
// }

// // Sidebar Component
// export default function Sidebar({ children }: SidebarProps) {
//   const dispatch = useAppDispatch();
//   // Read initial value from localStorage, fallback to true
//   const getInitialExpanded = () => {
//     if (typeof window !== "undefined") {
//       const val = localStorage.getItem("sidebarExpanded");
//       if (val === "false") return false;
//       if (val === "true") return true;
//     }
//     return true;
//   };
//   const [direction] = useDirection();
//   const [expanded, setExpanded] = useState(getInitialExpanded());
//   const expanded_side = useAppSelector(state => state.root.sidebarExpanded);
//   // Sync Redux and local state on mount
//   useEffect(() => {
//     dispatch(setSidebarExpanded(expanded));
//   }, []);

//   // Sync localStorage when either state changes
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("sidebarExpanded", String(expanded));
//     }
//   }, [expanded]);
//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       localStorage.setItem("sidebarExpanded", String(expanded_side));
//     }
//     setExpanded(expanded_side ?? true);
//   }, [expanded_side]);
//   return (
//     <aside
//       className="relative flex max-h-screen  "
//       //  style={{ height: '1000px' }}
//       onMouseEnter={() => setExpanded(true)}
//       onMouseLeave={() => {
//         if (!expanded_side) setExpanded(false);
//       }}
//     >
//       <nav className={`relative  h-full z-10  flex-1 overflow-y-auto overflow-x-hidden flex flex-col  bg-white dark:bg-gray-800  ${direction === "rtl" ? "border-l border-gray-300 dark:border-gray-600" : "border-r border-gray-300 dark:border-gray-600"}  `}

//       >
//         {/* Top Logo and Toggle Button */}
//         <div className={`${expanded ? "px-3 py-3" : "py-3 px-3"} flex justify-between items-center`}>
//           {/* Dashboard Icon & Text */}
//           <div className="px-4 flex items-center gap-2">
//             <Icon
//               icon="material-symbols:dashboard-outline-rounded"
//               width="24"
//               height="24" className="text-gray-900 dark:text-gray-200"
//             />

//             {expanded && (
//               <span
//                 className={`font-bold text-gray-700 dark:text-gray-200 transition-all duration-300 ${
//                   expanded ? "opacity-100" : "opacity-0"
//                 }`}
//               >
//                 Dashboard
//               </span>
//             )}
//           </div>

//           {/* Toggle Button - Only shows when expanded */}
//           {expanded && (
//             <button
//               onClick={() => {
//                 dispatch(setSidebarExpanded(!expanded_side));
//                 setExpanded(!expanded_side);
//               }}
//               className="p-2 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
//             >

//                    <Icon icon="lucide:arrow-left-to-line" width="20" height="20" className={`text-gray-900 dark:text-gray-200  ${expanded_side ? "" :"-scale-x-100"} `} />
//             </button>
//           )}

//           {/* Toggle Button Icon for collapsed state */}
//           {/* {!expanded && (
//     <button
//       onClick={() => setExpanded((curr) => !curr)}
//       className="p-1.5 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-900 transition-all"
//     >
//       <Icon icon="material-symbols:last-page-rounded" width="24" height="24" />
//     </button>
//   )} */}
//         </div>

//         {/* Sidebar Items */}
//         {/* <SidebarContext.Provider value={{ expanded }}>
//           <ul className={`flex-1  justify-content-center ${expanded ? "px-3" : "px-3"}`}>{children}</ul>
//         </SidebarContext.Provider> */}
//       </nav>
//     </aside>
//   );
// }

// // Define props for SidebarItem
// interface SidebarItemProps {
//   icon: React.ReactNode | string;
//   text: string;
//   active?: boolean;
//   alert?: boolean;
//   href: string;
// }

// // Sidebar Item Component
// export function SidebarItem({
//   icon,
//   text,
//   active = false,
//   alert = false,
//   href,
// }: SidebarItemProps) {
//    const { locale } = useLocale();
//     // const { data: dict, isLoading } = useDictionary(locale as any);
//     // const [direction] = useDirection();
//     // const app = useAppSelector((state) => state?.appData?.data?.app);

//   // const context = useContext(SidebarContext);
//   const router = useRouter();
//   if (!context) {
//     throw new Error("SidebarItem must be used within a Sidebar");
//   }

//   const { expanded } = context;
//   return (
//     <li
//       onClick={() => router.push(href)}
//       className={`relative w-full flex items-center py-2 px-4  my-1 font-medium rounded-md cursor-pointer transition-colors group ${
//         active
//           ? "bg-gradient-to-tr from-indigo-200 dark:from-gray-800 to-indigo-100 dark:to-gray-600 text-primary dark:text-gray-300"
//           : "hover:bg-indigo-50 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300"
//       }`}
//     >
//       <>
//         {typeof icon === "string" ? (
//           <Icon icon={`mdi:${icon}`} width={22} />
//         ) : (
//           <span className={`flex items-center justify-center  ${
//             expanded ? "pe-3 " : "pe-0 "
//           } `}>{icon}</span>
//         )}
//         <span
//           className={`overflow-hidden transition-all  ${
//             expanded ? "w-full " : "w-0 "
//           }`}
//         >
//           {text}
//         </span>
//         {alert && (
//           <div
//             className={`absolute right-2 w-2 h-2 rounded bg-indigo-400 ${
//               expanded ? "" : "top-2"
//             }`}
//           />
//         )}

//         {!expanded && (
//           <div
//             className={`absolute left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 dark:bg-gray-700 text-primary dark:text-white text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
//           >
//             {text}
//           </div>
//         )}
//       </>
//     </li>
//   );
// }

// // ==================Sidebar Collapse Component for nested items of tabs ======================
// interface SidebarCollapseProps {
//   icon?: React.ReactNode | string;
//   text: string;
//   children: React.ReactNode;
//   list: any[];
// }

// export function SidebarCollapse({
//   icon,
//   text,
//   list,
//   children,
// }: SidebarCollapseProps) {
//    const { locale } = useLocale();
//   const { data: dict, isLoading } = useDictionary(locale as any);
//   const [direction] = useDirection();
//   const app = useAppSelector((state) => state?.appData?.data?.app);

//   const context = useContext(SidebarContext);
//   const router = useRouter();
//   const { expanded } = context || { expanded: true };
//   const [open, setOpen] = useState(false);
//   if (!context) {
//     throw new Error("SidebarCollapse must be used within a Sidebar");
//   }
//   useEffect(() => {
//     if (!expanded) {
//       setOpen(false);
//     }

//   }, [expanded]);
//   return (
//     <li className="my-1 relative group">
//       <button
//         type="button"
//         onClick={() => expanded && setOpen((v) => !v)}
//         className={`w-full flex items-center ${
//           expanded ? "justify-between" : "justify-center"
//         } px-4 py-2 font-medium text-gray-700 dark:text-gray-200 rounded-md transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 focus:outline-none`}
//       >
//         <span className={`flex items-center  ${expanded ? "gap-3" : "gap-0"}`}>
//           {icon &&
//             (typeof icon === "string" ? (
//               <Icon icon={`mdi:${icon}`} width={20} />
//             ) : (
//               <span className={`flex items-center justify-center ${expanded ? "pe-0" : "pe-0"}`}>{icon}</span>
//             ))}
//           <span
//             className={`overflow-hidden ${direction === "rtl" ? "text-right" : "text-left"} transition-all ${
//               expanded ? "w-35 " : "w-0"
//             }`}
//           >
//             {text}
//           </span>
//         </span>
//         {expanded && (
//           <Icon
//             icon={open ? "mdi:chevron-up" : "mdi:chevron-down"}
//             width={20}
//           />
//         )}
//       </button>
//       {!expanded && (
//         <div
//           className={`absolute top-1 left-full rounded-md px-2 py-1 ml-6 bg-indigo-100 dark:bg-gray-700 text-primary dark:text-white text-sm invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0`}
//         >
//           {list.map((item, idx) => (
//             <span
//               key={item.key || item.text || idx}
//               className="block py-0.5 cursor-pointer"
//               onClick={() => router.push(item.href)}
//             >
//               {item.text}
//             </span>
//           ))}
//         </div>
//       )}
//       <AnimatePresence initial={false}>
//         {open && (
//           <motion.ul
//             initial={{ height: 0, opacity: 0 }}
//             animate={{ height: "auto", opacity: 1 }}
//             exit={{ height: 0, opacity: 0 }}
//             transition={{ duration: 0.2, ease: "easeInOut" }}
//             className="overflow-hidden pl-6 w-full"
//           >
//             {children}
//           </motion.ul>
//         )}
//       </AnimatePresence>
//     </li>
//   );

// }
