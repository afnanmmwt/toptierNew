import classNames from 'classnames'
import Modal from 'react-modal'
import { motion } from 'framer-motion'
import type ReactModal from 'react-modal'
import type { MouseEvent, ReactNode } from 'react'
import { Icon } from '@iconify/react'

export interface DrawerProps extends ReactModal.Props {
    bodyClass?: string
    closable?: boolean
    footer?: string | ReactNode
    footerClass?: string
    headerClass?: string
    height?: string | number
    lockScroll?: boolean
    onClose?: (e: MouseEvent<HTMLSpanElement>) => void
    placement?: 'top' | 'right' | 'bottom' | 'left'
    showBackdrop?: boolean
    title?: string | ReactNode
    width?: string | number
}

const Drawer = (props: DrawerProps) => {
    const {
        bodyOpenClassName,
        bodyClass,
        children,
        className,
        closable = true,
        closeTimeoutMS = 300,
        footer,
        footerClass,
        headerClass,
        height = 400,
        isOpen,
        lockScroll = true,
        onClose,
        overlayClassName,
        placement = 'right',
        portalClassName,
        showBackdrop = true,
        title,
        width = 400,
        ...rest
    } = props

    const onCloseClick = (e: MouseEvent<HTMLSpanElement>) => {
        onClose?.(e)
    }

    const renderCloseButton = <button type="button" onClick={onCloseClick}>
        <Icon icon="material-symbols:close-rounded" width="24" height="24" />
    </button>

    const getStyle = (): {
        dimensionClass?: string
        contentStyle?: {
            width?: string | number
            height?: string | number
        }
        motionStyle: {
            [x: string]: string
        }
    } => {
        if (placement === 'left' || placement === 'right') {
            return {
                dimensionClass: 'vertical h-full',
                contentStyle: { width },
                motionStyle: {
                    [placement]: `-${width}${typeof width === 'number' && 'px'
                        }`,
                },
            }
        }

        if (placement === 'top' || placement === 'bottom') {
            return {
                dimensionClass: 'horizontal w-full',
                contentStyle: { height },
                motionStyle: {
                    [placement]: `-${height}${typeof height === 'number' && 'px'
                        }`,
                },
            }
        }

        return {
            motionStyle: {},
        }
    }

    const { dimensionClass, contentStyle, motionStyle } = getStyle()

    return (
        <Modal
            className={{
                base: classNames('drawer', className as string),
                afterOpen: 'drawer-after-open',
                beforeClose: 'drawer-before-close',
            }}
            overlayClassName={{
                base: classNames(
                    'drawer-overlay bg-black/30 backdrop-blur-md backdrop-saturate-150 inset-0 fixed z-30',
                    overlayClassName as string,
                    !showBackdrop && 'bg-transparent',
                ),
                afterOpen: 'drawer-overlay-after-open',
                beforeClose: 'drawer-overlay-before-close',
            }}
            portalClassName={classNames('drawer-portal', portalClassName)}
            bodyOpenClassName={classNames(
                'drawer-open',
                lockScroll && 'drawer-lock-scroll overflow-hidden',
                bodyOpenClassName ? bodyOpenClassName : undefined
            )}
            ariaHideApp={false}
            isOpen={isOpen}
            closeTimeoutMS={closeTimeoutMS}
            {...rest}
        >
            <motion.div
                className={classNames('bg-white dark:bg-gray-800 shadow-xl absolute flex flex-col', dimensionClass)}
                style={contentStyle}
                initial={motionStyle}
                animate={{
                    [placement as 'top' | 'right' | 'bottom' | 'left']: isOpen
                        ? 0
                        : motionStyle[placement],
                }}
            >
                {title || closable ? (
                    <div className={classNames('drawer-header flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700', headerClass)}>
                        {typeof title === 'string' ? (
                            <h4>{title}</h4>
                        ) : (
                            <span>{title}</span>
                        )}
                        {closable && renderCloseButton}
                    </div>
                ) : null}
                <div className={classNames('drawer-body p-6 h-full overflow-y-auto', bodyClass)}>
                    {children}
                </div>
                {footer && (
                    <div className={classNames('drawer-footer flex items-center justify-between py-4 px-6 border-t border-gray-200 dark:border-gray-700', footerClass)}>
                        {footer}
                    </div>
                )}
            </motion.div>
        </Modal>
    )
}

Drawer.displayName = 'Drawer'

export default Drawer
