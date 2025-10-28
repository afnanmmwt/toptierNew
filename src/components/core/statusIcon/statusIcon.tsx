
import type { TypeAttributes, CommonProps } from '@src/@types/common'
import type { ReactNode, JSX } from 'react'
import { Icon } from '@iconify/react'

export interface StatusIconProps extends CommonProps {
    type: TypeAttributes.Status
    custom?: ReactNode | JSX.Element
    iconColor?: string
}

const ICONS: Record<
    TypeAttributes.Status,
    {
        color: string
        icon: JSX.Element
    }
> = {
    success: {
        color: 'text-success',
        icon: <Icon icon="material-symbols:check-circle-outline-rounded" width="18" height="18" />,
    },
    info: {
        color: 'text-info',
        icon: <Icon icon="material-symbols:info-outline" width="18" height="18" />,
    },
    warning: {
        color: 'text-warning',
        icon: <Icon icon="material-symbols:exclamation-rounded" width="18" height="18" />,
    },
    danger: {
        color: 'text-error',
        icon: <Icon icon="solar:close-circle-linear" width="18" height="18" />,
    },
}

const StatusIcon = (props: StatusIconProps) => {
    const { type = 'info', custom, iconColor } = props

    const icon = ICONS[type]

    return (
        <span className={`text-2xl ${iconColor || icon.color}`}>
            {custom || icon.icon}
        </span>
    )
}

export default StatusIcon
