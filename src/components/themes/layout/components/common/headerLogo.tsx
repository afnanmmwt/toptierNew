'use client'
import Logo from '@components/core/logo'
import { useAppSelector } from '@lib/redux/store'
// import Link from 'next/link'
import type { Mode } from '@src/@types/theme'
import classNames from 'classnames'

const HeaderLogo = ({ mode, className, imgClass }: { mode?: Mode; className?: string; imgClass?: string }) => {
    const defaultMode = useAppSelector((state) => state.root.mode)

    return (
        // <Link href={'/'}>
            <Logo
                imgClass={classNames('max-h-16', imgClass)}
                mode={mode || (defaultMode === 'light' || defaultMode === 'dark' ? defaultMode : undefined)}
                className={className}
            />

    )
}

export default HeaderLogo
