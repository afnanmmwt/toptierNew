'use client';

import DatePicker from "@components/core/DatePicker";
import useDirection from "@hooks/useDirection";
import { Icon } from "@iconify/react";
import { HotelForm } from "@hooks/useHotelDetails";
import Dropdown from "@components/core/Dropdown";
import useCountries from "@hooks/useCountries";
import Select from "@components/core/select";
import { useState } from "react";
import CustomDateRangePicker from "@components/core/dateRange/dateRange";
import { addDays, format } from 'date-fns';
import useLocale from "@hooks/useLocale";
import useDictionary from "@hooks/useDict";


interface HotelDetailsSearchProps {
  form: HotelForm;
  errors: Record<string, string>;
  showGuestsDropdown: boolean;
  isSearching: boolean;
  totalGuests: number;
  guestsDropdownRef: React.RefObject<HTMLDivElement | null>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  updateForm: (updates: Partial<HotelForm>) => void;
  toggleGuestsDropdown: () => void;
  onSubmit: (e?: React.FormEvent) => void;
}

export default function HotelDetailsSearch({
  form,
  errors,
  showGuestsDropdown,
  isSearching,
  totalGuests,
  guestsDropdownRef,
  updateForm,
  toggleGuestsDropdown,
  onSubmit,
}: HotelDetailsSearchProps) {
  const [direction] = useDirection();
  const { countries } = useCountries();
  const [isNationalityOpen, setIsNationalityOpen] = useState<boolean>(false)

  const selectedCountryName = countries?.find(
    (c: any) => c.iso === form.nationality
  )?.nicename || "Pakistan";

  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);

  const ErrorMessage = ({ error }: { error?: string }) =>
    error ? (
      <div className={`flex items-center gap-2 mt-1 w-full text-red-500 text-xs ${direction === "rtl" ? "text-right" : "text-left"}`}>
        <span className="w-3 h-3 flex items-center justify-center rounded-full bg-red-500 p-1 text-white">!</span>
        <span>{error}</span>
      </div>
    ) : null;

  return (
    <form onSubmit={onSubmit}>
      <div className="bg-white appHorizantalSpacing dark:bg-gray-800 rounded-3xl space-y-4 md:space-y-0 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-12 gap-4">
          <div className="w-full lg:col-span-5 col-span-12">
            <label className="block text-sm text-start font-medium text-gray-500 dark:text-gray-300 mb-2">
              {dict?.hotel_search?.check_in_out_label}
            </label>
            <CustomDateRangePicker
              initialStartDate={form.checkin ? new Date(form.checkin) : new Date()}
              initialEndDate={form.checkout ? new Date(form.checkout) : addDays(new Date(), 1)}
              onChange={(range) => {
                const { startDate, endDate } = range || {};
                if (startDate && endDate) {
                  const checkin = format(startDate, "yyyy-MM-dd");
                  const checkout = format(endDate, "yyyy-MM-dd");
                  updateForm({ checkin, checkout });
                }
              }}
            />
            <div className="flex space-x-2 mt-1">
              <ErrorMessage error={errors.checkin} />
              <ErrorMessage error={errors.checkout} />
            </div>
          </div>

          <div className="lg:col-span-7 col-span-12">
            <div className="grid grid-cols-12 gap-4">
              {/* Guests Dropdown */}
              <div className="w-full lg:col-span-4 md:col-span-6 col-span-12">
                <div className="flex flex-col">
                  <div className="relative" ref={guestsDropdownRef}>
                    <label className="block text-sm text-start font-medium text-gray-500 mb-2 dark:text-gray-300">
                      {dict?.hotel_search?.guest_button?.title}
                    </label>
                    <button
                      type="button"
                      onClick={toggleGuestsDropdown}
                      className={`w-full flex items-center justify-between ${direction === "rtl" ? "pr-11 pl-4" : "pl-11 pr-4"} py-2.5 text-xs hover:bg-gray-100 hover:border-gray-300 border border-gray-200 rounded-xl text-gray-900 dark:bg-gray-800 dark:border-gray-600 cursor-pointer dark:hover:bg-gray-700 dark:hover:border-gray-500 transition-all duration-200`}
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

                      {/* Chevron Down */}
                      <Icon
                        icon="mdi:chevron-down"
                        width={20}
                        height={20}
                        className={`text-gray-600 transition-transform duration-200 ${showGuestsDropdown ? "rotate-180" : ""} ${direction === "rtl" ? "-ml-3" : "mr-0"}`}
                      />
                    </button>

                    {showGuestsDropdown && (
                      <div className="absolute z-20 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg mt-1 md:min-w-[350px] max-h-auto overflow-visible">
                        <div className="p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                              {dict?.hotel_search?.rooms_label}
                            </span>
                            <div className="flex items-center gap-3">
                              <button type="button" onClick={() => updateForm({ rooms: Math.max(1, form.rooms - 1) })} className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">-</button>
                              <span className="text-blue-900 dark:text-blue-300 min-w-[1.25rem] text-center font-medium">{form.rooms}</span>
                              <button type="button" onClick={() => updateForm({ rooms: form.rooms + 1 })} className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">+</button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                              {dict?.hotel_search?.adults_label}
                            </span>
                            <div className="flex items-center gap-3">
                              <button type="button" onClick={() => updateForm({ adults: Math.max(1, form.adults - 1) })} className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">-</button>
                              <span className="text-blue-900 dark:text-blue-300 min-w-[1.25rem] text-center font-medium">{form.adults}</span>
                              <button type="button" onClick={() => updateForm({ adults: form.adults + 1 })} className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">+</button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                              {dict?.hotel_search?.children_label}
                            </span>
                            <div className="flex items-center gap-3">
                              <button type="button" onClick={() => updateForm({ children: Math.max(0, form.children - 1) })} className="w-8 h-8 cursor-pointer flex items-center justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">-</button>
                              <span className="text-blue-900 dark:text-blue-300 min-w-[1.25rem] text-center font-medium">{form.children}</span>
                              <button type="button" onClick={() => updateForm({ children: form.children + 1 })} className="w-8 h-8 flex items-center cursor-pointer justify-center rounded-full border dark:border-gray-600 text-blue-900 dark:text-blue-300 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">+</button>
                            </div>
                          </div>
                        </div>

                        {form.children > 0 && (
                          <div className="px-4 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                              {Array.from({ length: form.children }, (_, index) => {
                                const currentAge = form.children_ages?.[index] ?? 0;
                                return (
                                  <div key={index} className="flex flex-col">
                                    <label className="text-xs text-start ps-1 font-medium text-gray-700 mb-1">
                                      {dict?.hotel_search?.child_age_label} {index + 1}
                                    </label>
                                    <Dropdown
                                      label={
                                        <span className={`block w-full px-1 py-2 text-sm text-gray-700 ${direction === "rtl" ? "text-right" : "text-left"}`}>
                                          {currentAge || 1} {dict?.hotel_search?.years_label}
                                        </span>
                                      }
                                      buttonClassName={`w-full flex justify-between items-center border border-gray-200 rounded-xl px-2.5 py-2 text-sm focus:outline-none hover:bg-gray-50 ${direction === "rtl" ? "text-right" : "text-left"}`}
                                      dropDirection="down"
                                    >
                                      {({ onClose }) => (
                                        <div className="max-h-48 overflow-y-auto p-1">
                                          {Array.from({ length: 12 }, (_, i) => i + 1).map((age) => (
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
                                              className={`w-full px-3 py-3 cursor-pointer text-sm rounded-lg ${currentAge === age
                                                ? 'bg-gray-200 text-gray-700 font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                } ${direction === "rtl" ? "text-right" : "text-left"}`}
                                            >
                                              {age} {dict?.hotel_search?.years_label}
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
                    )}
                  </div>
                </div>
              </div>

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

              {/* Search Button */}
              <div className="w-full lg:col-span-4 col-span-12">
                <div className="flex flex-col gap-1">
                  <label htmlFor="" className="text-transparent lg:block hidden">1234567</label>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="w-full lg:mt-0 mt-2 bg-blue-900 py-2 px-4 md:px-6 cursor-pointer font-medium flex items-center justify-center hover:bg-gray-800 border border-gray-200 rounded-xl text-white dark:border-gray-600 dark:hover:bg-gray-700 gap-2 focus:outline-none transition-all duration-200"
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
                        <span className="hidden md:block text-white">
                          {dict?.hotel_search?.search_btnText}
                        </span>
                        <span className="md:hidden text-white">
                          {dict?.hotel_search?.search_btnText_mobile}
                        </span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}