"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Icon } from "@iconify/react";
import { signOut } from "@src/actions";
// import { useUser } from "@hooks/use-user";
import useDirection from "@hooks/useDirection";

interface MenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  hasSubmenu?: boolean;
  submenu?: MenuItem[];
  href?: string;
}

interface SidebarProps {
  className?: string;
  menuItems: MenuItem[];
}

const DashboardSidebar: React.FC<SidebarProps> = ({
  className = "",
  menuItems,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  // const {  isLoading: checkSession } = useUser();
    const [direction] = useDirection();

  // detect active item
  const findActive = () => {
    for (const item of menuItems) {
      if (item.href === pathname) return { activeId: item.id, parentId: null };
      if (item.hasSubmenu) {
        const sub = item.submenu?.find((s) => s.href === pathname);
        if (sub) return { activeId: sub.id, parentId: item.id };
      }
    }
    return { activeId: "", parentId: null };
  };

  const { activeId, parentId } = findActive();

  const [isExpanded, setIsExpanded] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(
    parentId ? [parentId] : []
  );
  const [activeItem, setActiveItem] = useState<string>(activeId);

  // Automatically expand on md screens
  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)"); // Tailwind md breakpoint
    const handleResize = () => {
      if (media.matches) {
        setIsExpanded(true); // always expanded on md+
      } else {
        setIsExpanded(false); // collapse on mobile
      }
    };
    handleResize();
    media.addEventListener("change", handleResize);
    return () => media.removeEventListener("change", handleResize);
  }, []);
  // update when pathname changes
  useEffect(() => {
    const { activeId, parentId } = findActive();
    setActiveItem(activeId);
    setOpenSections(parentId ? [parentId] : []);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsExpanded((prev) => !prev);
    if (isExpanded) {
      setOpenSections([]);
    } else {
      if (parentId) {
        setOpenSections([parentId]);
      }
    }
  };

  const toggleSection = (id: string) => {
    if (!isExpanded) return;
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onItemClick = async (item: MenuItem) => {
    if (item.id === "logout") {
      // 🔹 call your logout function
      await signOut();
      // await checkSession?.();
      router.push("/login"); // redirect to login page
      return;
    }
    if (item.hasSubmenu) {
      if (!isExpanded) {
        setIsExpanded(true);
        setOpenSections([item.id]);
      } else {
        toggleSection(item.id);
      }
    } else {
      setActiveItem(item.id);
      router.push(item.href || "/");
    }
  };

  return (
    <motion.div
      // animate={{
      //   width: isExpanded ? "280px" : "56px",
      // }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`absolute md:w-70 w-14 ${direction === "rtl" ? "right-0" : "left-0"} top-18 md:top-0 z-10 bg-white md:relative ${
        isExpanded ? "w-70" : "w-14"
      } dark:bg-gray-900 dark:text-gray-50 md:rounded-lg   h-auto ${className}`}
    >
      {/* Header only for mobile (<md) */}
      <div className="flex gap-2 items-center p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
        <motion.button
          onClick={toggleSidebar}
          className="rounded-lg  text-gray-900 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon
            icon={isExpanded ? "mdi:close" : "mdi:menu"}
            className="text-gray-600 dark:text-gray-400"
            width={24}
            height={24}
          />
        </motion.button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              // exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: 0.2 }}
              className="font-semibold text-gray-800 dark:text-gray-200"
            >
              {/* Dashboard */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LayoutGroup>
        <nav className="space-y-2 py-4">
          {menuItems.map((item) => {
            const isOpen = openSections.includes(item.id);
            const isActive = activeItem === item.id;

            return (
              <div key={item.id}>
                <motion.button
                  onClick={() => onItemClick(item)}
                  className={`flex cursor-pointer justify-between w-full font-bold text-sm px-4 py-3 ${
                    isActive
                      ? "bg-blue-50 dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-l-2 border-blue-600 dark:border-blue-400"
                      : "text-[#000000] dark:text-gray-50 hover:text-blue-600 dark:hover:text-blue-400"
                  }`}
                  animate={isActive ? "active" : "inactive"}
                  // whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  title={!isExpanded ? item.label : undefined}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2, delay: 0.1 }}
                          className="whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>

                  {item.hasSubmenu && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Icon
                        icon="mdi:chevron-up"
                        className={`w-4 h-4 transform transition-transform ${
                          isOpen ? "rotate-180" : "rotate-0"
                        }`}
                      />
                    </motion.div>
                  )}
                </motion.button>

                <AnimatePresence initial={false}>
                  {item.hasSubmenu && isOpen && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      {item.submenu?.map((sub) => (
                        <motion.button
                          key={sub.id}
                          onClick={() => onItemClick(sub)}
                          className={`flex items-center cursor-pointer gap-3 w-full py-2 px-5 text-sm text-left
  ${
    sub.id === "logout"
      ? "text-red-600 dark:text-red-400 dark:hover:text-red-300"
      : activeItem === sub.id
      ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-gray-800 border-l-2 border-blue-600 dark:border-blue-400"
      : "text-gray-700 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
  }`}
                          animate={
                            activeItem === sub.id ? "active" : "inactive"
                          }
                          // whileHover={{ x: 2 }}
                        >
                          {sub.icon}
                          <span>{sub.label}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </LayoutGroup>
    </motion.div>
  );
};

export default DashboardSidebar;
