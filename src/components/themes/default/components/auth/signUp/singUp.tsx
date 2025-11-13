"use client";
import { Icon } from "@iconify/react";
import useDirection from "@hooks/useDirection";
import Input from "@components/core/input";
import { z as zod } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Checkbox from "@components/core/checkbox";
import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import useDictionary from "@hooks/useDict";
import { useMutation } from "@tanstack/react-query";
import { sign_up } from "@src/actions";
import Button from "@components/core/button";
import Alert from "@components/core/alert";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAppSelector } from "@lib/redux/store";
import { mode as selectMode } from "@lib/redux/base/selectors";
import useDarkMode from "@hooks/useDarkMode";
import useCountries from "@hooks/useCountries";
import Select from "@components/core/select"; // Import Select
import useLocale from "@hooks/useLocale"; //  Required for RTL

export default function SignUpForm() {
  const { lang } = useParams();
  const { data: dict, isLoading } = useDictionary(lang as any);
  const { locale } = useLocale(); //  For RTL support
  const [direction] = useDirection();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDarkMode] = useDarkMode();
  const mode = useAppSelector(selectMode);
  const { countries: rawCountries } = useCountries();

  //  Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCountryListOpen, setIsCountryListOpen] = useState(false);
  const [isPhoneCodeListOpen, setIsPhoneCodeListOpen] = useState(false);

  //  Filter & format countries
  const excludedCodes = ["0", "381", "599"];
  const countryList = Array.isArray(rawCountries)
    ? rawCountries
        .map((c: any) => ({
          iso: c.iso || c.code || "",
          name: c.nicename || c.name || "",
          phonecode: c.phonecode?.toString() || "0",
        }))
        .filter((c) => c.iso && c.name && !excludedCodes.includes(c.phonecode))
    : [];

  const countryOptions = countryList.map((c) => ({
    value: c.iso,
    label: c.name,
    iso: c.iso,
    phonecode: c.phonecode,
  }));

const phoneCodeOptions = countryList.map((c) => {
  // Force US flag for shared code "+1"
  const displayIso = c.phonecode === "1" ? "US" : c.iso;
  return {
    value: c.phonecode,
    label: `+${c.phonecode}`,
    iso: displayIso, //  This controls the flag
    phonecode: c.phonecode,
  };
});
  //  Fix Zod schema — country is NOT email!
  const schema = zod.object({
    first_name: zod.string().min(1, { message: dict?.errors?.first_name_required }),
    last_name: zod.string().min(1, { message: dict?.errors?.last_name_required }),
    email: zod.string().email({ message: dict?.errors?.email_invalid }),
    country: zod.string().min(1, { message: dict?.errors?.country_required }), //  Fixed
    phone: zod
      .string()
      .min(8, { message: dict?.errors?.phone_number_required })
      .regex(/^\+?[1-9]\d{7,14}$/, {
        message: dict?.errors?.phone_number_invalid,
      }),
    phone_country_code: zod.string().min(1, { message: dict?.errors?.country_code_required }),
    password: zod.string().min(6, { message: dict?.errors?.password_min_length }),
    terms: zod.boolean().refine((val) => val === true, {
      message: dict?.errors?.terms_required,
    }),
    // human: zod.boolean().refine((val) => val === true, {
    //   message: dict?.errors?.human_required,
    // }),
  });

  type Values = zod.infer<typeof schema>;

  const defaultValues: Values = {
    first_name: "",
    last_name: "",
    email: "",
    country: "US", //  ISO code
    phone: "",
    phone_country_code: "1", //  numeric code
    password: "",
    terms: false,
    // human: false,

  };

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
    setValue,
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  // ✅ Sync phone code when country changes
  const countryValue = watch("country");
  useEffect(() => {
    if (countryValue) {
      const country = countryList.find((c) => c.iso === countryValue);
      if (country) {
        setValue("phone_country_code", country.phonecode);
      }
    }
  }, [countryValue, countryList, setValue]);

  const mutate = useMutation({
    mutationFn: sign_up,
    onSuccess: (data) => {
      if (data.error) {
        const message = data.error;
        if (message.toLowerCase().includes("password")) setError("password", { type: "manual", message });
        else if (message.toLowerCase().includes("email")) setError("email", { type: "manual", message });
        else if (message.toLowerCase().includes("phone")) setError("phone", { type: "manual", message });
        else if (message.toLowerCase().includes("country")) setError("country", { type: "manual", message });
        else setError("root", { type: "manual", message });
        setLoading(false);
        return;
      }
      setIsModalOpen(true);
      setLoading(false);
    },
  });

  const onSubmit = useCallback(
    async (values: Values) => {

      setLoading(true);
      try {
        await mutate.mutateAsync({
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          country: values.country, // "US"
          phone: values.phone,
          phone_country_code: parseInt(values.phone_country_code, 10), // 1, 92 etc.
          password: values.password,
        });
      } catch (err) {
        setLoading(false);
        toast.error(dict?.errors?.something_went_wrong || "Something went wrong");
      }
    },
    [mutate, dict]
  );

  // Helper
  const getCountryByIso = (iso: string) => countryList.find((c) => c.iso === iso);

  return (
    <div className="relative w-full min-h-screen flex flex-col lg:flex-row border-t border-gray-300">
      <div className="w-full flex items-center justify-center p-4 sm:p-6 md:p-10 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-fade-in">
          <div className="text-start">
            <h2 className="text-lg sm:text-3xl font-medium text-gray-900 mb-2 dark:text-gray-100">
              {dict?.signup_form?.heading}
            </h2>
            <p className="text-base text-gray-500 mt-1">
              {dict?.signup_form?.already_account}{" "}
              <Link href="/auth/login" className="text-blue-900 hover:underline">
                {dict?.signup_form?.sign_in}
              </Link>
            </p>
          </div>

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root && (
              <Alert showIcon className="my-2 font-medium text-sm" type="danger">
                {errors.root.message}
              </Alert>
            )}

        {/* First + Last Name */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
      {dict?.signup_form?.first_name}
    </label>
    <Controller
      name="first_name"
      control={control}
      render={({ field }) => (
        <Input
          {...field}
          placeholder={dict?.signup_form?.first_name_placeholder}
          size="lg"
          invalid={!!errors.first_name}
        />
      )}
    />
    {errors.first_name && (
      <p className="absolute mt-1 text-red-500 text-xs flex items-center gap-1 top-full ">
        <Icon icon="mdi:warning-circle" width="15" height="15" />
        {errors.first_name.message}
      </p>
    )}
  </div>

  <div className="relative">
    <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
      {dict?.signup_form?.last_name}
    </label>
    <Controller
      name="last_name"
      control={control}
      render={({ field }) => (
        <Input
          {...field}
          placeholder={dict?.signup_form?.last_name_placeholder}
          size="lg"
          invalid={!!errors.last_name}
        />
      )}
    />
    {errors.last_name && (
      <p className="absolute mt-1 text-red-500 text-xs flex items-center gap-1 top-full ">
        <Icon icon="mdi:warning-circle" width="15" height="15" />
        {errors.last_name.message}
      </p>
    )}
  </div>
</div>

{/* Country */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
    {dict?.signup_form?.country_label || "Country"}
  </label>
  <Controller
    name="country"
    control={control}
    render={({ field }) => (
      <Select
        {...field}
        options={countryOptions}
        placeholder={dict?.signup_form?.country_placeholder || "Select country"}
        isSearchable
        onChange={(option: any) => field.onChange(option?.value || "")}
        value={countryOptions.find((opt) => opt.value === field.value) || null}
        className="w-full"
        classNames={{
          control: () =>
            "border border-gray-200 cursor-pointer rounded-lg px-3 py-2.5 flex items-center min-h-[44px] text-base focus:ring-1 focus:ring-[#163C8C] focus:border-[#163C8C] shadow-none",
          valueContainer: () => "flex items-center gap-2 px-1",
          singleValue: () => "flex items-center gap-2 text-gray-800 font-medium truncate",
          placeholder: () => "text-gray-400 font-normal",
          indicatorsContainer: () =>
            locale?.startsWith("ar") ? "absolute left-4" : "absolute right-4",
        }}
        onMenuOpen={() => setIsCountryListOpen(true)}
        onMenuClose={() => setIsCountryListOpen(false)}
        components={{
          Option: ({ data, ...props }) => (
            <div
              {...props.innerProps}
              className="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
            >
              <Icon
                icon={`flagpack:${data.iso?.toLowerCase()}`}
                width="22"
                height="16"
                className="rounded-sm"
              />
              <span>{data.label}</span>
            </div>
          ),
          SingleValue: ({ data }) => (
            <div className="flex items-center gap-2 truncate">
              <Icon
                icon={`flagpack:${data.iso?.toLowerCase()}`}
                width="22"
                height="16"
                className="rounded-sm"
              />
              <span>{data.label}</span>
            </div>
          ),
          DropdownIndicator: () => (
            <Icon
              icon="mdi:keyboard-arrow-down"
              width="24"
              height="24"
              className={`text-gray-600 transition duration-100 ease-in-out ${
                isCountryListOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          ),
          IndicatorSeparator: () => null,
        }}
      />
    )}
  />
  {errors.country && (
    <p className="absolute mt-1 text-red-500 text-xs flex items-center gap-1 top-full ">
      <Icon icon="mdi:warning-circle" width="15" height="15" />
      {errors.country.message}
    </p>
  )}
</div>

{/* Phone Country Code */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
    {dict?.signup_form?.phone_code_label}
  </label>
  <Controller
    name="phone_country_code"
    control={control}
    render={({ field }) => (
      <Select
        {...field}
        options={phoneCodeOptions}
        placeholder={dict?.signup_form?.phone_code_placeholder || "Select code"}
        isSearchable
        onChange={(option: any) => field.onChange(option?.value || "")}
        value={phoneCodeOptions.find((opt) => opt.value === field.value) || null}
        className="w-full"
        classNames={{
          control: () =>
            "border border-gray-200 cursor-pointer rounded-lg px-3 py-2.5 flex items-center min-h-[44px] text-base focus:ring-1 focus:ring-[#163C8C] focus:border-[#163C8C] shadow-none",
          valueContainer: () => "flex items-center gap-2 px-1",
          singleValue: () => "flex items-center justify-between text-gray-800 font-medium",
          placeholder: () => "text-gray-400 font-normal",
          indicatorsContainer: () =>
            locale?.startsWith("ar") ? "absolute left-4" : "absolute right-4",
        }}
        onMenuOpen={() => setIsPhoneCodeListOpen(true)}
        onMenuClose={() => setIsPhoneCodeListOpen(false)}
        components={{
          Option: ({ data, ...props }) => (
            <div
              {...props.innerProps}
              className="px-3 py-2 cursor-pointer flex items-center gap-2 hover:bg-gray-100"
            >
              <Icon
                icon={`flagpack:${data.iso?.toLowerCase()}`}
                width="22"
                height="16"
                className="rounded-sm"
              />
              <span>+{data.phonecode}</span>
            </div>
          ),
          SingleValue: ({ data }) => (
            <div className="flex items-center justify-between gap-2 truncate">
              <Icon
                icon={`flagpack:${data.iso?.toLowerCase()}`}
                width="22"
                height="16"
                className="rounded-sm"
              />
              <span>+{data.phonecode}</span>
            </div>
          ),
          DropdownIndicator: () => (
            <Icon
              icon="mdi:keyboard-arrow-down"
              width="24"
              height="24"
              className={`text-gray-600 transition duration-100 ease-in-out ${
                isPhoneCodeListOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          ),
          IndicatorSeparator: () => null,
        }}
      />
    )}
  />
  {errors.phone_country_code && (
    <p className="absolute mt-1 text-red-500 text-xs flex items-center gap-1 top-full ">
      <Icon icon="mdi:warning-circle" width="15" height="15" />
      {errors.phone_country_code.message}
    </p>
  )}
</div>

{/* Phone */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
    {dict?.signup_form?.phone_label}
  </label>
  <Controller
    name="phone"
    control={control}
    render={({ field }) => (
      <Input
        {...field}
        placeholder={dict?.signup_form?.phone_placeholder}
        size="lg"
        invalid={!!errors.phone}
      />
    )}
  />
  {errors.phone && (
    <p className="absolute mt-1 text-red-500 text-xs flex items-center gap-1 top-full  ps-0">
      <Icon icon="mdi:warning-circle" width="15" height="15" />
      {errors.phone.message}
    </p>
  )}
</div>

{/* Email */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
    {dict?.signup_form?.email_label}
  </label>
  <Controller
    name="email"
    control={control}
    render={({ field }) => (
      <Input
        {...field}
        type="email"
        placeholder={dict?.signup_form?.email_placeholder}
        size="lg"
        invalid={!!errors.email}
      />
    )}
  />
  {errors.email && (
    <p className="absolute mt-1 text-red-500 text-xs flex items-center gap-1 top-full ">
      <Icon icon="mdi:warning-circle" width="15" height="15" />
      {errors.email.message}
    </p>
  )}
</div>

{/* Password */}
<div className="relative">
  <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
    {dict?.signup_form?.password_label}
  </label>
  <Controller
    name="password"
    control={control}
    render={({ field }) => (
      <Input
        {...field}
        type={showPassword ? "text" : "password"}
        placeholder={dict?.signup_form?.password_placeholder}
        size="lg"
        invalid={!!errors.password}
        suffix={
          <button type="button" onClick={() => setShowPassword(!showPassword)}>
            <Icon icon={showPassword ? "mdi:eye-off" : "mdi:eye"} width="20" height="20" />
          </button>
        }
      />
    )}
  />
  {errors.password && (
    <p className="absolute mt-1 text-red-500 text-xs flex items-center gap-1 top-full ">
      <Icon icon="mdi:warning-circle" width="15" height="15" />
      {errors.password.message}
    </p>
  )}
</div>

            {/* Human + Terms */}
            <div className="relative">
              {/* <div className="  flex items-start space-x-3 gap-2 mb-2">
                <Controller
                  name="human"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(value: boolean) => field.onChange(value)}
                    />
                  )}
                />
                <label className="text-sm text-gray-600 dark:text-gray-100 cursor-pointer">
                  {dict?.signup_form?.human_label}
                </label>
              </div> */}

              {/* {errors.human && (
                <p className="absolute mt-1 text-red-500 text-xs flex items-center gap-1  top-4 ">
                  <Icon icon="mdi:warning-circle" width="15" height="15" />
                  {errors.human.message}
                </p>
              )} */}

              <div className=" relative flex items-start space-x-3 gap-2 mt-3">
                <Controller
                  name="terms"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(value: boolean) => field.onChange(value)}
                    />
                  )}
                />
                <label className="text-sm text-gray-600 dark:text-gray-100 cursor-pointer flex-1">
                  {dict?.signup_form?.agree_text}{" "}
                  <a
                    href="/terms-and-conditions"
                    className="text-blue-900 hover:text-blue-800 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {dict?.signup_form?.terms_of_use}
                  </a>{" "}
                  {dict?.signup_form?.and}{" "}
                  <a
                    href="/privacy-policy"
                    className="text-blue-900 hover:text-blue-800 font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {dict?.signup_form?.privacy_policy}
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="absolute mt-1 text-red-500 text-xs flex items-center gap-1 top-full ">
                  <Icon icon="mdi:warning-circle" width="15" height="15" />
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              size="lg"
              {...(loading && {
                icon: <Icon icon="line-md:loading-twotone-loop" width="24" height="24" />,
              })}
              disabled={loading}
              className="bg-blue-900 hover:bg-black hover:text-white w-full flex gap-2 justify-center text-white rounded-lg py-3 font-medium"
              type="submit"
            >
              <span>{dict?.signup_form?.create_account_button}</span>
              <Icon icon="mdi:arrow-right" width="20" height="20" />
            </Button>
          </form>
        </div>
      </div>

      {/* Modal */}
   {isModalOpen && (
  <div
    className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 opacity-0 animate-fade-in"
    onClick={() => setIsModalOpen(false)}
  >
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-8 w-full max-w-sm shadow-xl transform scale-90 opacity-0 animate-scale-in"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="text-center">
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon
            icon="mdi:check-circle-outline"
            className="text-green-600 dark:text-green-400"
            width="32"
            height="32"
          />
        </div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
          {dict?.signup_form?.success_title || "Congratulations!"}
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-6 px-2">
          {dict?.signup_form?.success_message || "Your account has been created successfully!"}
        </p>

        <Button
          onClick={() => router.push(`/${lang}/auth/login`)}
          className="bg-blue-900 hover:border-none hover:text-white hover:bg-black  text-white rounded-lg px-10 py-3 font-medium shadow-sm transition-all"
        >
          {dict?.signup_form?.go_to_login || "Go to Login"}
        </Button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}