import React from 'react'
import { getDictionary } from '@src/get-dictionary'
// import { Icon } from '@iconify/react'
// import { HomeWrapper } from '@components/themes/default'
import TransitionLayout from '@src/utils/pageTransition'
// import HomeWrapper from '@components/themes/default/components/home/homeWrapper/homeWrapper'
// import { HotelsListingMain} from '@components/themes/default'
// import { hotel_search } from '@src/actions'
import { Metadata } from 'next';
import { HeroSection, FeaturedHotels, HotelsListingMain } from '@components/themes/default'
export const metadata = { title: `Toptier | HotelListing` } satisfies Metadata;
export default async function Page({ params }: {
  params: Promise<{ lang: 'en' | 'ar' ,slug: string[]}>
}) {
  const { lang,slug } = await params
//  const modules = searchParams.modules
  const dict = await getDictionary(lang)
  return (
    <TransitionLayout>
      <div className="flex flex-col bg-white dark:bg-gray-900 dark:text-gray-50">
        {slug ?
          <HotelsListingMain  slug={slug}/>
          :  <div className="flex  flex-col bg-white dark:bg-gray-900  dark:text-gray-50 " >
                <HeroSection/>
                <FeaturedHotels/>
                </div>
  }
      </div>
    </TransitionLayout>
  )
}
export const dynamic = "force-dynamic"