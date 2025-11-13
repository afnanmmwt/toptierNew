import React from "react";
import TransitionLayout from "@src/utils/pageTransition";
import Support from "@components/themes/default/components/home/supportUs/supportus";
export default async function Page() {
  return (
    // <div>home page</div>
    <TransitionLayout>
      <div className="flex  flex-col bg-white dark:bg-gray-900  dark:text-gray-50 ">
        {/* <HotelDetails/> */}

        <Support />
      </div>
    </TransitionLayout>
  );
}
export const dynamic = "force-dynamic"; // Optional: if data changes often
// export const revalidate = 3600; // ← This enables ISR
