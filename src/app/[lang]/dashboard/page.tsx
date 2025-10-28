// import React from 'react'
// import { getDictionary } from '@src/get-dictionary'
import { DashboardMain } from '@components/themes/layout'
import TransitionLayout from '@src/utils/pageTransition'
import { Metadata } from 'next/types'
export const metadata = { title: `Toptier | Dashboard ` } satisfies Metadata;
export default async function Page() {

  return (
    <TransitionLayout>
    <div className="flex  flex-col min-w-full h-full dark:bg-gray-900  dark:text-gray-50 " >
       <DashboardMain/>
    </div>
    </TransitionLayout>
  )
}
export const dynamic = 'force-dynamic'