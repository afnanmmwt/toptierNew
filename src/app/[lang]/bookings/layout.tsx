import { AuthGuard } from '@lib/auth/auth-guard'
import React from 'react'
import { DashboardLayout as Layout } from '@components/themes/layout'

function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthGuard>
            <Layout>
                {children}
            </Layout>
        </AuthGuard>
    )
}

export default DashboardLayout