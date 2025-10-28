
import { Login } from '@components/themes/default/components/auth/login'
import { getDictionary } from '@src/get-dictionary'
import React from 'react'
import { Metadata } from 'next/types'
import PageTransition from '@src/utils/pageTransition';

export const metadata = { title: `Auth | Login` } satisfies Metadata;
export default async function Page({ params }: {
    params: Promise<{ lang: 'en' | 'ar' }>
}) {
    const { lang } = await params
    const dict = await getDictionary(lang)
    return (
        <PageTransition>
            <Login dict={dict} />
        </PageTransition>

    )
}
export const dynamic = 'force-dynamic'