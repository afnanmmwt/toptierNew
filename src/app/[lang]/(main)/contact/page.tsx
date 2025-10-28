import React from 'react'
import { getDictionary } from '@src/get-dictionary'
// import { Icon } from '@iconify/react'
// import { HomeWrapper } from '@components/themes/default'
import TransitionLayout from '@src/utils/pageTransition'
import Contactus from '@components/themes/default/components/home/contactUs/contactus'
// import HomeWrapper from '@components/themes/default/components/home/homeWrapper/homeWrapper'
// import { HotelDetails } from '@components/themes/default'

export default async function Page({ params }: {
  params: Promise<{ lang: 'en' | 'ar' }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return (
    // <div>home page</div>
    <TransitionLayout>
      <div className="flex  flex-col bg-white dark:bg-gray-900  dark:text-gray-50 appHorizantalSpacing " >
         {/* <HotelDetails/> */}
         <Contactus />
      </div>
    </TransitionLayout>
  )
}
export const dynamic = 'force-dynamic'; // Optional: if data changes often
// export const revalidate = 3600; // ← This enables ISR