import type { CommonProps } from '@src/@types/common'
import LayoutBase from '../layout/components/layoutBase'
import { LAYOUT_PRO } from '@src/constants/theme.constant'


type ClassicProps = CommonProps

const Classic = ({ children,  }: ClassicProps) => {
    return (
        <LayoutBase
            type={LAYOUT_PRO}
            className="flex flex-auto flex-col"
        >
            <div className="flex flex-auto min-w-0">
                <div className="h-full flex flex-auto flex-col">
                    Classic
                    {children}
                </div>
            </div>
        </LayoutBase >
    )
}

export default Classic
