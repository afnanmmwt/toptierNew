declare module 'react-rating-stars-component' {
  import * as React from 'react';

  interface ReactStarsProps {
    count?: number;
    value?: number;
    onChange?: (newRating: number) => void;
    size?: number;
    isHalf?: boolean;
    edit?: boolean;
    activeColor?: string;
    color?: string;
    a11y?: boolean;
    emptyIcon?: React.ReactNode;
    halfIcon?: React.ReactNode;
    filledIcon?: React.ReactNode;
  }

  const ReactStars: React.FC<ReactStarsProps>;

  export default ReactStars;
}
