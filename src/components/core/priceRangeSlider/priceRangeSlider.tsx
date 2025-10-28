
import useLocale from '@hooks/useLocale';
import React, { useRef, useEffect, ChangeEvent } from 'react';

interface PriceRangeSliderProps {
  min?: number;
  max?: number;
  values: [number, number];
  onChange: (index: number, value: number) => void;
}

export default function PriceRangeSlider({
  min = 0,
  max = 100000,
  values,
  onChange,
}: PriceRangeSliderProps) {
  const rangeRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();
  const isRTL = locale === 'ar';

  const [minVal, maxVal] = values;

  useEffect(() => {
    if (!rangeRef.current) return;

    const range = max - min;
    if (range <= 0) return;

    const minPercent = ((minVal - min) / range) * 100;
    const maxPercent = ((maxVal - min) / range) * 100;

    const start = isRTL ? 'right' : 'left';
    rangeRef.current.style[start] = `${minPercent}%`;
    rangeRef.current.style.width = `${maxPercent - minPercent}%`;
  }, [minVal, maxVal, min, max, isRTL]);

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMin = Number(e.target.value);
    if (newMin <= maxVal) {
      onChange(0, newMin);
    }
  };

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newMax = Number(e.target.value);
    if (newMax >= minVal) {
      onChange(1, newMax);
    }
  };

  return (
    <div className="pb-3">
      {/* Slider Track */}
      <div className="relative w-full h-6 mb-3 mx-auto">
        {/* Background track */}
        <div className="absolute top-2 w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full z-0" />

        {/* Fill bar */}
        <div
          ref={rangeRef}
          className="absolute top-2 h-1.5 bg-blue-900 rounded-full z-10"
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={handleMinChange}
          className="range-thumb z-10 absolute top-0 w-full h-6 cursor-pointer bg-transparent"
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={handleMaxChange}
          className="range-thumb z-10 absolute top-0 w-full h-6 cursor-pointer bg-transparent"
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        />
      </div>

      {/* Value Badges */}
      <div className="flex justify-between">
        <div className="bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-600 dark:text-blue-200 px-2 py-1 rounded-lg text-xs font-bold">
          ${minVal.toLocaleString()}
        </div>
        <div className="bg-blue-50 border border-blue-200 text-blue-800 dark:bg-blue-600 dark:text-blue-200 px-2 py-1 rounded-lg text-xs font-bold">
          ${maxVal.toLocaleString()}
        </div>
      </div>

      {/* Thumb styles */}
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
          height: 16px;
          width: 16px;
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
}
