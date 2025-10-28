'use client'
import { useState, useEffect } from 'react'
import classNames from 'classnames'
import { Spinner } from '../Spinner'
import type { CommonProps } from '@src/@types/common'
import type { ReactNode, ChangeEvent, Ref } from 'react'

export interface SwitcherProps extends CommonProps {
    checked?: boolean
    checkedContent?: string | ReactNode
    switcherClass?: string
    defaultChecked?: boolean
    disabled?: boolean
    isLoading?: boolean
    labelRef?: Ref<HTMLLabelElement>
    name?: string
    onChange?: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void
    readOnly?: boolean
    ref?: Ref<HTMLInputElement>
    unCheckedContent?: string | ReactNode
}

const Switcher = (props: SwitcherProps) => {
    const {
        checked,
        checkedContent,
        className,
        switcherClass,
        defaultChecked,
        disabled,
        isLoading = false,
        labelRef,
        name,
        onChange,
        readOnly,
        ref,
        unCheckedContent,
        ...rest
    } = props

    const [switcherChecked, setSwitcherChecked] = useState(
        defaultChecked || checked,
    )

    useEffect(() => {
        if (typeof checked !== 'undefined') {
            setSwitcherChecked(checked)
        }
    }, [checked])

    const getControlProps = () => {
        let checkedValue = switcherChecked

        let propChecked: {
            value?: string
            defaultChecked?: boolean
            checked?: boolean
        } = {
            value: `${checkedValue}`,
        }

        if (typeof checked === 'boolean') {
            checkedValue =
                typeof checked === 'boolean' ? checked : defaultChecked
            propChecked = { checked: checkedValue }
        }

        if (defaultChecked) {
            propChecked.defaultChecked = defaultChecked
        }
        return propChecked
    }

    const controlProps = getControlProps()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const nextChecked = !switcherChecked

        if (disabled || readOnly || isLoading) {
            return
        }

        if (typeof checked === 'undefined') {
            setSwitcherChecked(nextChecked)
            onChange?.(nextChecked, e)
        } else {
            onChange?.(!switcherChecked as boolean, e)
        }
    }

    const switcherColor = switcherClass || 'bg-primary dark:bg-primary'

    return (
        <label
            ref={labelRef}
            className={classNames(
                'inline-flex items-center relative rounded-3xl min-w-[2.75rem] h-6 bg-gray-200 dark:bg-gray-600 cursor-pointer transition-colors ease-in-out duration-200',
                (switcherChecked || controlProps.checked) && `${switcherColor}`,
                disabled && 'opacity-50 cursor-not-allowed select-none',
                className,
                switcherClass,
            )}
        >
            <input
                ref={ref}
                className='hidden'
                type="checkbox"
                disabled={disabled}
                readOnly={readOnly}
                name={name}
                onChange={handleChange}
                {...controlProps}
                {...rest}
            />
            {isLoading ? (
                <Spinner
                    className={classNames(
                        'absolute left-0.5 top-1/2 w-5 h-5 -translate-y-1/2 transition-all ease-in-out duration-200',
                        switcherChecked ? '!text-white' : 'dark:!text-white'
                    )}
                />
            ) : (
                <div
                    className={classNames(
                        'absolute transition-all ease-in-out duration-200 left-0.5 top-1/2 w-5 h-5 -translate-y-1/2 rounded-xl bg-white shadow',
                        (switcherChecked || controlProps.checked) && 'left-[calc(100%-1.25rem-0.125rem)]'
                    )}
                />
            )}
            <span className={classNames(
                'text-white transition-colors ease-in-out duration-200',
                switcherChecked ? 'ml-7 mr-2' : 'ml-2 mr-7'
            )}>
                {switcherChecked ? checkedContent : unCheckedContent}
            </span>
        </label>
    )
}

export default Switcher
