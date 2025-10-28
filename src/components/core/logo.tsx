'use client'
import classNames from 'classnames'
import type { CommonProps } from '@src/@types/common'
import { APP_NAME } from '@src/constants/app.constant'
// import { useAppSelector } from '@lib/redux/store'
import Image from 'next/image'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number | string
    style?: React.CSSProperties
    className?: string
}

const Logo = (props: LogoProps) => {
    const {
        // type = "full",
        // mode = 'light',
        className,
        imgClass,
        // style,
        // logoWidth = '100%',
    } = props
    // const app = useAppSelector((state) => state?.appData?.data?.app);
    const baseUrl = process.env.NEXT_PUBLIC_MEDIA_URL

    return (
        <div
            className={classNames('logo', className)}
        >
      <Image
  className={imgClass}
  src={`${baseUrl}/logo.png`} // ✅ fallback in case logo is missing
  alt={`${APP_NAME} logo`}
  width={120} // ⚡ required in Next.js
  height={120} // ⚡ required in Next.js
  priority // optional: loads faster
/>
        </div>
    )
}

export default Logo
