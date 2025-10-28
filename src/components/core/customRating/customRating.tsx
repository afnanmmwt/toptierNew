// 'use client';

// import * as React from 'react';
// import { useState } from 'react';
// import Rating from 'react-rating';
// import   {Icon} from '@iconify/react';
// interface CustomRatingProps {
//   max?: number;
//   initialRating?: number;
//   emptySymbol?: string | string[] | JSX.Element | JSX.Element[];
//   fullSymbol?: string | string[] | JSX.Element | JSX.Element[];
//   readonly?: boolean;
//   onChange?: (value: number) => void;
//   fractions?: number;
//   resettable?: boolean;
//   className?: string;
//   id?: string;
// }


// const CustomRating: React.FC<CustomRatingProps> = ({
//   max = 5,
//   initialRating = 0,
//   emptySymbol = <Icon icon="mdi:star-outline" />,
//   fullSymbol = <Icon icon="mdi:star" />,
//   readonly = false,
//   onChange,
//   fractions = 1,
//   resettable = false,
//   className = '',
//   id,
// }) => {
//   const [rating, setRating] = useState<number | undefined>(initialRating);

//   const handleChange = (value: number) => {
//     setRating(value);
//     onChange?.(value);
//   };

//   const handleReset = () => {
//     setRating(undefined);
//     onChange?.(0); // Optional: notify parent of reset
//   };

//   return (
//     <div id={id} className={className}>
//       <Rating
//         stop={max}
//         initialRating={rating}
//         emptySymbol={emptySymbol}
//         fullSymbol={fullSymbol}
//         readonly={readonly}
//         onChange={handleChange}
//         fractions={fractions}
//       />
//       {resettable && (
//         <button onClick={handleReset} className="ml-2 text-sm text-blue-500 hover:underline">
//           Reset
//         </button>
//       )}
//     </div>
//   );
// };

// export default CustomRating;
