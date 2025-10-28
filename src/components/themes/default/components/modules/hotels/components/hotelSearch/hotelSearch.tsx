"use client"
import React, { useRef, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import DatePicker from "@components/core/DatePicker";
import useDictionary from "@hooks/useDict";
import useDirection from "@hooks/useDirection";

import { useParams, useRouter } from "next/navigation";

import useHotelSearch from "@hooks/useHotelSearch";
import Dropdown from "@components/core/Dropdown";
import useCountries from "@hooks/useCountries";
import { set } from "lodash";
import Select from "@components/core/select";
import { boolean } from "zod";
import CustomDateRangePicker from "@components/core/dateRange/dateRange";
import { addDays, format } from 'date-fns';
import useLocale from "@hooks/useLocale";
// import useHotelSearch from "@hooks/useHotelSearch"; // Import the hook

export default function HotelSearch() {
  const { lang } = useParams();
  const { data: dict, isLoading } = useDictionary(lang as any);
  const [direction] = useDirection();
  const { locale } = useLocale();
  const router = useRouter();
  const { countries } = useCountries()


  // Use the custom hook
  const {
    form,
    errors,
    hotelLocations,
    locationLoading,
    locationError,
    showDestinationDropdown,
    setShowDestinationDropdown,
    showGuestsDropdown,
    setShowGuestsDropdown,
    activeIndex,
    setActiveIndex,
    totalGuests,
    isSearching,
    handleChange,
    handleSelectLocation,
    handleDestinationKeyDown,
    updateForm,
    setIsSearching,
    handleSubmit,
  } = useHotelSearch();
  const guestsDropdownRef = useRef<HTMLDivElement>(null);
  const destinationDropdownRef = useRef<HTMLDivElement>(null);
  const destInputRef = useRef<HTMLInputElement | null>(null);
  const [isNationalityOpen, setIsNationalityOpen] = useState<boolean>(false)
  // Outside click handler for dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (guestsDropdownRef.current && !guestsDropdownRef.current.contains(e.target as Node)) {
        setShowGuestsDropdown(false);
      }
      if (destinationDropdownRef.current && !destinationDropdownRef.current.contains(e.target as Node)) {
        setShowDestinationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [setShowDestinationDropdown, setShowGuestsDropdown]);

  const onSubmit = async (e: React.FormEvent) => {
    handleSubmit(e)
  };






  const ErrorMessage = ({ error }: { error?: string }) =>
    error ? (
      <div className={`flex items-center gap-2 mt-1 w-full text-red-500 text-xs ${direction === "rtl" ? "text-right" : "text-left"}`}>
        <span className="w-3 h-3 flex items-center justify-center rounded-full bg-red-500 p-1 text-white">!</span>
        <span>{error}</span>
      </div>
    ) : null;

  const today = new Date();

  // format helper → yyyy-mm-dd
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  // default checkin = today
  const checkin = formatDate(
    new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()))
  );

  // default checkout = tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const checkout = formatDate(
    new Date(Date.UTC(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()))
  );


  // Format countries for react-select
  const nationalityOptions = countries?.map((c: any) => ({
    value: c.iso,
    label: c.nicename || c.name,
    iso: c.iso,
  })) || [];
  return (
    <div className="md:w-full mx-auto md:p-4 rounded-xl">
      <form onSubmit={onSubmit}>
        <div className="bg-white dark:bg-gray-800 dark:text-gray-50 w-full rounded-3xl shadow-lg p-6 space-y-6">
          {/* Destination */}
          <div className="relative" ref={destinationDropdownRef}>
            <label className="block text-sm text-start font-medium text-gray-500 dark:text-gray-300 mb-2">
              {/* {"where to? "}  */} {dict?.home_page?.hero_section?.where_to || "Where to?"}
            </label>
            <div className="relative">
              <div className={`absolute ${direction === "ltr" ? "left-3" : "right-2"} top-1/2 transform -translate-y-1/2 text-gray-400`}>
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8.19514 17.1038C8.04735 17.2098 7.86998 17.2667 7.68803 17.2667C7.50607 17.2667 7.3287 17.2098 7.18091 17.1038C2.80793 13.9933 -1.83309 7.59516 2.85865 2.97186C4.14667 1.70746 5.88127 0.999208 7.68803 1C9.49916 1 11.2369 1.7094 12.5174 2.97096C17.2091 7.59426 12.5681 13.9915 8.19514 17.1038Z" stroke="#5B697E" strokeOpacity="0.7" strokeWidth="1.35554" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7.68772 9.13333C8.16806 9.13333 8.62873 8.94291 8.96838 8.60396C9.30803 8.26501 9.49885 7.80529 9.49885 7.32594C9.49885 6.84659 9.30803 6.38688 8.96838 6.04793C8.62873 5.70898 8.16806 5.51855 7.68772 5.51855C7.20738 5.51855 6.74671 5.70898 6.40706 6.04793C6.0674 6.38688 5.87659 6.84659 5.87659 7.32594C5.87659 7.80529 6.0674 8.26501 6.40706 8.60396C6.74671 8.94291 7.20738 9.13333 7.68772 9.13333Z" stroke="#5B697E" strokeOpacity="0.7" strokeWidth="1.35554" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <input
                ref={destInputRef}
                type="text"
                name="destination"
                value={form.destination}
                onChange={handleChange}
                onFocus={() => {
                  if (form.destination.trim().length >= 3) setShowDestinationDropdown(true);
                }}
                autoComplete="off"
                onKeyDown={handleDestinationKeyDown}
                placeholder={dict?.home_page?.hero_section?.hotel_search_placeholder || "search city or hotel..."}
                className={`w-full ${direction === "ltr" ? "pl-9" : "pr-9"}  pr-4 py-3 text-sm font-medium dark:text-gray-200 placeholder-gray-700 focus:outline-none hover:bg-gray-100 hover:border-gray-300 border border-gray-200 rounded-xl text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200`}
              />

              {/* Dropdown */}
              {showDestinationDropdown && form.destination.trim().length >= 3 && (
                <div className="absolute z-50 w-full bg-white border dark:bg-gray-800 dark:text-gray-100 border-gray-200 dark:border-gray-600 rounded-xl shadow-lg mt-1 max-h-60 overflow-y-auto">

                  {/* Loading */}
                  {locationLoading ? (
                    <div className="bg-white flex items-center justify-center min-h-24 gap-2 p-3 text-sm text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                      <span>{dict?.hotel_search?.searching}</span>
                    </div>
                  ) : (
                    <>
                      {/* Error */}
                      {locationError ? (
                        <div className="flex bg-white items-center justify-center gap-2 p-4 min-h-25 text-sm text-gray-500">
                          <Icon icon="mdi:map-marker-off-outline" width={18} height={18} />
                          <span>{locationError}</span>
                        </div>
                      ) : hotelLocations.length > 0 ? (
                        /* Results */
                        <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-700">
                          {hotelLocations.map((loc: any, idx: number) => (
                            <li
                              key={loc.id ?? `${loc.city}-${idx}`}
                              onClick={() => handleSelectLocation(loc)}
                              onMouseEnter={() => setActiveIndex(idx)}
                              className={`px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition flex justify-between items-center ${activeIndex === idx ? "bg-gray-100 dark:bg-gray-700" : ""
                                }`}
                            >
                              <div>
                                <div className="font-bold text-sm text-start text-gray-900 dark:text-gray-50">
                                  {loc.city}
                                </div>
                                <div className="text-xs text-start text-gray-500 dark:text-gray-300">
                                  {loc.country}
                                </div>
                              </div>
                              <div className="text-xs text-gray-400">{loc.country_code}</div>
                            </li>
                          ))}
                        </ul>
                      ) : null
                        //  (
                        //   /* No results */
                        //   // <div className="flex bg-white items-center justify-center gap-2 p-4 min-h-25 text-sm text-gray-500">
                        //   //   {/* <Icon icon="mdi:map-marker-off-outline" width={18} height={18} />
                        //   //   <span>No Hotel Destination Found</span> */}
                        //   // </div>
                        // )
                      }
                    </>
                  )}
                </div>
              )}

            </div>
            <ErrorMessage error={errors.destination} />
          </div>

          {/* Dates & Guests row */}
          <div className="grid grid-cols-1 lg:grid-cols-4 lg:gap-4 lg:gap-y-0 gap-y-4">
            {/* Date Range Picker */}
            <div className="sm:col-span-2 lg:col-span-2 ">
              <label className="block text-sm text-start font-medium text-gray-500 dark:text-gray-300 mb-2">
                {dict?.home_page?.hero_section?.check_in || "Check in"} {"|"} {dict?.home_page?.hero_section?.check_out || "Check out"}
              </label>
              <CustomDateRangePicker

                initialStartDate={
                  form.checkin
                    ? new Date(form.checkin)
                    : new Date()
                }
                initialEndDate={
                  form.checkout
                    ? new Date(form.checkout)
                    : addDays(new Date(), 1)
                }
                onChange={(range) => {

                  //  safely extract the selection from the date range picker
                  const { startDate, endDate } = range || range;

                  if (startDate && endDate) {
                    //  format using date-fns (avoids timezone shift from toISOString)
                    const checkin = format(startDate, "yyyy-MM-dd");
                    const checkout = format(endDate, "yyyy-MM-dd");
                    //  update your form or state
                    updateForm({ checkin, checkout });

                  }
                }}
              />
              <div className="flex space-x-2 mt-1">
                <ErrorMessage error={errors.checkin} />
                <ErrorMessage error={errors.checkout} />
              </div>
            </div>
            {/* Date Range Picker */}

            {/* Guests */}
            <div className="relative" ref={guestsDropdownRef}>
              <label className="block text-sm text-start font-medium text-gray-500 mb-2 dark:text-gray-300">
                {/* {isLoading ? "Loading..." : dict?.hotel_search?.guest_button?.title} */}
                {dict?.home_page?.hero_section?.guests || "Guests"}
              </label>
              <button
                type="button"
                onClick={() => setShowGuestsDropdown((s) => !s)}
                className={`w-full flex items-center justify-between ${direction === "ltr" ? "pl-10 pr-4" : "pr-12 pl-4"} py-2.5 text-xs hover:bg-gray-100 hover:border-gray-300 border border-gray-200 rounded-xl text-gray-900 dark:bg-gray-800 dark:border-gray-600 cursor-pointer dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200`}
              >
                {/* Person Icon on RIGHT side in RTL */}
                <div className={`absolute ${direction === "rtl" ? "right-3" : "left-4"} bottom-1 transform -translate-y-1/2 text-gray-400`}>
                  <svg width="19" height="19" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.01698 6.91855C8.65463 6.91855 9.98221 5.59097 9.98221 3.95332C9.98221 2.31568 8.65463 0.988098 7.01698 0.988098C5.37933 0.988098 4.05176 2.31568 4.05176 3.95332C4.05176 5.59097 5.37933 6.91855 7.01698 6.91855Z" stroke="#8C96A5" strokeWidth="1.11196" />
                    <path d="M12.9476 12.4783C12.9476 14.3205 12.9476 15.8142 7.01712 15.8142C1.08667 15.8142 1.08667 14.3205 1.08667 12.4783C1.08667 10.6362 3.74203 9.14246 7.01712 9.14246C10.2922 9.14246 12.9476 10.6362 12.9476 12.4783Z" stroke="#8C96A5" strokeWidth="1.11196" />
                  </svg>
                </div>

                {/* Compact Text — Smaller & Single Line */}
                <span className={`font-medium ${direction === "rtl" ? "-mr-2" : "ml-0"} whitespace-nowrap overflow-hidden text-ellipsis text-[13px]`}>
                  {totalGuests} {dict?.hotel_search?.guest_button?.guest_title}, {form.rooms} {dict?.hotel_search?.guest_button?.room_title}
                </span>
                <Icon icon="mdi:chevron-down" width={20} height={20} className={`text-gray-600 transition-transform duration-200 ${showGuestsDropdown ? "rotate-180" : ""}`} />
              </button>
             
              {showGuestsDropdown && (
                <div className="absolute z-20 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg mt-1 md:min-w-[350px] max-h-auto overflow-visible">
                  <div className="p-4 space-y-4">
                    {/* Rooms */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        {dict?.home_page?.hero_section?.rooms || "Rooms"}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateForm({ rooms: Math.max(1, form.rooms - 1) })}
                          className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-blue-900 dark:text-blue-300 min-w-[1.25rem] text-center font-medium">
                          {form.rooms}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateForm({ rooms: form.rooms + 1 })}
                          className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors "
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {/* Adults */}
                    <div className="flex items-center justify-between px-1">
                      <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                        {dict?.home_page?.hero_section?.adults || "Adults"}
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => updateForm({ adults: Math.max(1, form.adults - 1) })}
                          className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          -
                        </button>
                        <span className="text-blue-900 dark:text-blue-300 min-w-[1.25rem] text-center font-medium">
                          {form.adults}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateForm({ adults: form.adults + 1 })}
                          className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="flex flex-col ">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                          {dict?.home_page?.hero_section?.children || "Children"}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updateForm({ children: Math.max(0, form.children - 1) })}
                            className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-blue-900 dark:text-blue-300 min-w-[1.25rem] text-center font-medium">
                            {form.children}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateForm({ children: form.children + 1 })}
                            className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          >
                            +
                          </button>
                        </div>


                      </div>
                      {/* Child Ages */}

                      {form.children > 0 && (
                        <div className="mt-4 px-1">
                          <div className="grid grid-cols-1 sm:grid-cols-2  gap-3 mt-2">
                            {Array.from({ length: form.children }, (_, index) => {
                              const currentAge = form.children_ages?.[index] ?? 0;
                              return (
                                <div key={index} className="flex flex-col">
                                  <label className="text-xs text-start font-medium text-gray-700 mb-1">
                                    {dict?.hotel_search?.child_age_label} {index + 1}
                                  </label>
                                  <Dropdown
                                    label={
                                      <span className="block text-left w-full   px-1 py-2 text-sm text-gray-700">
                                        {currentAge || 1} {dict?.home_page?.hero_section?.years || "years"}
                                      </span>
                                    }
                                    buttonClassName="w-full text-left border flex  justify-between items-center border-gray-200 rounded-xl px-2.5 py-2 text-sm focus:outline-none hover:bg-gray-50"
                                    dropDirection="down"
                                  >
                                    {({ onClose }) => (
                                      <div className="max-h-48 overflow-y-auto p-1 ">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map((age) => (  // starts from 1 now
                                          <button
                                            key={age}
                                            type="button"
                                            onClick={() => {
                                              const newAges =
                                                Array.isArray(form.children_ages) && form.children_ages.length > 0
                                                  ? [...form.children_ages]
                                                  : [1];

                                              newAges[index] = age;
                                              updateForm({ children_ages: newAges });
                                              onClose();
                                            }}
                                            className={`w-full text-left cursor-pointer px-3 py-3 mb-1 text-sm rounded-lg ${currentAge === age
                                              ? 'bg-gray-200 text-gray-700 font-medium'
                                              : 'text-gray-700 hover:bg-gray-100'
                                              }`}
                                          >
                                            {age} {dict?.home_page?.hero_section?.years || "years"}
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </Dropdown>

                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* ============ NATIONALITY ============ */}

                    {/* Nationality */}
                    <div className="w-full lg:col-span-4 md:col-span-6 col-span-12">
                      <div className="relative">
                        <label className="block text-sm text-start font-medium text-gray-500 dark:text-gray-300 mb-2">
                          {dict?.hotel_search?.nationality_label}
                        </label>

                        {countries && (
                          <Select
                            options={countries.map((c: any) => ({
                              value: c.iso,
                              label: c.nicename || c.name,
                              iso: c.iso,
                            }))}
                            value={countries
                              .map((c: any) => ({ value: c.iso, label: c.nicename, iso: c.iso }))
                              .find((opt: any) => opt.value === form.nationality) || null}
                            onChange={(option: any) => {
                              updateForm({ nationality: option?.value || '' });
                            }}
                            isSearchable
                            placeholder="Select Nationality"
                            className="w-full cursor-pointer"
                            onMenuOpen={() => setIsNationalityOpen(true)}
                            onMenuClose={() => setIsNationalityOpen(false)}
                            classNames={{
                              control: () =>
                                'w-full font-medium pl-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-none',
                              valueContainer: () => 'flex items-center gap-2 px-1',
                              singleValue: () => 'flex items-center gap-2',
                              placeholder: () => 'text-gray-400',
                              indicatorsContainer: () => direction === "rtl" ? 'absolute left-4 top-3' : 'absolute right-4 top-3',
                            }}
                            components={{
                              Option: ({ data, ...props }) => (
                                <div
                                  {...props.innerProps}
                                  className="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
                                >
                                  <Icon icon={`flagpack:${data.iso?.toLowerCase()}`} width="20" height="15" />
                                  <span>{data.label}</span>
                                </div>
                              ),
                              SingleValue: ({ data }) => (
                                <div className="flex items-center gap-2">
                                  <Icon icon={`flagpack:${data.iso?.toLowerCase()}`} width="20" height="15" />
                                  <span>{data.label}</span>
                                </div>
                              ),
                              DropdownIndicator: () => (
                                <Icon
                                  icon="mdi:keyboard-arrow-down"
                                  width="20"
                                  height="20"
                                  className={`text-gray-600 transi duration-100 ease-in-out ${isNationalityOpen ? 'rotate-180' : "rotate-0"}`}
                                />
                              ),
                              IndicatorSeparator: () => null,
                            }}
                          />
                        )}
                      </div>
                    </div>


                  </div>
                </div>
              )}

            </div>

            {/* Search button */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="mt-3 md:mt-7" />
              <button
                type="submit"
                
                className="w-full bg-blue-900 py-2 px-6 cursor-pointer font-medium flex items-center hover:bg-gray-800 border border-gray-200 rounded-xl text-white dark:border-gray-600 dark:hover:bg-gray-700 justify-center gap-2 focus:outline-none transition-all duration-200"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span className="text-white">{dict?.hotel_search?.searching}</span>
                  </>
                ) : (
                  <>
                    <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.7761 13.5548L15.635 16.4137M14.7318 8.524C14.7318 10.3703 13.9984 12.141 12.6929 13.4465C11.3873 14.7521 9.61664 15.4855 7.77033 15.4855C5.92403 15.4855 4.15335 14.7521 2.84781 13.4465C1.54228 12.141 0.808838 10.3703 0.808838 8.524C0.808838 6.67769 1.54228 4.90701 2.84781 3.60148C4.15335 2.29594 5.92403 1.5625 7.77033 1.5625C9.61664 1.5625 11.3873 2.29594 12.6929 3.60148C13.9984 4.90701 14.7318 6.67769 14.7318 8.524Z" stroke="white" strokeWidth="1.3923" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="hidden md:block text-white dark:text-gray-50 font-normal">
                      {/* {isLoading ? "Loading..." : dict?.hotel_search?.search_btnText} */}
                      {dict?.home_page?.hero_section?.search_hotels || "Search Hotels"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}