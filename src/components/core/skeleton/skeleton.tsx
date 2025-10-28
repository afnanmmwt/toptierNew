// components/Skeleton.tsx
import React from 'react';

type SkeletonVariant = 'text' | 'circle' | 'rect' | 'avatar' | 'button' | 'card' | 'link';

type SkeletonProps = {
    variant?: SkeletonVariant;
    width?: string | number;
    height?: string | number;
    className?: string;
    count?: number; // Number of items to render (e.g., for list items)
    animated?: boolean;
};

export default function Skeleton({
    variant = 'rect',
    width,
    height,
    className = '',
    count = 1,
    animated = true,
}: SkeletonProps) {
   const baseClasses = animated
    ? 'skeleton-shimmer'
    : 'bg-gray-200 dark:bg-gray-700';

    const sizeStyle = {
        width: width || 'auto',
        height: height || 'auto',
    };

    const getShapeClasses = () => {
        switch (variant) {
            case 'circle':
                return 'rounded-full';
            case 'avatar':
                return 'rounded-full';
            case 'button':
                return 'rounded-full px-6 py-2';
            case 'card':
                return 'rounded-xl';
            case 'link':
                return 'rounded-md h-4';
            case 'text':
                return 'rounded h-4';
            default:
                return 'rounded-md';
        }
    };

    const renderSkeleton = () => (
        <span
            className={`
        ${baseClasses}
        ${getShapeClasses()}
        inline-block
        ${className}
      `}
            style={sizeStyle}
        />
    );

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <React.Fragment key={i}>{renderSkeleton()}</React.Fragment>
            ))}
        </>
    );
}