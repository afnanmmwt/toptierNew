// ✅ Place this OUTSIDE your HotelSearchApp component (or in a separate file)

interface RatingSliderProps {
  value: number;
  onChange: (newValue: number) => void;
}

const  RatingSlider: React.FC<RatingSliderProps> = ({ value, onChange }) => {
//   const { locale } = useLocale(); // assuming you have this hook available
  const isRTL =  'ar';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
  };

  // Calculate fill percentage: 1 = 0%, 5 = 100%
  const percentage = ((value - 1) / 4) * 100;

  return (
    <div className="pb-3">
      {/* Slider Track */}
      <div className="relative w-full h-6 mb-3 mx-auto">
        {/* Background track */}
        <div className="absolute top-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full z-0" />

        {/* Fill bar */}
        <div
          className="absolute top-2 h-1.5 bg-blue-900 rounded-full z-10"
          style={{
            width: `${percentage}%`,
            direction: isRTL ? 'rtl' : 'ltr',
            right: isRTL ? 0 : 'auto',
            left: isRTL ? 'auto' : 0,
          }}
        />

        {/* Thumb (single) */}
        <input
          type="range"
          min={1}
          max={5}
          step={0.1}
          value={value}
          onChange={handleChange}
          className="range-thumb absolute top-0 w-full h-6 cursor-pointer bg-transparent"
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        />
      </div>

      {/* Value Badge */}
      <div className="text-center">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-600 dark:text-blue-200 px-3 py-1 rounded-lg text-xs font-bold inline-block">
          {value.toFixed(1)}+ Stars
        </div>
      </div>

      {/* 👇 COPY-PASTE THUMB STYLES FROM PRICE SLIDER */}
      <style jsx>{`
        input[type='range'] {
          -webkit-appearance: none;
          appearance: none;
        }
        input[type='range']::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #163c8c;
          border: 2px solid white;
          cursor: pointer;
          margin-top: -8px;
          position: relative;
          z-index: 50;
        }
        input[type='range']::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #163c8c;
          border: 2px solid white;
          cursor: pointer;
          position: relative;
          z-index: 50;
        }
      `}</style>
    </div>
  );
};
export default RatingSlider;

// ✅ Now you can use <RatingSlider /> inside your HotelSearchApp component
// Example usage:
// <RatingSlider value={filters.selectedRating} onChange={updateRatingFilter} />