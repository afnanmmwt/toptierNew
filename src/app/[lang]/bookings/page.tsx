
import React from 'react'
import { getDictionary } from '@src/get-dictionary'
import TransitionLayout from '@src/utils/pageTransition'
import { BookingDetails } from '@components/themes/default'
export default async function Page() {
  return (
    // <div>home page</div>
    <TransitionLayout>
      <div className="flex  flex-col bg-white dark:bg-gray-900  dark:text-gray-50 " >
         <BookingDetails/>
      </div>
    </TransitionLayout>
  )
}
export const dynamic = 'force-dynamic'; // Optional: if data changes often
// export const revalidate = 3600; // ← This enables ISR