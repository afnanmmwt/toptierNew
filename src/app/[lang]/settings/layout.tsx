import * as React from 'react'
import '@src/css/app.css'
import { Noto_Kufi_Arabic, DM_Sans , Urbanist} from 'next/font/google'
import AppProvider from '@lib/appProvider'
import { fetchAppData } from '@src/actions'
import { Metadata } from 'next/types'

export const generateMetadata = async (): Promise<Metadata> => {
  const data = await fetchAppData({ language: 'en', currency: 'usd' });
  const appData=data.app
 
  const meta_data = data.data.app
  if (!meta_data) {
    return {
      title: '404',
      description: '404',
    }
  }

  const { agency_name, meta_title, domain, meta_description, logo, favicon_img } = meta_data
 

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL!),
    alternates: {
      canonical: '/',
      languages: {
        'en-US': '/en',
        'ar-SA': '/ar',
      },
    },
    icons: {
      icon: favicon_img,
      shortcut: logo,
      apple: logo,
    },
    keywords: 'some keyword',
    title: meta_title,
    authors: [],
    robots: '',
    applicationName: agency_name,
    creator: agency_name,
    publisher: agency_name,
    generator: 'Next.js',
    referrer: 'origin-when-cross-origin',
    description: meta_description,
    openGraph: {
      title: domain,
      description: meta_description,
      url: process.env.NEXT_PUBLIC_SITE_URL!,
      siteName: domain,
      images: [
        {
          url: logo,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
  }
}

const dmSans = DM_Sans({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  display: 'swap',
})

const notoKufiArabic = Noto_Kufi_Arabic({
  weight: ['400', '700'],
  subsets: ['arabic'],
  display: 'swap',
})
const urbanist = Urbanist({
  subsets: ['latin'],
   weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-urbanist',
  display: 'swap',
})
export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: 'en' | 'ar' }> // 👈 mark params as a Promise
}) {
  const { lang } = await params // 👈 await it

const isArabic = lang === 'ar'
const fontClass = isArabic ? notoKufiArabic.className : urbanist.className

  return (
    <html lang={lang} dir={isArabic ? 'rtl' : 'ltr'}>
      <body className={fontClass}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  )
}
