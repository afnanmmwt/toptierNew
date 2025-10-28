import React, { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
// import { Icon } from "@iconify/react";
interface DatePickerProps {
    onSelect: (date: Date | undefined) => void;
    disabledDates?: Date[];
    direction?: "ltr" | "rtl";
    className?: string;
    showCalendarIcon?: boolean;
    defaultDate:Date | undefined
}
// Format date in UTC to prevent timezone issues
// const formatDate = (date: Date) => {
//     return new Intl.DateTimeFormat("en-GB", {
//         year: "numeric",
//         month: "2-digit",
//         day: "2-digit",
//         timeZone: "UTC",
//     }).format(date);
// };
const formatDate = (date: Date) => {
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
};
const DatePicker: React.FC<DatePickerProps> = ({
    onSelect,
    disabledDates = [],
    direction = "ltr",
    className = "",
    showCalendarIcon = true,
    defaultDate=""
}) => {
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    // const today = new Date();
    // const defaultDate = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
   const [selected, setSelected] = useState<Date | undefined>(
  defaultDate
    ? typeof defaultDate === "string"
      ? new Date(defaultDate) // convert string to Date
      : defaultDate
    : undefined
);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                popoverRef.current &&
                !popoverRef.current.contains(event.target as Node) &&
                inputRef.current &&
                !inputRef.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);
    return (
        <div className={`relative ${className}`} dir={direction}>
            <div className={`flex items-center gap-2 ${direction === "rtl" ? "justify-start pr-2" : "pl-2"}`}>
                {showCalendarIcon && (
                    <span
                        className={`z-10 text-gray-400 dark:text-gray-400 cursor-pointer ${direction === "rtl" ? "ml-2" : "mr-2"}`}
                        onClick={() => setOpen((v) => !v)}
                    >
                        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M4.35163 0.351807C4.50143 0.351807 4.64509 0.411313 4.75101 0.517234C4.85693 0.623156 4.91644 0.766816 4.91644 0.916612V1.49121C5.41497 1.48142 5.96396 1.48142 6.56793 1.48142H9.66532C10.27 1.48142 10.819 1.48142 11.3176 1.49121V0.916612C11.3176 0.766816 11.3771 0.623156 11.483 0.517234C11.5889 0.411313 11.7326 0.351807 11.8824 0.351807C12.0322 0.351807 12.1758 0.411313 12.2817 0.517234C12.3877 0.623156 12.4472 0.766816 12.4472 0.916612V1.5394C12.643 1.55446 12.8285 1.57354 13.0037 1.59664C13.8863 1.71562 14.601 1.96564 15.165 2.52894C15.7283 3.09299 15.9783 3.80766 16.0973 4.69026C16.2125 5.54877 16.2125 6.64449 16.2125 8.02864V9.61913C16.2125 11.0033 16.2125 12.0997 16.0973 12.9575C15.9783 13.8401 15.7283 14.5548 15.165 15.1188C14.601 15.6821 13.8863 15.9321 13.0037 16.0511C12.1452 16.1663 11.0495 16.1663 9.66532 16.1663H6.56944C5.18529 16.1663 4.08881 16.1663 3.23106 16.0511C2.34846 15.9321 1.63379 15.6821 1.06974 15.1188C0.506443 14.5548 0.256423 13.8401 0.137437 12.9575C0.0222168 12.099 0.0222168 11.0033 0.0222168 9.61913V8.02864C0.0222168 6.64449 0.0222168 5.54801 0.137437 4.69026C0.256423 3.80766 0.506443 3.09299 1.06974 2.52894C1.63379 1.96564 2.34846 1.71562 3.23106 1.59664C3.40678 1.57354 3.59229 1.55446 3.78758 1.5394V0.916612C3.78758 0.766946 3.84699 0.6234 3.95274 0.5175C4.0585 0.4116 4.20197 0.352006 4.35163 0.351807ZM3.38017 2.71646C2.62333 2.81812 2.18655 3.0094 1.868 3.32795C1.54945 3.6465 1.35817 4.08328 1.2565 4.84012C1.23943 4.96815 1.22487 5.10345 1.21283 5.24603H15.0212C15.0091 5.10345 14.9946 4.9679 14.9775 4.83937C14.8758 4.08253 14.6846 3.64575 14.366 3.3272C14.0475 3.00865 13.6107 2.81737 12.8531 2.7157C12.0797 2.61178 11.0593 2.61027 9.62315 2.61027H6.61085C5.17474 2.61027 4.15508 2.61253 3.38017 2.71646ZM1.15107 8.07081C1.15107 7.42768 1.15107 6.86815 1.16086 6.37639H15.0731C15.0829 6.86815 15.0829 7.42768 15.0829 8.07081V9.57695C15.0829 11.0131 15.0814 12.0335 14.9775 12.8076C14.8758 13.5645 14.6846 14.0013 14.366 14.3198C14.0475 14.6384 13.6107 14.8296 12.8531 14.9313C12.0797 15.0352 11.0593 15.0367 9.62315 15.0367H6.61085C5.17474 15.0367 4.15508 15.0352 3.38017 14.9313C2.62333 14.8296 2.18655 14.6384 1.868 14.3198C1.54945 14.0013 1.35817 13.5645 1.2565 12.8069C1.15258 12.0335 1.15107 11.0131 1.15107 9.57695V8.07081Z" fill="#8C96A5" />
                        </svg>
                    </span>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    readOnly
                    value={selected ? formatDate(selected) : ""}
                    onClick={() => setOpen((v) => !v)}
                    className={`datePicker w-full h-10 py-2 border-0 rounded-lg font-medium text-sm placeholder-gray-400 bg-transparent text-gray-800 dark:text-gray-50 focus:outline-none cursor-pointer ${direction === "rtl" ? "text-right" : "text-left"}`}
                    placeholder="Select date"
                />
            </div>
            {open && (
                <div
                    ref={popoverRef}
                    className={`absolute z-50 mt-2 ${direction === "rtl" ? "right-0" : "left-0"} bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-2`}
                    style={{ minWidth: 260 }}
                >
                    <DayPicker
                        mode="single"
                        selected={selected}
                        onSelect={(date) => {
                            if (date) {
                                // :white_check_mark: Normalize date to UTC to avoid local timezone offset
                                const normalized = new Date(
                                    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
                                );
                                setSelected(normalized);
                                onSelect(normalized);
                                setOpen(false);
                            }
                        }}
                        disabled={disabledDates}
                        // classNames={{
                        //     month_caption: 'text-gray-800 dark:text-gray-100 rdp-month_caption',
                        //     nav: 'rdp-nav text-gray-800 dark:text-gray-100',
                        //     chevron: 'fill-current',
                        //     day: " text-gray-900 dark:text-gray-100! rounded-full hover:bg-primary/20 dark:hover:bg-primary/40",
                        //     day_selected: "bg-primary text-white dark:bg-primary-dark",
                        //     day_disabled: "text-gray-300 dark:text-gray-600 cursor-not-allowed",
                        // }}
                        styles={{
                            caption: { direction },
                        }}
                    />
                </div>
            )}
        </div>
    );
};
export default DatePicker;