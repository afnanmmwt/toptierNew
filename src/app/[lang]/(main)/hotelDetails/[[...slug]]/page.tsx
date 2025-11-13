import React from "react";
import TransitionLayout from "@src/utils/pageTransition";
import { HotelDetailsMain } from "@components/themes/default";
import { Metadata } from "next";
export const metadata = { title: `Toptier | HotelDetails` } satisfies Metadata;
export default async function Page() {
  return (
    // <div>home page</div>
    <TransitionLayout>
      <div className="flex  flex-col bg-white dark:bg-gray-900  dark:text-gray-50 ">
        <HotelDetailsMain />
      </div>
    </TransitionLayout>
  );
}
export const dynamic = "force-dynamic"; // Optional: if data changes often
