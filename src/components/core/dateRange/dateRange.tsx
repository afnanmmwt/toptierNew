'use client';
import { useState, useRef, useEffect } from 'react';
import { addDays, format } from 'date-fns';
import { DateRangePicker, Range, RangeKeyDict } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import useDirection from '@hooks/useDirection';

interface CustomDateRangePickerProps {
  onChange: (range: { startDate: Date; endDate: Date }) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export default function CustomDateRangePicker({
  onChange,
  initialStartDate = new Date(),
  initialEndDate = addDays(new Date(), 7),
}: CustomDateRangePickerProps) {
  const [state, setState] = useState<Range[]>([
    {
      startDate: initialStartDate,
      endDate: initialEndDate,
      key: 'selection',
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false); // Track if user is selecting end date
  const pickerRef = useRef<HTMLDivElement>(null);
  const [direction] = useDirection();
  const [isMdUp, setIsMdUp] = useState(false);

  useEffect(() => {
  const mq = window.matchMedia("(min-width: 768px)");
  const apply = () => setIsMdUp(mq.matches);
  apply(); // set initial
  mq.addEventListener("change", apply);
  return () => mq.removeEventListener("change", apply);
}, []);

  const handleSelect = (ranges: RangeKeyDict) => {
    const newRange = ranges.selection as Range;
    setState([newRange]);

    if (newRange.startDate && newRange.endDate) {
      onChange({
        startDate: newRange.startDate,
        endDate: newRange.endDate,
      });


      if (isSelectingEndDate) {
        setIsOpen(false);
        setIsSelectingEndDate(false);
      }
    }


    if (!isSelectingEndDate && newRange.startDate) {
      setIsSelectingEndDate(true);
    }
  };

  const togglePicker = () => setIsOpen(!isOpen);
  const closePicker = () => setIsOpen(false);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        closePicker();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedRange = state[0];
  const formattedRange =
    selectedRange.startDate && selectedRange.endDate
      ? `${format(selectedRange.startDate, 'yyyy-MM-dd')} | ${format(selectedRange.endDate, 'yyyy-MM-dd')}`
      : 'Select Date Range';

  return (
    <div className={`relative w-full`} ref={pickerRef} dir={direction}>
      <button
        type="button"
        onClick={togglePicker}
        className="w-full border flex items-center gap-2.5 border-gray-200 rounded-xl px-3 py-2 cursor-pointer text-start focus:outline-none hover:border-gray-300 transition-colors"
      >
        <span>
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M4.32942 0C4.47921 0 4.62287 0.0595061 4.7288 0.165428C4.83472 0.271349 4.89422 0.415009 4.89422 0.564805V1.1394C5.39276 1.12961 5.94175 1.12961 6.54571 1.12961H9.6431C10.2478 1.12961 10.7968 1.12961 11.2953 1.1394V0.564805C11.2953 0.415009 11.3549 0.271349 11.4608 0.165428C11.5667 0.0595061 11.7104 0 11.8602 0C12.0099 0 12.1536 0.0595061 12.2595 0.165428C12.3655 0.271349 12.425 0.415009 12.425 0.564805V1.1876C12.6208 1.20266 12.8063 1.22174 12.9815 1.24483C13.8641 1.36382 14.5787 1.61384 15.1428 2.17713C15.7061 2.74119 15.9561 3.45585 16.0751 4.33846C16.1903 5.19696 16.1903 6.29268 16.1903 7.67683V9.26732C16.1903 10.6515 16.1903 11.7479 16.0751 12.6057C15.9561 13.4883 15.7061 14.203 15.1428 14.767C14.5787 15.3303 13.8641 15.5803 12.9815 15.6993C12.123 15.8145 11.0273 15.8145 9.6431 15.8145H6.54722C5.16307 15.8145 4.0666 15.8145 3.20885 15.6993C2.32624 15.5803 1.61158 15.3303 1.04752 14.767C0.484226 14.203 0.234206 13.4883 0.11522 12.6057C0 11.7472 0 10.6515 0 9.26732V7.67683C0 6.29268 0 5.19621 0.11522 4.33846C0.234206 3.45585 0.484226 2.74119 1.04752 2.17713C1.61158 1.61384 2.32624 1.36382 3.20885 1.24483C3.38456 1.22174 3.57007 1.20266 3.76537 1.1876V0.564805C3.76537 0.41514 3.82477 0.271593 3.93053 0.165694C4.03629 0.0597937 4.17975 0.000199554 4.32942 0ZM3.35795 2.36465C2.60112 2.46631 2.16433 2.6576 1.84578 2.97615C1.52723 3.2947 1.33595 3.73148 1.23429 4.48832C1.21722 4.61634 1.20266 4.75164 1.19061 4.89422H14.999C14.9869 4.75164 14.9724 4.61609 14.9553 4.48756C14.8536 3.73073 14.6623 3.29394 14.3438 2.97539C14.0252 2.65684 13.5885 2.46556 12.8309 2.3639C12.0575 2.25997 11.037 2.25847 9.60093 2.25847H6.58864C5.15253 2.25847 4.13287 2.26073 3.35795 2.36465ZM1.12886 7.719C1.12886 7.07588 1.12886 6.51634 1.13865 6.02459H15.0509C15.0607 6.51634 15.0607 7.07588 15.0607 7.719V9.22515C15.0607 10.6613 15.0592 11.6817 14.9553 12.4558C14.8536 13.2127 14.6623 13.6495 14.3438 13.968C14.0252 14.2866 13.5885 14.4778 12.8309 14.5795C12.0575 14.6834 11.037 14.6849 9.60093 14.6849H6.58864C5.15253 14.6849 4.13287 14.6834 3.35795 14.5795C2.60112 14.4778 2.16433 14.2866 1.84578 13.968C1.52723 13.6495 1.33595 13.2127 1.23429 12.4551C1.13036 11.6817 1.12886 10.6613 1.12886 9.22515V7.719Z" fill="#8C96A5" />
          </svg>
        </span>
        <span>{formattedRange}</span>
      </button>

      {isOpen && (
       <div
  className={`absolute z-50 mt-2 bg-white rounded-xl shadow-lg overflow-hidden
    ${direction === "rtl" ? "right-0 rtl-date-picker" : "-left-6"}
    w-[calc(100vw-2rem)] md:w-auto`}
  dir={direction}
>
  <DateRangePicker
    onChange={handleSelect}
    ranges={state}
    months={2}                                // keep 2 months
    direction={isMdUp ? "horizontal" : "vertical"} // row on large, column on small
    showDateDisplay={false}
    showMonthAndYearPickers={true}
    rangeColors={["#1e3a8a"]}
    staticRanges={[]}
    inputRanges={[]}
    minDate={new Date()}
  />
</div>
      )}
    </div>
  );
}