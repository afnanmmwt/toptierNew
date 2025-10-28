"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const Breadcrumb: React.FC = () => {
  const pathname = usePathname();
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    if (!pathname) return;

    // Split pathname and remove empty strings
    const pathSegments = pathname.split("/").filter((seg) => seg !== "");

    // Map segments to breadcrumb items
    const items = pathSegments.map((segment, index) => {
      // Create href up to current segment
      const href = "/" + pathSegments.slice(0, index + 1).join("/");

      // Format label: replace hyphens/underscores, title case
      const label = segment
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return { label, href };
    });

    // Prepend Home
    setBreadcrumbs([{ label: "Home", href: "/" }, ...items]);
  }, [pathname]);

  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="mb-6 text-sm" aria-label="breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1 md:gap-x-2">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li
              key={item.href}
              className="flex items-center gap-x-1 md:gap-x-2"
            >
              {!isLast ? (
                <>
                  <Link
                    href={item.href}
                    className="group text-gray-500 flex gap-1 items-center hover:text-blue-900 transition-colors duration-200"
                  >
                    {item.label === "Home" && (
                      <span className=" group-hover:text-blue-900 mb-1">
                        <Icon icon="ic:outline-home" width="20" height="20" />
                      </span>
                    )}
                    {item.label}
                  </Link>
                  {"/"}
                </>
              ) : (
                <span className="font-medium text-gray-800 ">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
