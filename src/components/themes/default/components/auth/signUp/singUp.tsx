"use client";
import { Icon } from "@iconify/react";
import useDirection from "@hooks/useDirection";
import Input from "@components/core/input";
import { z as zod } from "zod";
import { useForm, Controller } from "react-hook-form";
import Select from "@components/core/select";
import { zodResolver } from "@hookform/resolvers/zod";
import Checkbox from "@components/core/checkbox";
import { useState, useCallback } from "react";
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
import type {
  StylesConfig,
  ControlProps,
  OptionProps,
  SingleValueProps,
  CSSObjectWithLabel,
} from "react-select";

export default function SignUpForm() {
  const { lang } = useParams();
  const { data: dict, isLoading } = useDictionary(lang as any);
  const [direction] = useDirection();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDarkMode] = useDarkMode();
  const mode = useAppSelector(selectMode);
  const { countries, isLoading: isCountriesLoading } = useCountries();

  // ✅ Zod Schema with dictionary-based error messages
  const schema = zod.object({
    first_name: zod
      .string()
      .min(1, { message: dict?.errors?.first_name_required }),
    last_name: zod
      .string()
      .min(1, { message: dict?.errors?.last_name_required }),
    email: zod.string().email({ message: dict?.errors?.email_invalid }),
    phone: zod
      .string()
      .min(8, { message: dict?.errors?.phone_number_required })
      .regex(/^\+?[1-9]\d{7,14}$/, {
        message: dict?.errors?.phone_number_invalid,
      }),
    phone_country_code: zod
      .string()
      .min(1, { message: dict?.errors?.country_code_required }),
    password: zod
      .string()
      .min(6, { message: dict?.errors?.password_min_length }),
    terms: zod.boolean().refine((val) => val === true, {
      message: dict?.errors?.terms_required,
    }),
    human: zod.boolean().refine((val) => val === true, {
      message: dict?.errors?.human_required,
    }),
  });

  type Values = zod.infer<typeof schema>;

  const defaultValues: Values = {
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    phone_country_code: "",
    password: "",
    terms: false,
    human: false,
  };

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    watch,
  } = useForm<Values>({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const mutate = useMutation({
    mutationFn: sign_up,
    onSuccess: (data) => {
      if (data.error) {
        const message = data.error;
        if (message.toLowerCase().includes("password")) {
          setError("password", { type: "manual", message });
        } else if (message.toLowerCase().includes("email")) {
          setError("email", { type: "manual", message });
        } else if (message.toLowerCase().includes("phone")) {
          setError("phone", { type: "manual", message });
        } else {
          setError("root", { type: "manual", message });
        }
        setLoading(false);
        return;
      }
      toast.success(dict?.signup_form?.success_message || "Signup successful! 🎉");
      router.push(`/${lang}/auth/login`);
    },
  });

  const onSubmit = useCallback(
    async (values: Values) => {
      setLoading(true);
      await mutate.mutateAsync({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone,
        phone_country_code: parseInt(values.phone_country_code, 10),
        password: values.password,
      });
    },
    [router, setError, mutate]
  );

  // ✅ Country select style
  const customStyles: StylesConfig<any, false> = {
    control: (base) => ({
      ...base,
      width: "100%",
      height: "2.9rem",
      fontSize: "0.875rem",
      borderRadius: "0.5rem",
      color: isDarkMode ? "#F9FAFB" : "#1F2937",
      backgroundColor: isDarkMode ? "#1F2937" : "#fff",
      borderColor: isDarkMode ? "#4B5563" : "#D1D5DB",
      boxShadow: "none",
      transition: "all 0.2s",
      "&:hover": {
        backgroundColor: isDarkMode ? "#374151" : "#F3F4F6",
      },
    }),
  };


  const countryOptions = (countries || []).map((country: any) => ({
    label: country.label || country.name,
    value: country.value || country.id,
    icon: country.icon,
  }));

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
              <Link
                href="/auth/login"
                className="text-blue-900 hover:underline"
              >
                {dict?.signup_form?.sign_in}
              </Link>
            </p>
          </div>

          <form
            className="space-y-4 sm:space-y-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            {errors.root && (
              <Alert
                showIcon
                className="my-2 font-medium text-sm"
                type="danger"
              >
                {errors.root.message}
              </Alert>
            )}

            {/* First + Last Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
                  {dict?.signup_form?.first_name}
                </label>
                <Controller
                  name="first_name"
                  control={control}
                  render={({ field }) => (
                    <div className="relative flex flex-col gap-2">
                      <Input
                        {...field}
                        placeholder={dict?.signup_form?.first_name_placeholder}
                        size="lg"
                        invalid={!!errors.first_name}
                      />
                      {errors.first_name && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <Icon icon="mdi:warning-circle" width="15" height="15" />
                          {errors.first_name.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
                  {dict?.signup_form?.last_name}
                </label>
                <Controller
                  name="last_name"
                  control={control}
                  render={({ field }) => (
                    <div className="relative flex flex-col gap-2">
                      <Input
                        {...field}
                        placeholder={dict?.signup_form?.last_name_placeholder}
                        size="lg"
                        invalid={!!errors.last_name}
                      />
                      {errors.last_name && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <Icon icon="mdi:warning-circle" width="15" height="15" />
                          {errors.last_name.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
                {dict?.signup_form?.country_label}
              </label>
              < Controller
                name="phone_country_code"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={countryOptions}
                    value={countryOptions.find((option: any) => option.value === field.value)}
                    onChange={(option) => field.onChange(option?.value)}
                    // placeholder={dict?.signup_form?.fields?.country?.placeholder}
                    placeholder={dict?.signup_form?.country_placeholder}
                    size="lg"
                    styles={customStyles}
                    isSearchable
                    isLoading={isCountriesLoading}
                  />
                )}
              />
              {errors.phone_country_code && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <Icon icon="mdi:warning-circle" width="15" height="15" />
                  {errors.phone_country_code.message}
                </p>
              )}
            </div>


            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
                {dict?.signup_form?.phone_label}
              </label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <div className="relative flex flex-col gap-2">
                    <Input
                      {...field}
                      placeholder={dict?.signup_form?.phone_placeholder}
                      size="lg"
                      invalid={!!errors.phone}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <Icon icon="mdi:warning-circle" width="15" height="15" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
                {dict?.signup_form?.email_label}
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <div className="relative flex flex-col gap-2">
                    <Input
                      {...field}
                      type="email"
                      placeholder={dict?.signup_form?.email_placeholder}
                      size="lg"
                      invalid={!!errors.email}

                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <Icon icon="mdi:warning-circle" width="15" height="15" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-100">
                {dict?.signup_form?.password_label}
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <div className="relative flex flex-col gap-2">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder={dict?.signup_form?.password_placeholder}
                      size="lg"
                      invalid={!!errors.password}
                      suffix={
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <Icon
                            icon={
                              showPassword ? "mdi:eye-off" : "mdi:eye"
                            }
                            width="20"
                            height="20"
                          />
                        </button>
                      }
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <Icon icon="mdi:warning-circle" width="15" height="15" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                )}
              />
            </div>

            {/* Human + Terms */}
            <div>
              <div className="flex items-start space-x-3 gap-2 mb-2">
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
              </div>
              {errors.human && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <Icon icon="mdi:warning-circle" width="15" height="15" />
                  {errors.human.message}
                </p>
              )}

              <div className="flex items-start space-x-3 gap-2 mt-3">
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
                  >
                    {dict?.signup_form?.terms_of_use}
                  </a>{" "}
                  {dict?.signup_form?.and}{" "}
                  <a
                    href="/privacy-policy"
                    className="text-blue-900 hover:text-blue-800 font-medium"
                    target="_blank"
                  >
                    {dict?.signup_form?.privacy_policy}
                  </a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-xs flex items-center gap-1 mt-1">
                  <Icon icon="mdi:warning-circle" width="15" height="15" />
                  {errors.terms.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              size="lg"
              {...(loading && {
                icon: (
                  <Icon
                    icon="line-md:loading-twotone-loop"
                    width="24"
                    height="24"
                  />
                ),
              })}
              disabled={loading || !watch("terms") || !watch("human")}
              className="bg-blue-900 hover:bg-blue-700 w-full flex gap-2 justify-center text-white rounded-lg py-3 font-medium"
              type="submit"
            >
              <span>{dict?.signup_form?.create_account_button}</span>
              <Icon icon="mdi:arrow-right" width="20" height="20" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
