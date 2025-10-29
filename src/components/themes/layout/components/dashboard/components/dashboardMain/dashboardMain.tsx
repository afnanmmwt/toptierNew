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
  // probable name keys from your API—add/remove as needed:
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
  canceled?: number; // US
  cancelled?: number; // UK
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

  const [filters, setFilters] = useState<{
    search: string;
    payment_status: string;
  }>({
    search: "",
    payment_status: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);
  const { user } = useUser();
  const router = useRouter();

  // --- Debounce search -> push to backend filter ---
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((p) => ({ ...p, search: searchTerm }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // --- Verify / redirect (unchanged) ---
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const verify_response = await verify_token();
        if (!verify_response?.status) {
          router.push("/auth/login");
          return;
        }
        if (user.user_type === "Customer") {
          await getAccessToken();
        } else if (user.user_type === "Agent") {
          const token = await getAccessToken();
          const url = `http://localhost:3001/?token=${encodeURIComponent(
            token
          )}&user_id=${user.user_id}`;
          window.location.href = url;
        } else {
          router.push("/auth/login");
        }
      } catch (e) {
        console.error("Token verification failed:", e);
        router.push("/auth/login");
      }
    })();
  }, [user, router]);

  // --- Infinite list: backend handles search + payment_status ---
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<PageResult>({
    queryKey: ["dashboard", filters.search, filters.payment_status, PAGE_SIZE],
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<PageResult> => {
      const payload: any = { page: pageParam, limit: PAGE_SIZE };
      if (filters.search.trim()) payload.search = filters.search.trim();

      if (filters.payment_status)
        payload.payment_status = filters.payment_status;

      // If your API supports scoping, keep this; otherwise remove it (no harm if ignored):
      payload.search_scope = "name,reference,booking_id";

      const res = await fetch_dashboard_data(payload);
      const total = Number(
        (res as any).total_records ?? (res as any).total ?? 0
      );
      if (pageParam === 1) {
        console.log("[dashboard] counts from API:", (res as any)?.counts);
      }
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

  // ---------- SEARCH: Client-side match (instant UX) ----------
  // We still send search to backend (above) so server-side paging is correct.
  // This local filter just narrows what's already loaded for snappy feel.
  const norm = (v?: any) => (v == null ? "" : String(v).toLowerCase());
  const makeCardName = (b: Booking) => {
    // pick whichever name fields your API returns:
    const name =
      b.name ??
      b.customer_name ??
      b.lead_pax_name ??
      [b.first_name, b.last_name].filter(Boolean).join(" ");
    return norm(name);
  };
  const searchNeedle = norm(filters.search);

  const visibleBookings = useMemo(() => {
    if (!searchNeedle) return bookings;
    return bookings.filter((b) => {
      const byName = makeCardName(b).includes(searchNeedle);
      const byRef = norm(b.reference).includes(searchNeedle);
      const byId = norm(b.booking_id).includes(searchNeedle);
      return byName || byRef || byId;
    });
  }, [bookings, searchNeedle]);

  // ---------- COUNTS: always show API counts from first page ----------
  const firstPage = pages[0] as PageResult | undefined;
  const countsFromApi = (firstPage?.counts ?? {}) as ApiCounts;
  const cancelledCount = countsFromApi.canceled ?? countsFromApi.cancelled ?? 0;
  const totalAll =
    countsFromApi.total ??
    (countsFromApi.paid ?? 0) +
      (countsFromApi.unpaid ?? 0) +
      (countsFromApi.refunded ?? 0) +
      (cancelledCount ?? 0) + 0;

  // Profile (unchanged)
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

  // IO sentinel (unchanged)
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
                count: totalAll || 0,
              },
              {
                label: dict?.dashboard?.paid || "Paid",
                value: "paid",
                count: countsFromApi.paid ?? 0,
              },
              {
                label: dict?.dashboard?.unpaid || "Unpaid",
                value: "unpaid",
                count: countsFromApi.unpaid ?? 0,
              },
              {
                label: dict?.dashboard?.refunded || "Refunded",
                value: "refunded",
                count: countsFromApi.refunded ?? 0,
              },
              {
                label: dict?.dashboard?.cancelled || "Cancelled",
                value: "cancelled",
                count: cancelledCount ?? 0,
              },
            ].map((o) => (
              <button
                key={o.value || "all"}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, payment_status: o.value }))
                }
                className={`px-4 py-1.5 text-xs rounded-xl border transition-colors cursor-pointer ${
                  filters.payment_status === o.value
                    ? "bg-blue-900 text-white border-blue-900"
                    : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <span className="text-sm">
                  {o.label} ({o.count})
                </span>
              </button>
            ))}
          </div>

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

// Stat card (icons omitted for brevity)
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
        <div className="text-white flex items-center justify-center bg-blue-900 p-3 w-12 h-12 rounded-lg" />
        <div className="flex flex-col gap-3">
          <p className="text-sm font-normal text-[#4B5563]">{label}</p>
          <p className="text-[#111827] font-bold text-3xl">{value}</p>
          <p className="text-sm font-normal text-[#64748B]">{sub}</p>
        </div>
      </div>
    </div>
  );
}
