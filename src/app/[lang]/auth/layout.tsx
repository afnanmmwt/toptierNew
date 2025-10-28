import { getDictionary } from '@src/get-dictionary'
import React from 'react'
import { Layout } from '@components/themes/default/components/auth/layout'
import { GuestGuard } from '@lib/auth/guest-guard'
import { Main } from '@components/themes/layout'
import Shell from '@src/utils/shell'
export default async function AuthLayout({ params, children }: {
    params: Promise<{ lang: 'en' | 'ar' }>
    children?: React.ReactNode
}) {
    const { lang } = await params
    const dict = await getDictionary(lang)
    return (
        <GuestGuard>
            <Main>
                <Layout dict={dict}>
                    <Shell>
                        {children}
                    </Shell>
                </Layout>
            </Main>
        </GuestGuard>
    );
}
