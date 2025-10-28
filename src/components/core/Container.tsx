import classNames from 'classnames'
import { CommonProps } from '@src/@types/common'
import type { ElementType, Ref } from 'react'

interface ContainerProps extends CommonProps {
    asElement?: ElementType
    ref?: Ref<HTMLElement>
}

const Container = (props: ContainerProps) => {
    const {
        className,
        children,
        asElement: Component = 'div',
        ref,
        ...rest
    } = props

    return (
        <Component
            ref={ref}
            className={classNames('container mx-auto max-w-[1200px] px-4', className)}
            {...rest}
        >
            {children}
        </Component>
    )
}

export default Container
