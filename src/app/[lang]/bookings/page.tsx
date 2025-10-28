import React from 'react'
// import { getDictionary } from '@src/get-dictionary'
import TransitionLayout from '@src/utils/pageTransition'
import { Metadata } from 'next/types'
export const metadata = { title: `Toptier | Booking` } satisfies Metadata;
export default async function Page() {

  return (
    <TransitionLayout>
    <div className="flex  flex-col w-full h-full dark:bg-gray-900  dark:text-gray-50 " >
        <h1 className='text-bold'>user dashbaord route</h1>
    </div>
    </TransitionLayout>
  )
}
export const dynamic = 'force-dynamic'