import React from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';

export interface ModulesMenuProps {
  modules: Record<string, any>;
  icons?: Record<string, string>;
  onModuleClick?: (key: string, value: any) => void;
  className?: string;
  dict?: any;
  isLoading?: boolean;
  as?: React.ElementType;
  renderModule?: (
    key: string,
    value: any,
    icon: string,
    onClick: () => void
  ) => React.ReactNode;
}

const ModulesMenu: React.FC<ModulesMenuProps> = ({
  modules,
  icons = {},
  onModuleClick,
  className = '',
  dict,
  isLoading = false,
  as: Component = 'div',
  renderModule,
}) => {
  // Defensive: Only render modules with status true
  const validModules = Object.entries(modules).filter(
    ([, value]) => Array.isArray(value) && value.length > 0 && value[0]?.status
  );

  return (
    <Component className={className}>
      {isLoading && <span>Loading...</span>}
      {!isLoading &&
        validModules.map(([key, value]) => {
          const icon = icons[key] || 'mdi:alert';
          const handleClick = () => {
            if (onModuleClick) onModuleClick(key, value);
          };
          if (renderModule) {
            return renderModule(key, value, icon, handleClick);
          }
          return (
            <Link
              key={key}
              href="/"
              className="group hover:bg-blue-50 flex items-center font-medium gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-50  dark:hover:bg-gray-700"
              onClick={handleClick}
            >
              <Icon icon={icon} width="24" height="24" className='text-blue-500'/>
              <span className='text-gray-600 group-hover:text-blue-500 dark:text-gray-200'>{dict?.header?.[key] || key.charAt(0).toUpperCase() + key.slice(1)}</span>
            </Link>
          );
        })}
    </Component>
  );
};

export default ModulesMenu;