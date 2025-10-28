'use client';

import { Icon } from '@iconify/react';
import { useState, ReactNode } from 'react';

interface AccordionInfoCardProps {
  title: string;
  description?: string;
  children?: ReactNode; // Detailed content (can be JSX)
  leftIcon?: string;
  rightIcon?: string;
  showLeftIcon?: boolean;
  showDescription?: boolean;
  defaultOpen?: boolean;

  // Styling
  containerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  leftIconClassName?: string;
  rightIconClassName?: string;
  contentClassName?: string;

  // Icons
  iconSize?: number;
  iconColor?: string;
}

export const AccordionInfoCard = ({
  title,
  description = '',
  children,
  leftIcon = 'mdi:information',
  rightIcon = 'mdi:chevron-down',
  showLeftIcon = true,
  showDescription = true,
  defaultOpen = false,

  containerClassName = 'bg-white p-4 rounded-lg border border-gray-200 w-full',
  titleClassName = 'text-base font-medium text-gray-800',
  descriptionClassName = 'text-sm text-gray-600 mt-1',
  leftIconClassName = 'text-gray-600',
  rightIconClassName = 'text-gray-500  transition-transform',
  contentClassName = 'mt-3 pt-3 border-t border-gray-100 text-sm text-gray-700 w-full ',

  iconSize = 20,
  iconColor = '#6B7280',
}: AccordionInfoCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  
  const toggle = () => setIsOpen(!isOpen);

  

  return (
    <div className={containerClassName}>
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') toggle();
        }}
      >
        <div className="flex items-center gap-3 flex-1">
          {showLeftIcon && (
            <div className={`flex-shrink-0 ${leftIconClassName}`}>
              <Icon icon={leftIcon} width={iconSize} height={iconSize} color={iconColor} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className={titleClassName}>{title}</h3>
            {showDescription && description && (
              <p className={descriptionClassName}>{description}</p>
            )}
          </div>
        </div>

        <div
          className={`${rightIconClassName} '' ${isOpen ? 'rotate-180' : ''}`}
          style={{ transition: 'transform 0.2s ease' }}
        >
          <Icon icon={rightIcon} width={iconSize} height={iconSize} color={iconColor} />
        </div>
      </div>

      {/* Animated collapse/expand */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'opacity-100 max-h-full' : 'opacity-0 max-h-0'
        }`}
      >
        <div className={contentClassName}>
          {children || <p>No additional content.</p>}
        </div>
      </div>
    </div>
  );
};