import React, { useState, useRef, useEffect } from 'react';
import Button, { ButtonProps } from './button';
import { Icon } from '@iconify/react';

// Use local DropdownButtonProps interface, omitting 'icon' and 'value' from ButtonProps
export interface DropdownButtonProps extends Omit<ButtonProps, 'icon' | 'value'> {
  icon: React.ReactNode | string;
  text: string;
  value?: string | React.ReactNode;
  curveIcon?: React.ReactNode | string;
  dropdownContent: React.ReactNode | ((close: () => void) => React.ReactNode);
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: 'bottom' | 'top' | 'left' | 'right';
}

const DropdownButton: React.FC<DropdownButtonProps> = ({
  icon,
  text,
  value,
  curveIcon = <Icon icon="material-symbols:keyboard-arrow-down-rounded" width={20} height={20} />, // default chevron
  dropdownContent,
  isOpen: controlledOpen,
  onOpenChange,
  placement = 'bottom',
  className = '',
  disabled = false,
  ...rest
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isControlled = controlledOpen !== undefined;
  const actualOpen = isControlled ? controlledOpen : open;

  useEffect(() => {
    if (!actualOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        if (!isControlled) setOpen(false);
        onOpenChange?.(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [actualOpen, isControlled, onOpenChange]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isControlled) setOpen((prev) => !prev);
    onOpenChange?.(!actualOpen);
  };

  const closeDropdown = () => {
    if (!isControlled) setOpen(false);
    onOpenChange?.(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={ref}>
      <Button
        type="button"
        variant="plain"
        className="flex items-center justify-between w-full gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg transition-all duration-200 cursor-pointer hover:bg-blue-50 hover:text-blue-500 hover:border-blue-200"
        onClick={handleToggle}
        disabled={disabled}
        {...rest}
      >
        <span className="flex items-center gap-2">
          {typeof icon === 'string' ? <Icon icon={icon} width={20} height={20} className="text-blue-500" /> : icon}
          <span>{text}</span>
          {value && <span className="ml-2 font-semibold text-gray-900">{value}</span>}
        </span>
        <span className="ml-2 flex items-center">
          {typeof curveIcon === 'string' ? <Icon icon={curveIcon} width={20} height={20} /> : curveIcon}
        </span>
      </Button>
      {actualOpen && (
        <div
          className={`absolute z-50 min-w-full mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-2 ${
            placement === 'bottom' ? 'left-0 top-full' : ''
          }`}
        >
          {typeof dropdownContent === 'function' ? dropdownContent(closeDropdown) : dropdownContent}
        </div>
      )}
    </div>
  );
};

export default DropdownButton;