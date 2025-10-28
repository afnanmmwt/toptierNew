import React from 'react'
import { getDictionary } from '@src/get-dictionary'
// import { Icon } from '@iconify/react'
// import { HomeWrapper } from '@components/themes/default'
import TransitionLayout from '@src/utils/pageTransition'
import HomeWrapper from '@components/themes/default/components/home/homeWrapper/homeWrapper'
import { fetch_gateway } from '@src/actions'

export default async function Page({ params }: {
  params: Promise<{ lang: 'en' | 'ar' | 'fr'| 'tr' | 'ru' | 'ge' | 'ch' }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)


  return (
    // <div>home page</div>
    <TransitionLayout>
      <div className="flex  flex-col bg-white dark:bg-gray-900  dark:text-gray-50 " >
        <HomeWrapper  dict={dict} />
      </div>
    </TransitionLayout>
  )
}
export const dynamic = 'force-dynamic'; // Optional: if data changes often
// export const revalidate = 3600; // ← This enables ISR