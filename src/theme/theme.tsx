'use client'
import ConfigProvider from '@lib/configProvider'
import { themeConfig } from '@src/theme/theme.config'
import useDarkMode from '@hooks/useDarkMode'
import useLocale from '@hooks/useLocale'
import useDirection from '@hooks/useDirection'
import type { CommonProps } from '@src/@types/common'
import useCurrency from '@hooks/useCurrency'
import useCountries from '@hooks/useCountries'

const Theme = (props: CommonProps) => {
    useDarkMode();
    useDirection();
    useCurrency();
    useCountries();
    const { locale } = useLocale();
    return (
        <ConfigProvider
            value={{
                locale: locale,
                ...themeConfig,
            }}
        >
            {props.children}
        </ConfigProvider>
    )
}

export default Theme
