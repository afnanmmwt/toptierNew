import type { CommonProps } from '@src/@types/common'
import LayoutBase from '../layout/components/layoutBase'
import { LAYOUT_DEFAULT } from '@src/constants/theme.constant'
// import Header from '@components/themes/layout/components/common/header'
// import HeaderLogo from '@components/themes/layout/components/common/headerLogo'
import { HeaderMenus } from './components/header'
import { Footer } from '@components/themes/default'

type DefaultProps = CommonProps

const Default = ({ children }: DefaultProps) => {
    return (
        <LayoutBase
            type={LAYOUT_DEFAULT}
            className="h-full lg:grid lg:min-h-[100vh] lg:grid-rows-[auto_1fr_auto] w-full"
        >
              <HeaderMenus />

            {children}
            {/* footer  */}
            <Footer />

        </LayoutBase >
    )
}

export default Default
