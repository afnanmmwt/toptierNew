import { Icon } from '@iconify/react'
import classNames from 'classnames'
import type { ReactNode } from 'react'
import type { OptionProps as ReactSelectOptionProps } from 'react-select'

export type DefaultOptionProps<T> = {
    customLabel?: (data: T, label: string) => ReactNode
}

const Option = <T,>(
    props: ReactSelectOptionProps<T> & DefaultOptionProps<T>,
) => {
    const { innerProps, label, isSelected, isDisabled, data, customLabel } =
        props

    return (
        <div
            className={classNames(
                'flex items-center justify-between py-2.5 px-2 font-semibold cursor-default rounded-md',
                !isDisabled &&
                !isSelected &&
                'hover:text-gray-800 hover:dark:text-gray-100',
                isSelected && 'text-primary bg-primary-subtle',
                isDisabled && 'opacity-50 cursor-not-allowed',
            )}
            {...innerProps}
        >
            {customLabel ? (
                customLabel(data, label)
            ) : (
                <span className="ml-2">{label}</span>
            )}
            {isSelected && <Icon icon="material-symbols:check-small-rounded" width="24" height="24" />}
        </div>
    )
}

export default Option
