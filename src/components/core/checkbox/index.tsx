import type { ForwardRefExoticComponent, RefAttributes } from 'react'
import _Checkbox, { CheckboxProps } from './checkbox'


export type { CheckboxProps } from './checkbox'
export type { CheckboxGroupValue, CheckboxValue } from './context'

type CompoundedComponent = ForwardRefExoticComponent<
    CheckboxProps & RefAttributes<HTMLInputElement>
>

const Checkbox = _Checkbox as CompoundedComponent

export { Checkbox }

export default Checkbox
