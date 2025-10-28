import classNames from 'classnames'
import { useConfig } from '@src/lib/configProvider'
import type { CommonProps } from '@src/@types/common'
import type { ReactNode, ComponentPropsWithRef, MouseEvent, Ref } from 'react'

type CardHeader = {
    content?: string | ReactNode
    className?: string
    bordered?: boolean
    extra?: string | ReactNode
}

type CardFooter = {
    content?: string | ReactNode
    className?: string
    bordered?: boolean
}

export interface CardProps
    extends CommonProps,
    Omit<ComponentPropsWithRef<'div'>, 'onClick'> {
    clickable?: boolean
    header?: CardHeader
    bodyClass?: string
    footer?: CardFooter
    bordered?: boolean
    ref?: Ref<HTMLDivElement>
    onClick?: (e: MouseEvent<HTMLDivElement>) => void
}

const defaultHeaderConfig: CardHeader = {
    bordered: true,
}

const defaultFooterConfig: CardHeader = {
    bordered: true,
}

const Card = (props: CardProps) => {
    const { ui } = useConfig()

    const {
        bodyClass,
        children,
        className,
        clickable = false,
        bordered = ui?.card?.cardBordered ?? true,
        header = {},
        footer = {},
        ref,
        onClick,
        ...rest
    } = props

    const headerProps = {
        ...defaultHeaderConfig,
        ...header,
    }

    const footerProps = {
        ...defaultFooterConfig,
        ...footer,
    }

    const cardClass = classNames(
        'bg-white dark:bg-gray-800 rounded-2xl ',
        className,
        bordered ? `border border-gray-200 dark:border-gray-800` : `shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.15)] dark:shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.15),inset_0_0_0_0.0625rem_rgba(254,254,254,.1)] border-b border-gray-200 dark:border-gray-600 dark:border-none`,
        clickable && 'cursor-pointer user-select-none',
    )

    const cardBodyClasss = classNames('p-5', bodyClass)
    const cardHeaderClass = classNames(
        'py-3 px-5',
        headerProps.bordered ? 'border-b border-gray-200 dark:border-gray-700 rounded-t-2xl' : null,
        headerProps.extra ? 'flex justify-between items-center' : null,
        headerProps.className,
    )
    const cardFooterClass = classNames(
        'rounded-bl-lg rounded-br-lg py-3 px-5',
        footerProps.bordered && `border-t border-gray-200 dark:border-gray-600`,
        footerProps.className,
    )

    const renderHeader = () => {
        if (typeof headerProps.content === 'string') {
            return <h4>{headerProps.content}</h4>
        }
        return <>{headerProps.content}</>
    }

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        onClick?.(e)
    }

    return (
        <div
            ref={ref}
            className={cardClass}
            role="presentation"
            onClick={handleClick}
            {...rest}
        >
            {headerProps.content && (
                <div className={cardHeaderClass}>
                    {renderHeader()}
                    {headerProps.extra && <span>{headerProps.extra}</span>}
                </div>
            )}
            <div className={cardBodyClasss}>{children}</div>
            {footerProps.content && (
                <div className={cardFooterClass}>{footerProps.content}</div>
            )}
        </div>
    )
}

export default Card
