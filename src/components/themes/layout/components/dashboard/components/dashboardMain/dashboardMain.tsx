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
  const { user , checkSession} = useUser();
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
    total_bookings = "0",
    pending_bookings = "0",
    balance = "0",
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
          label={dict?.dashboard?.wallet_balance}
          value={balance}
          sub={dict?.dashboard?.wallet_balance_sub}
          title="wallet"
        />
        <StatCard
          label={dict?.dashboard?.bookings}
          value={total_bookings}
          sub={dict?.dashboard?.bookings_sub}
          title="booking"
        />
        <StatCard
          label={dict?.dashboard?.pending_invoices}
          value={pending_bookings}
          sub={dict?.dashboard?.pending_invoices_sub}
          title="invoice"
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
          {title === "wallet" ? (
            // wallet icon
            <svg
              width="22"
              height="18"
              viewBox="0 0 22 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.75 4.75H8.75"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.583 5.75H16.981C15.196 5.75 13.75 7.093 13.75 8.75C13.75 10.407 15.197 11.75 16.98 11.75H19.583C19.667 11.75 19.708 11.75 19.743 11.748C20.283 11.715 20.713 11.316 20.748 10.815C20.75 10.783 20.75 10.744 20.75 10.667V6.833C20.75 6.756 20.75 6.717 20.748 6.685C20.712 6.184 20.283 5.785 19.743 5.752C19.709 5.75 19.667 5.75 19.583 5.75Z"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M19.715 5.75C19.637 3.878 19.387 2.73 18.578 1.922C17.407 0.75 15.521 0.75 11.75 0.75H8.75C4.979 0.75 3.093 0.75 1.922 1.922C0.751 3.094 0.75 4.979 0.75 8.75C0.75 12.521 0.75 14.407 1.922 15.578C3.094 16.749 4.979 16.75 8.75 16.75H11.75C15.521 16.75 17.407 16.75 18.578 15.578C19.387 14.77 19.638 13.622 19.715 11.75"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M16.7412 8.75H16.7512"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : title === "booking" ? (
            // booking icon
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M17 14C17.2652 14 17.5196 13.8946 17.7071 13.7071C17.8946 13.5196 18 13.2652 18 13C18 12.7348 17.8946 12.4804 17.7071 12.2929C17.5196 12.1054 17.2652 12 17 12C16.7348 12 16.4804 12.1054 16.2929 12.2929C16.1054 12.4804 16 12.7348 16 13C16 13.2652 16.1054 13.5196 16.2929 13.7071C16.4804 13.8946 16.7348 14 17 14ZM17 18C17.2652 18 17.5196 17.8946 17.7071 17.7071C17.8946 17.5196 18 17.2652 18 17C18 16.7348 17.8946 16.4804 17.7071 16.2929C17.5196 16.1054 17.2652 16 17 16C16.7348 16 16.4804 16.1054 16.2929 16.2929C16.1054 16.4804 16 16.7348 16 17C16 17.2652 16.1054 17.5196 16.2929 17.7071C16.4804 17.8946 16.7348 18 17 18ZM13 13C13 13.2652 12.8946 13.5196 12.7071 13.7071C12.5196 13.8946 12.2652 14 12 14C11.7348 14 11.4804 13.8946 11.2929 13.7071C11.1054 13.5196 11 13.2652 11 13C11 12.7348 11.1054 12.4804 11.2929 12.2929C11.4804 12.1054 11.7348 12 12 12C12.2652 12 12.5196 12.1054 12.7071 12.2929C12.8946 12.4804 13 12.7348 13 13ZM13 17C13 17.2652 12.8946 17.5196 12.7071 17.7071C12.5196 17.8946 12.2652 18 12 18C11.7348 18 11.4804 17.8946 11.2929 17.7071C11.1054 17.5196 11 17.2652 11 17C11 16.7348 11.1054 16.4804 11.2929 16.2929C11.4804 16.1054 11.7348 16 12 16C12.2652 16 12.5196 16.1054 12.7071 16.2929C12.8946 16.4804 13 16.7348 13 17ZM7 14C7.26522 14 7.51957 13.8946 7.70711 13.7071C7.89464 13.5196 8 13.2652 8 13C8 12.7348 7.89464 12.4804 7.70711 12.2929C7.51957 12.1054 7.26522 12 7 12C6.73478 12 6.48043 12.1054 6.29289 12.2929C6.10536 12.4804 6 12.7348 6 13C6 13.2652 6.10536 13.5196 6.29289 13.7071C6.48043 13.8946 6.73478 14 7 14ZM7 18C7.26522 18 7.51957 17.8946 7.70711 17.7071C7.89464 17.5196 8 17.2652 8 17C8 16.7348 7.89464 16.4804 7.70711 16.2929C7.51957 16.1054 7.26522 16 7 16C6.73478 16 6.48043 16.1054 6.29289 16.2929C6.10536 16.4804 6 16.7348 6 17C6 17.2652 6.10536 17.5196 6.29289 17.7071C6.48043 17.8946 6.73478 18 7 18Z"
                fill="white"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.99998 1.75C7.19889 1.75 7.38965 1.82902 7.53031 1.96967C7.67096 2.11032 7.74998 2.30109 7.74998 2.5V3.263C8.41198 3.25 9.14098 3.25 9.94298 3.25H14.056C14.859 3.25 15.588 3.25 16.25 3.263V2.5C16.25 2.30109 16.329 2.11032 16.4696 1.96967C16.6103 1.82902 16.8011 1.75 17 1.75C17.1989 1.75 17.3897 1.82902 17.5303 1.96967C17.671 2.11032 17.75 2.30109 17.75 2.5V3.327C18.01 3.347 18.2563 3.37233 18.489 3.403C19.661 3.561 20.61 3.893 21.359 4.641C22.107 5.39 22.439 6.339 22.597 7.511C22.75 8.651 22.75 10.106 22.75 11.944V14.056C22.75 15.894 22.75 17.35 22.597 18.489C22.439 19.661 22.107 20.61 21.359 21.359C20.61 22.107 19.661 22.439 18.489 22.597C17.349 22.75 15.894 22.75 14.056 22.75H9.94498C8.10698 22.75 6.65098 22.75 5.51198 22.597C4.33998 22.439 3.39098 22.107 2.64198 21.359C1.89398 20.61 1.56198 19.661 1.40398 18.489C1.25098 17.349 1.25098 15.894 1.25098 14.056V11.944C1.25098 10.106 1.25098 8.65 1.40398 7.511C1.56198 6.339 1.89398 5.39 2.64198 4.641C3.39098 3.893 4.33998 3.561 5.51198 3.403C5.74531 3.37233 5.99164 3.347 6.25098 3.327V2.5C6.25098 2.30126 6.32986 2.11065 6.47029 1.97002C6.61073 1.8294 6.80124 1.75026 6.99998 1.75ZM5.70998 4.89C4.70498 5.025 4.12498 5.279 3.70198 5.702C3.27898 6.125 3.02498 6.705 2.88998 7.71C2.86731 7.88 2.84798 8.05967 2.83198 8.249H21.168C21.152 8.05967 21.1326 7.87967 21.11 7.709C20.975 6.704 20.721 6.124 20.298 5.701C19.875 5.278 19.295 5.024 18.289 4.889C17.262 4.751 15.907 4.749 14 4.749H9.99998C8.09298 4.749 6.73898 4.752 5.70998 4.89ZM2.74998 12C2.74998 11.146 2.74998 10.403 2.76298 9.75H21.237C21.25 10.403 21.25 11.146 21.25 12V14C21.25 15.907 21.248 17.262 21.11 18.29C20.975 19.295 20.721 19.875 20.298 20.298C19.875 20.721 19.295 20.975 18.289 21.11C17.262 21.248 15.907 21.25 14 21.25H9.99998C8.09298 21.25 6.73898 21.248 5.70998 21.11C4.70498 20.975 4.12498 20.721 3.70198 20.298C3.27898 19.875 3.02498 19.295 2.88998 18.289C2.75198 17.262 2.74998 15.907 2.74998 14V12Z"
                fill="white"
              />
            </svg>
          ) : (
            // invoice icon
            <svg
              width="20"
              height="22"
              viewBox="0 0 20 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.694 0H10.806C12.644 0 14.1 0 15.239 0.153C16.411 0.311 17.36 0.643 18.109 1.391C18.857 2.14 19.189 3.089 19.347 4.261C19.5 5.401 19.5 6.856 19.5 8.694V12.806C19.5 14.644 19.5 16.1 19.347 17.239C19.189 18.411 18.857 19.36 18.109 20.109C17.36 20.857 16.411 21.189 15.239 21.347C14.099 21.5 12.644 21.5 10.806 21.5H8.694C6.856 21.5 5.4 21.5 4.261 21.347C3.089 21.189 2.14 20.857 1.391 20.109C0.643 19.36 0.311 18.411 0.153 17.239C1.19209e-07 16.099 0 14.644 0 12.806V8.694C0 6.856 1.19209e-07 5.4 0.153 4.261C0.311 3.089 0.643 2.14 1.391 1.391C2.14 0.643 3.089 0.311 4.261 0.153C5.401 0 6.856 0 8.694 0ZM4.46 1.64C3.454 1.775 2.874 2.029 2.45 2.452C2.028 2.875 1.774 3.455 1.639 4.461C1.501 5.489 1.499 6.843 1.499 8.75V12.75C1.499 14.657 1.501 16.012 1.639 17.04C1.774 18.045 2.028 18.625 2.451 19.048C2.874 19.471 3.454 19.725 4.46 19.86C5.488 19.998 6.842 20 8.749 20H10.749C12.656 20 14.011 19.998 15.039 19.86C16.044 19.725 16.624 19.471 17.047 19.048C17.47 18.625 17.724 18.045 17.859 17.039C17.997 16.012 17.999 14.657 17.999 12.75V8.75C17.999 6.843 17.997 5.489 17.859 4.46C17.724 3.455 17.47 2.875 17.047 2.452C16.624 2.029 16.044 1.775 15.038 1.64C14.011 1.502 12.656 1.5 10.749 1.5H8.749C6.842 1.5 5.489 1.502 4.46 1.64ZM5 8.75C5 8.55109 5.07902 8.36032 5.21967 8.21967C5.36032 8.07902 5.55109 8 5.75 8H13.75C13.9489 8 14.1397 8.07902 14.2803 8.21967C14.421 8.36032 14.5 8.55109 14.5 8.75C14.5 8.94891 14.421 9.13968 14.2803 9.28033C14.1397 9.42098 13.9489 9.5 13.75 9.5H5.75C5.55109 9.5 5.36032 9.42098 5.21967 9.28033C5.07902 9.13968 5 8.94891 5 8.75ZM5 12.75C5 12.5511 5.07902 12.3603 5.21967 12.2197C5.36032 12.079 5.55109 12 5.75 12H10.75C10.9489 12 11.1397 12.079 11.2803 12.2197C11.421 12.3603 11.5 12.5511 11.5 12.75C11.5 12.9489 11.421 13.1397 11.2803 13.2803C11.1397 13.421 10.9489 13.5 10.75 13.5H5.75C5.55109 13.5 5.36032 13.421 5.21967 13.2803C5.07902 13.1397 5 12.9489 5 12.75Z"
                fill="white"
              />
            </svg>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <p className="text-sm font-normal text-[#4B5563]">{label}</p>
          <p className="text-[#111827] font-bold text-3xl">{value}</p>
          <p className="text-sm font-normal text-[#64748B]">{sub}</p>
        </div>
      </div>
    </div>
  );
}
