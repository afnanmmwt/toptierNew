import classNames from '@src/utils/classNames'
import { Spinner } from '../Spinner'
import type { CommonProps, TypeAttributes } from '@src/@types/common'
import type {
    ReactNode,
    ComponentPropsWithRef,
    MouseEvent,
    ElementType,
} from 'react'

export interface ButtonProps
    extends CommonProps,
    Omit<ComponentPropsWithRef<'button'>, 'onClick'> {
    asElement?: ElementType
    active?: boolean
    block?: boolean
    customColorClass?: (state: {
        active: boolean
        unclickable: boolean
    }) => string
    disabled?: boolean
    icon?: string | ReactNode
    loading?: boolean
    onClick?: (e: MouseEvent<HTMLButtonElement>) => void
    ref?: React.Ref<HTMLButtonElement>
    shape?: TypeAttributes.Shape
    size?: TypeAttributes.Size
    variant?: 'solid' | 'plain' | 'default'
    iconAlignment?: 'start' | 'end'
}

const radiusShape = {
    round: 'rounded-xl',
    circle: 'rounded-full',
    none: 'rounded-none',
}

const Button = (props: ButtonProps) => {
    const {
        asElement: Component = 'button',
        active = false,
        block = false,
        children,
        className,
        customColorClass,
        disabled,
        icon,
        loading = false,
        ref,
        shape = 'round',
        size,
        variant = 'default',
        iconAlignment = 'start',
        ...rest
    } = props

    const unclickable = disabled || loading
    const defaultClass = 'button cursor-pointer transition-all duration-200 inline-flex items-center '
    const sizeIconClass = 'inline-flex items-center justify-center'

    const getButtonSize = () => {
        switch (size) {
            case 'lg':
                return classNames(
                    'h-11',
                    radiusShape[shape],
                    icon && !children
                        ? 'w-12 ' + sizeIconClass + ' text-2xl'
                        : 'px-8 py-2 text-base',
                )
            case 'sm':
                return classNames(
                    'h-8',
                    radiusShape[shape],
                    icon && !children
                        ? 'w-8 ' + sizeIconClass + ' text-lg'
                        : 'px-3 py-2 text-sm',
                )
            case 'xs':
                return classNames(
                    'h-6',
                    radiusShape[shape],
                    icon && !children
                        ? 'w-6 ' + sizeIconClass + ' text-base'
                        : 'px-3 py-1 text-xs',
                )
            default:
                return classNames(
                    'h-10',
                    radiusShape[shape],
                    icon && !children
                        ? 'w-10 ' + sizeIconClass + ' text-xl'
                        : 'px-5 py-2',
                )
        }
    }

    const disabledClass = 'opacity-50 cursor-not-allowed'

    const getBtnColor = () => {
        if (variant === 'solid') {
            return active
                ? 'bg-primary-deep text-neutral-100'
                : 'bg-primary text-neutral-100 hover:bg-primary-mild'
        }
        if (variant === 'plain') {
            return active
                ? ''
                : 'dark:bg-primary-mild dark:bg-opacity-20 hover:text-primary-mild dark:active:bg-opacity-40 '
        }
        // default
        return active
            ? 'bg-gray-100 border border-gray-300 dark:bg-gray-500 dark:border-gray-500 text-gray-600 dark:text-gray-100'
            : 'bg-white border border-gray-300 dark:bg-gray-700 dark:border-gray-700 text-gray-600 dark:text-gray-100 hover:border-primary dark:hover:border-gray-600 hover:text-primary dark:hover:text-white dark:hover:bg-transparent'


    }

    const classes = classNames(
        defaultClass,
        getBtnColor(),
        getButtonSize(),
        className,
        block ? 'w-full' : '',
        unclickable && disabledClass,
        customColorClass?.({
            active,
            unclickable,

        }),
    )

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
        if (unclickable) {
            e.preventDefault()
            return
        }
        props.onClick?.(e)
    }

    return (
        <Component
            ref={ref}
            className={classes}
            {...rest}
            onClick={handleClick}
        >
            {loading && <Spinner size={14}  className="mr-1" />}
            {icon && iconAlignment === 'start' && (
                <span className="text-lg me-1">{icon}</span>
            )}
            {children}
            {icon && iconAlignment === 'end' && (
                <span className="text-lg ml-1">{icon}</span>
            )}
        </Component>
    )
}

export default Button
