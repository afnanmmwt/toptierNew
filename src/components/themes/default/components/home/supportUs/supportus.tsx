"use client"

import React from 'react'
import Link from 'next/link'
import useLocale from '@hooks/useLocale';
import useDictionary from '@hooks/useDict';

export default function Support() {
  const { locale } = useLocale();
        const { data: dict} = useDictionary(locale as any);
   
  return (
    // <div>home page</div>
    
      <section className="min-h-screen  flex flex-col items-center justify-center text-center px-6 py-20">
        {/* Hero Section */}
        <div className="max-w-3xl">
          <h1 className="text-5xl font-extrabold text-blue-800 mb-4">
            {dict?.support?.heading} Top Tier Travel
          </h1>
          <p className="text-gray-800 text-lg leading-relaxed mb-6">
           {dict?.support?.p_1} <span className="font-semibold text-blue-800">Top Tier</span>{dict?.support?.p_3}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link
              href="/contact"
              className="bg-blue-800 text-white px-11 py-2 rounded-full hover:bg-gray0-800 transition-all duration-300 shadow-md"
            >
              {dict?.support?.contact_us}
            </Link>
          </div>
        </div>

        {/* Why Support Section */}
        <div className="max-w-5xl mt-20 grid md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-bold text-blue-800 mb-2">{dict?.support?.empower_travelers}</h3>
            <p className="text-gray-600">
              {dict?.support?.empower_travelers_p}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-bold text-blue-800 mb-2">{dict?.support?.sustain_quality}</h3>
            <p className="text-gray-600">
              {dict?.support?.sustain_quality_p}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition duration-300">
            <h3 className="text-xl font-bold text-blue-800 mb-2">{dict?.support?.community_growth}</h3>
            <p className="text-gray-600">
              {dict?.support?.community_growth_p}
            </p>
          </div>
        </div>

      </section>
    
  )
}
export const dynamic = 'force-dynamic';