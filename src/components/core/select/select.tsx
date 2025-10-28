/* eslint-disable @typescript-eslint/no-unused-vars */
import cn from '@src/utils/classNames'
import ReactSelect from 'react-select'
import CreatableSelect from 'react-select/creatable'
import AsyncSelect from 'react-select/async'
import { useConfig } from '@lib/configProvider'
import { useForm, useFormItem } from '../form/context';
import DefaultOption from './option'
import Spinner from '@components/core/Spinner'
import { CONTROL_SIZES } from '@src/utils/constants'
import type { CommonProps, TypeAttributes } from '@src/@types/common'
import type {
    Props as ReactSelectProps,
    StylesConfig,
    ClassNamesConfig,
    GroupBase,
} from 'react-select'
import type { AsyncProps } from 'react-select/async'
import type { CreatableProps } from 'react-select/creatable'
import type { Ref, JSX } from 'react'
import { Icon } from '@iconify/react'

const DefaultDropdownIndicator = () => {
    return (
        <div className="select-dropdown-indicator">
            <Icon icon="material-symbols:arrow-drop-down-rounded" width="24" height="24" />
        </div>
    )
}

interface DefaultClearIndicatorProps {
    innerProps: JSX.IntrinsicElements['div']
    ref: Ref<HTMLElement>
}

const DefaultClearIndicator = ({
    innerProps: { ref, ...restInnerProps },
}: DefaultClearIndicatorProps) => {
    return (
        <div {...restInnerProps} ref={ref}>
            <div className="select-clear-indicator text-lg px-2 cursor-pointer">
                <Icon icon="material-symbols:close-small-rounded" width="24" height="24" />
            </div>
        </div>
    )
}

interface DefaultLoadingIndicatorProps {
    selectProps: { themeColor?: string }
}

const DefaultLoadingIndicator = ({
    selectProps,
}: DefaultLoadingIndicatorProps) => {
    const { themeColor } = selectProps
    return (
        <Spinner className={`select-loading-indicatior text-${themeColor}`} />
    )
}

export type SelectProps<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
> = CommonProps &
    ReactSelectProps<Option, IsMulti, Group> &
    AsyncProps<Option, IsMulti, Group> &
    CreatableProps<Option, IsMulti, Group> & {
        invalid?: boolean
        size?: TypeAttributes.ControlSize
        field?: any
        componentAs?: ReactSelect | CreatableSelect | AsyncSelect
        isSearchable?: boolean // <-- add this line
    }

function Select<
    Option,
    IsMulti extends boolean = false,
    Group extends GroupBase<Option> = GroupBase<Option>,
>(props: SelectProps<Option, IsMulti, Group>) {
    const {
        components,
        componentAs: Component = ReactSelect,
        size,
        styles,
        className,
        classNames,
        field,
        invalid,
        isSearchable = true, // <-- default to true
        ...rest
    } = props

    const { controlSize } = useConfig()
    const formControlSize = useForm()?.size
    const formItemInvalid = useFormItem()?.invalid


    const selectSize = (size ||

        formControlSize ||
        controlSize) as keyof typeof CONTROL_SIZES

    const isSelectInvalid = invalid || formItemInvalid

    const selectClass = cn(`select select-${selectSize}`, className)

    return (
        <Component<Option, IsMulti, Group>
            className={selectClass}
            classNames={
                {
                    control: (state) =>
                        cn(
                            'flex items-center justify-between border border-gray-300 dark:border-gray-700 rounded-xl transition duration-150',
                            CONTROL_SIZES[selectSize]?.minH,
                            state.isDisabled && 'opacity-50 cursor-not-allowed',
                            (() => {
                                const classes: string[] = [
                                    'bg-gray-100 dark:bg-gray-700',
                                ]

                                const { isFocused } = state

                                if (isFocused) {
                                    classes.push(
                                        'bg-transparent ring-1 ring-primary border-primary bg-transparent',
                                    )
                                }

                                if (isSelectInvalid) {
                                    classes.push(
                                        'bg-error-subtle',
                                    )
                                }

                                if (isFocused && isSelectInvalid) {
                                    classes.push('ring-error border-error')
                                }

                                return classes
                            })(),
                        ),
                    valueContainer: ({ isMulti, hasValue, selectProps }) =>
                        cn(
                            'items-center flex-1 flex-row relative overflow-hidden px-3 py-2 gap-y-2',
                            isMulti &&
                                hasValue &&
                                selectProps.controlShouldRenderValue
                                ? 'flex'
                                : 'grid',
                        ),
                    input: ({ value, isDisabled }) =>
                        cn(
                            'select-input-container inline-grid flex-auto text-gray-800 dark:text-gray-100 font-semibold',
                            isDisabled ? 'invisible' : 'visible',
                            value && '[transform:translateZ(0)]',
                        ),
                    placeholder: () =>
                        cn(
                            'select-placeholder font-semibold',
                            isSelectInvalid ? 'text-error' : 'text-gray-400',
                        ),
                    indicatorsContainer: () => 'px-3 text-2xl',
                    singleValue: () => 'select-single-value capitalize flex flex-row max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-gray-800 dark:text-gray-100 font-semibold',
                    multiValue: () => 'flex rounded-lg mx-0.5 font-bold border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-100',
                    multiValueLabel: () => 'text-xs ltr:pl-2 rtl:pr-2 py-1.5 flex items-center',
                    multiValueRemove: () => 'flex items-center ltr:pr-2 ltr:pl-1 rtl:pr-1 rtl:pl-2',
                    menu: () => 'bg-white dark:bg-gray-900 rounded-xl my-2 px-2 py-1 min-h-[50px] border ring-1 border-gray-100 ring-gray-100 dark:border-gray-700 dark:ring-gray-700 shadow-[0px_48px_64px_-16px_rgba(0,0,0,0.25)]',
                    ...classNames,
                } as ClassNamesConfig<Option, IsMulti, Group>
            }
            classNamePrefix={'select'}
            styles={
                {
                    control: () => ({}),
                    valueContainer: () => ({}),
                    input: ({
                        margin,
                        paddingTop,
                        paddingBottom,
                        ...provided
                    }) => ({ ...provided }),
                    placeholder: () => ({}),
                    singleValue: () => ({}),
                    multiValue: () => ({}),
                    multiValueLabel: () => ({}),
                    multiValueRemove: () => ({}),
                    menu: ({
                        backgroundColor,
                        marginTop,
                        marginBottom,
                        border,
                        borderRadius,
                        boxShadow,
                        ...provided
                    }) => ({ ...provided, zIndex: 50 }),
                    ...styles,
                } as StylesConfig<Option, IsMulti, Group>
            }
            components={{
                IndicatorSeparator: () => null,
                Option: DefaultOption,
                LoadingIndicator: DefaultLoadingIndicator,
                DropdownIndicator: DefaultDropdownIndicator,
                ClearIndicator: DefaultClearIndicator,
                ...components,
            }}
            isSearchable={isSearchable} // <-- pass prop
            {...field}
            {...rest}
        />
    )
}

export default Select
