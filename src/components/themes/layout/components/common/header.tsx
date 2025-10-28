import classNames from '@src/utils/classNames'
import { HEADER_HEIGHT } from '@src/constants/theme.constant'
import type { ReactNode } from 'react'
import type { CommonProps } from '@src/@types/common'

interface HeaderProps extends CommonProps {
    headerStart?: ReactNode
    headerEnd?: ReactNode
    headerMiddle?: ReactNode
    container?: boolean
    wrapperClass?: string
}

const Header = (props: HeaderProps) => {
    const {
        headerStart,
        headerEnd,
        headerMiddle,
        className,
        container,
        wrapperClass,
    } = props

    return (
        <header className={classNames('bg-white dark:bg-gray-800 py-1 flex sticky top-0 w-full shadow-md z-30 print:hidden', className)}>
            <div
                className={classNames(
                    'relative flex items-center justify-between w-full px-4 sm:px-6 ',
                    container && 'container mx-auto',
                    wrapperClass,
                )}
                style={{ height: HEADER_HEIGHT }}
            >
                <div className="flex items-center gap-2 header-action-start">
                    {headerStart}
                </div>
                {headerMiddle && (
                    <div className="flex items-center gap-2 header-action-middle">
                        {headerMiddle}
                    </div>
                )}
                <div className="flex items-center gap-2 header-action-end">
                    {headerEnd}
                </div>
            </div>
        </header>
    )
}

export default Header
