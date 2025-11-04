"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  fetch_dashboard_data,
  get_profile,
  getAccessToken,
  verify_token,
} from "@src/actions";
import useLocale from "@hooks/useLocale";
import useDictionary from "@hooks/useDict";
import DashboardCard, { toCardData } from "./dashboardCard";
import { useUser } from "@hooks/use-user";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 6;

type Booking = {
  booking_id?: string | number;
  reference?: string;
  pnr?: string;
  payment_status?: string;
  booking_status?: string;
  status?: string;
  name?: string;
  customer_name?: string;
  lead_pax_name?: string;
  first_name?: string;
  last_name?: string;
  [k: string]: any;
};

type ApiCounts = {
  total?: number;
  paid?: number;
  unpaid?: number;
  refunded?: number;
  canceled?: number;
  cancelled?: number;
};

type PageResult = {
  status?: string;
  message?: string;
  data: Booking[];
  page?: number;
  limit?: number;
  total?: number;
  total_records?: number;
  counts?: ApiCounts;
  [k: string]: any;
};

export default function Dashboard() {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const ioBusyRef = useRef(false);
  const lingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filters: all chips use payment_status; only Cancelled uses booking_status
  const [filters, setFilters] = useState<{
    search: string;
    payment_status: string;
    booking_status: string;
  }>({
    search: "",
    payment_status: "",
    booking_status: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);
  const { user, checkSession } = useUser();
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);


  // Debounce search → API
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((p) => ({ ...p, search: searchTerm }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Auth guard
  // useEffect(() => {
  //   if (!user) return;
  //   (async () => {
  //     try {
  //       const verify_response = await verify_token();
  //       if (!verify_response?.status) {
  //         router.push("/auth/login");
  //         return;
  //       }
  //       if (user.user_type === "Customer") {
  //         router.push("/dashboard");
  //       } else if (user.user_type === "Agent") {
  //         const token = await getAccessToken();
  //         const url = `https://toptier-agent-d-ua92.vercel.app/?token=${encodeURIComponent(
  //           token
  //         )}&user_id=${user.user_id}`;
  //         window.location.href = url;
  //       } else {
  //         router.push("/auth/login");
  //       }
  //     } catch {
  //       router.push("/auth/login");
  //     }
  //   })();
  // }, [user, router]);

  // Server-driven paging + filters (API owns filtering)
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PageResult>({
    queryKey: [
      "dashboard",
      filters.search,
      filters.booking_status === "cancelled"
        ? "cancelled"
        : filters.payment_status,
      PAGE_SIZE,
    ],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<PageResult> => {
      const payload: any = { page: pageParam, limit: PAGE_SIZE };

      if (filters.search.trim()) payload.search = filters.search.trim();

      // If "Cancelled" chip selected -> send booking_status only
      if (filters.booking_status === "cancelled") {
        payload.booking_status = "cancelled";
        payload.status = "cancelled";
        payload.bookingStatus = "cancelled";
      } else if (filters.payment_status) {
        // All other chips -> use payment_status
        payload.payment_status = filters.payment_status;
      }

      payload.search_scope = "name,reference,booking_id";

      const res = await fetch_dashboard_data(payload);
      const total = Number(
        (res as any).total_records ?? (res as any).total ?? 0
      );
      return { ...res, page: Number(pageParam), limit: PAGE_SIZE, total };
    },
    getNextPageParam: (last) => {
      const total = Number(last.total ?? 0);
      const page = Number(last.page ?? 1);
      const size = Number(last.limit ?? PAGE_SIZE);
      if (total > 0) return page * size < total ? page + 1 : undefined;
      const len = Array.isArray(last.data) ? last.data.length : 0;
      return len === size ? page + 1 : undefined;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const pages = data?.pages || [];

  const bookings: Booking[] = pages.flatMap((p) => p?.data || []);

  // ✅ FIX: Remove frontend filtering - API already handles search
  // Since the backend filters by search, we should display all returned bookings
  const visibleBookings = bookings;

  // Counts from API (first page)
  const firstPage = pages[0] as PageResult | undefined;
  const countsFromApi = (firstPage?.counts ?? {}) as ApiCounts;
  const cancelledCount = countsFromApi.canceled ?? countsFromApi.cancelled ?? 0;
  const totalAll =
    countsFromApi.total ??
    (countsFromApi.paid ?? 0) +
      (countsFromApi.unpaid ?? 0) +
      (countsFromApi.refunded ?? 0) +
      cancelledCount;

  // Profile
  const { data: cartResults } = useQuery({
    queryKey: ["profile"],
    queryFn: get_profile,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const {
    // total_bookings = "0",
    // pending_bookings = "0",
    // balance = "0",
    // Cancelled = "0",
    first_name = "",
    last_name = "",
  } = cartResults?.data?.[0] || {};

  // Infinite scroll sentinel
  useEffect(() => {
    if (!sentinelRef.current) return;
    const node = sentinelRef.current;

    const onEnter = () => {
      if (ioBusyRef.current || !hasNextPage || isFetchingNextPage) return;
      lingerTimerRef.current = setTimeout(async () => {
        if (ioBusyRef.current || !hasNextPage || isFetchingNextPage) return;
        ioBusyRef.current = true;
        try {
          await fetchNextPage();
        } finally {
          setTimeout(() => (ioBusyRef.current = false), 100);
        }
      }, 700);
    };

    const onLeave = () => {
      if (lingerTimerRef.current) {
        clearTimeout(lingerTimerRef.current);
        lingerTimerRef.current = null;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[0];
        if (e.isIntersecting) onEnter();
        else onLeave();
      },
      { root: null, rootMargin: "250px 250px", threshold: 0 }
    );

    io.observe(node);
    return () => {
      io.disconnect();
      onLeave();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="w-full max-w-[1200px] mx-auto bg-gray-50 py-4 md:py-10 appHorizantalSpacing">
      <h1 className="text-3xl font-bold text-[#0F172A] mb-1">
        {dict?.dashboard?.welcome_back} {first_name} {last_name}
      </h1>
      <p className="text-[#475569] text-base font-normal mb-8">
        {dict?.dashboard?.overview_text}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <StatCard
          label={dict?.dashboard?.bookings}
          value={countsFromApi.total?.toString() || "0"}
          sub={dict?.dashboard?.bookings_sub}
          title="booking"
        />
        <StatCard
          label={dict?.dashboard?.pending_invoices}
          value={countsFromApi.unpaid?.toString() || "0"}
          sub={dict?.dashboard?.pending_invoices_sub}
          title="pending"
        />
        <StatCard
          label={dict?.dashboard?.cancelled_bookings}
          value={cancelledCount?.toString() || "0"}
          sub={dict?.dashboard?.cancelled_bookings}
          title="cancelled"
        />
      </div>

      <div className="border border-gray-200 rounded-2xl bg-white shadow-md">
        {/* Filters header */}
        <div className="flex flex-wrap md:flex-row items-center justify-between gap-4 p-4 border-b border-gray-100">
          <div className="flex flex-wrap md:flex-row gap-2">
            {[
              {
                label: dict?.dashboard?.all || "All",
                value: "",
                type: "payment" as const,
                count: totalAll || 0,
              },
              {
                label: dict?.dashboard?.paid || "Paid",
                value: "paid",
                type: "payment" as const,
                count: countsFromApi.paid ?? 0,
              },
              {
                label: dict?.dashboard?.unpaid || "Unpaid",
                value: "unpaid",
                type: "payment" as const,
                count: countsFromApi.unpaid ?? 0,
              },
              {
                label: dict?.dashboard?.refunded || "Refunded",
                value: "refunded",
                type: "payment" as const,
                count: countsFromApi.refunded ?? 0,
              },
              // Cancelled = booking_status based
              {
                label: dict?.dashboard?.cancelled || "Cancelled",
                value: "cancelled",
                type: "booking" as const,
                count: cancelledCount ?? 0,
              },
            ].map((o) => {
              const isActive =
                o.type === "payment"
                  ? filters.booking_status === "" &&
                    filters.payment_status === o.value
                  : filters.booking_status === "cancelled";

              return (
                <button
                  key={`${o.type}-${o.value || "all"}`}
                  onClick={() =>
                    setFilters((prev) =>
                      o.type === "payment"
                        ? {
                            ...prev,
                            payment_status: o.value,
                            booking_status: "",
                          }
                        : {
                            ...prev,
                            booking_status: "cancelled",
                            payment_status: "",
                          }
                    )
                  }
                  className={`px-4 py-1.5 text-xs rounded-xl border transition-colors cursor-pointer ${
                    isActive
                      ? "bg-blue-900 text-white border-blue-900"
                      : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-sm">
                    {o.label} ({o.count})
                  </span>
                </button>
              );
            })}
          </div>
          {/* <span></span> */}
          <input
            type="text"
            placeholder={
              dict?.dashboard?.search_placeholder ||
              "Search by name, reference, ID"
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-200 hover:bg-gray-100 text-sm rounded-xl w-64 px-3 py-2 focus:outline-none focus:ring-0 focus:border-gray-200"
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-10 items-center w-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-6 text-red-500">
            {(error as Error)?.message || "Something went wrong"}
          </div>
        )}

        {/* Cards + Infinite scroll */}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <div className="p-4">
              {visibleBookings.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {visibleBookings.map((b: Booking) => (
                      <DashboardCard
                        key={(b.booking_id as any) ?? b.reference ?? b.pnr}
                        data={toCardData(b)}
                      />
                    ))}
                  </div>

                  {isFetchingNextPage && (
                    <div className="flex gap-4 justify-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-blue-900"></div>
                      <div className="text-blue-900 text-xl font-bold">
                        Loading
                      </div>
                    </div>
                  )}

                  <div
                    ref={sentinelRef}
                    className="h-5 w-full"
                    aria-hidden
                    data-sentinel
                  />

                  {hasNextPage && !isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                      <button onClick={() => fetchNextPage()}>
                        {dict?.dashboard?.load_more || ""}
                      </button>
                    </div>
                  )}

                  {!hasNextPage && bookings.length > 0 && (
                    <div className="text-center py-6 text-blue-950 text-lg font-medium">
                      {dict?.dashboard?.no_more_results ||
                        "You’re all caught up."}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  {dict?.dashboard?.no_bookings_found}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
//  Reusable Stat Card (unchanged)
function StatCard({
  label,
  value,
  sub,
  title,
}: {
  label: string;
  value: string;
  sub: string;
  title: string;
}) {
  return (
    <div className="bg-white shadow rounded-2xl p-6 border border-[#F1F5F9]">
      <div className="flex flex-col gap-4">
        <div className="text-white flex items-center justify-center bg-blue-900 p-3 w-12 h-12 rounded-lg">
          {/* SVG Icons remain unchanged */}
          {title === "booking" ? (
            // booking icon

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              role="img"
              aria-labelledby="titleOutline"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="5" width="18" height="16" rx="2.2" />
                <path d="M16 3v4M8 3v4" />
                <path d="M3 10h18" />
                <path
                  d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01M16 17h.01"
                  strokeWidth="1.8"
                />
              </g>
            </svg>
          ) : title === "pending" ? (
            // pending icon

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M17 12c-2.76 0-5 2.24-5 5s2.24 5 5 5s5-2.24 5-5s-2.24-5-5-5m1.65 7.35L16.5 17.2V14h1v2.79l1.85 1.85zM18 3h-3.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H6c-1.1 0-2 .9-2 2v15c0 1.1.9 2 2 2h6.11a6.7 6.7 0 0 1-1.42-2H6V5h2v3h8V5h2v5.08c.71.1 1.38.31 2 .6V5c0-1.1-.9-2-2-2m-6 2c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1"
              />
            </svg>
          ) : (
            // cancelled icon
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 16 16"
            >
              <path
                fill="currentColor"
                fillRule="evenodd"
                d="M14.5 8a6.5 6.5 0 1 1-13 0a6.5 6.5 0 0 1 13 0M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.28 4.22a.75.75 0 0 0-1.06 1.06l6.5 6.5a.75.75 0 1 0 1.06-1.06z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-normal text-[#64748B]">{sub}</p>
          {/* <p className="text-sm font-normal text-[#4B5563]">{label}</p> */}
          <p className="text-[#111827] font-bold text-3xl">{value}</p>
        </div>
      </div>
    </div>
  );
}
