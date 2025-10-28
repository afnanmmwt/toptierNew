import React from 'react'
import Layout from './layout'
import type { CommonProps } from '@src/@types/common'
// creater a main layout wrapper
export default function Main({ children }: CommonProps) {
    return (
        <Layout>{children}</Layout>
    )
}

