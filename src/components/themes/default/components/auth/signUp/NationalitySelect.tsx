"use client";
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import Select from "@components/core/select";
import useCountries from "@hooks/useCountries";
import useDirection from "@hooks/useDirection";

export default function NationalitySelect({
  value,
  onChange,
  label = "Nationality",
}: {
  value?: string;
  onChange: (val: string) => void;
  label?: string;
}) {
  const { countries } = useCountries();
  const [direction] = useDirection();
  const [isOpen, setIsOpen] = useState(false);

  const options =
    countries?.map((c: any) => ({
      value: c.iso,
      label: c.nicename || c.name,
      iso: c.iso,
    })) || [];

  // ✅ Automatically set "US" if nothing selected
  useEffect(() => {
    if (!value && options.length > 0) {
      onChange("US");
    }
  }, [value, options, onChange]);

  const selected = options.find((opt: any) => opt.value === value) || null;

  return (
    <div className="w-full">
      <label className="block text-sm text-start font-medium text-gray-500 dark:text-gray-300 mb-2">
        {label}
      </label>

      {countries && (
        <Select
          options={options}
          value={selected}
          onChange={(option: any) => onChange(option?.value || "")}
          isSearchable
          placeholder="Select Nationality"
          className="w-full cursor-pointer"
          onMenuOpen={() => setIsOpen(true)}
          onMenuClose={() => setIsOpen(false)}
          classNames={{
            control: () =>
              "w-full font-medium pl-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-none",
            valueContainer: () => "flex items-center gap-2 px-1",
            singleValue: () => "flex items-center gap-2",
            placeholder: () => "text-gray-400",
            indicatorsContainer: () =>
              direction === "rtl"
                ? "absolute left-4 top-3"
                : "absolute right-4 top-3",
          }}
          components={{
            Option: ({ data, ...props }) => (
              <div
                {...props.innerProps}
                className="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
              >
                <Icon
                  icon={`flagpack:${data.iso?.toLowerCase()}`}
                  width="20"
                  height="15"
                />
                <span>{data.label}</span>
              </div>
            ),
            SingleValue: ({ data }) => (
              <div className="flex items-center gap-2">
                <Icon
                  icon={`flagpack:${data.iso?.toLowerCase()}`}
                  width="20"
                  height="15"
                />
                <span>{data.label}</span>
              </div>
            ),
            DropdownIndicator: () => (
              <Icon
                icon="mdi:keyboard-arrow-down"
                width="20"
                height="20"
                className={`text-gray-600 transition-transform duration-100 ${
                  isOpen ? "rotate-180" : "rotate-0"
                }`}
              />
            ),
            IndicatorSeparator: () => null,
          }}
        />
      )}
    </div>
  );
}
