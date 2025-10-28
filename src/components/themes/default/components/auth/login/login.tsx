"use client";
import { Icon } from "@iconify/react";

import { useState, useCallback } from "react";
import { useForm, Controller } from 'react-hook-form';
import { useParams,useRouter } from "next/navigation";
import Input from "@components/core/input";
import { z as zod } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Checkbox from "@components/core/checkbox";
import useDarkMode from "@hooks/useDarkMode";
import { authClient } from '@src/lib/auth/client';
import { useUser } from "@hooks/use-user";
import Alert from "@components/core/alert";
import Button from "@components/core/button";
import Link from "next/link";
import { toast } from 'react-toastify';
import useDirection from "@hooks/useDirection";

//--------------- validation object for inputs
const schema = zod.object({
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod.string().min(6, { message: 'Password is required' }),
  keep_logged_in: zod.boolean().optional(),
});
// ----- generate automatic type from schema obhect
type Values = zod.infer<typeof schema>;
//---------- set defaults values
const defaultValues = { email: '', password: '', keep_logged_in: false, } satisfies Values;
export default function Login({ ...props }): React.JSX.Element {
  const { dict } = props
  const { lang } = useParams();
  const router = useRouter();
  const [direction]=useDirection();
  //--------------- validation object for inputs
const schema = zod.object({
  email: zod.string().min(1, { message: dict?.login_form?.email_message }).email(),
  password: zod.string().min(6, { message: dict?.login_form?.password_message  }),
  keep_logged_in: zod.boolean().optional(),
});
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
    //--------- adding default values , and connecting from-hook with zode librery
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);



  const [isDarkMode] = useDarkMode();
  // Helper to get input style with hover and dark mode


  // const [isPending, setIsPending] = useState<boolean>(false);
  const { checkSession } = useUser();
  //--------- on submit function
  const onSubmit = useCallback(
    async (values: Values): Promise<void> => {
      setLoading(true);
      const { error } = await authClient.signInWithPassword(values);
      if (error) {
        setError('root', { type: 'server', message: error });
        setLoading(false);
        return;
      }
      await checkSession?.();
      setLoading(false);
      toast.success(dict?.login_form?.success_message || "Login successful!");
      router.refresh();
    },
    [router,setError]
  );


  return (
    <div className="relative w-full  flex flex-col justify-between items-center h-full border-t border-gray-300">
      {/* Left Side - Form */}
      <div className="w-full  flex items-center justify-center p-6 lg:p-8 bg-white dark:bg-gray-800">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-fade-in">
          <div className="text-start">
            <h2 className="text-lg sm:text-3xl font-meduim text-gray-900 mb-2 dark:text-gray-100">
              {dict?.login_form?.text|| "Sign in"}
            </h2>
            <p className="text-gray-600 text-base dark:text-gray-100">
              {dict?.login_form?.new_user || "New user ? "} <Link href={`/auth/signup`} className="text-blue-900 hover:underline">{dict?.login_form?.create_account || "Create an account"}</Link>
            </p>
          </div>

          <form
            className="space-y-4 sm:space-y-6"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >

            <div>
              {errors.root ? <Alert showIcon className="my-2 font-medium text-sm" type="danger">{errors.root.message}</Alert> : null}

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                {dict?.login_form?.email || "Email *"}
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <div className="relative flex flex-col gap-2">
                    <Input
                      {...field}
                      type="email"
                      placeholder={dict?.login_form?.email_placeholder || "Enter your email"}
                      size="lg"
                      invalid={!!errors.email}
                      className={` ${direction === "rtl" ? "pr-3" : "pl-0"} `}

                    />
                    {errors.email && (
                      <div className="text-red-500 flex items-center gap-1 text-xs">
                        <span>
                          <Icon icon="mdi:warning-circle" width="15" height="15" />
                        </span>
                        <span>{errors.email.message}</span>
                      </div>
                    )}
                  </div>

                )}
              />

            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700  dark:text-gray-100 mb-2">
                {dict?.login_form?.password || "Password *"}
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <div className="relative flex flex-col gap-2">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder={dict?.login_form?.password_placeholder || "Enter your password"}
                      size="lg"
                      invalid={!!errors.password}
                      className={`ps-3 `}

                      suffix={<button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-500 hover:text-gray-700 focus:outline-none"
                      >
                        {showPassword ? (
                          <Icon icon="mdi:eye-off" width="20" height="20" />
                        ) : (
                          <Icon icon="mdi:eye" width="20" height="20" />
                        )}
                      </button>}
                    />
                    {errors.password && (
                      <div className="text-red-500 flex items-center gap-1 text-xs">
                        <span>
                          <Icon icon="mdi:warning-circle" width="15" height="15" />
                        </span>
                        <span>{errors.password.message}</span>
                      </div>
                    )}

                  </div>
                )}
              />

            </div>
 <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-start  gap-2">
                <Controller
                  name="keep_logged_in"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col text-xs items-start gap-2">
                      <Checkbox
                        {...field}
                        className="flex items-center"
                        style={{ fontSize: "10px" }}
                        id="terms_checkbox"
                        checked={field.value}
                        onChange={(value: boolean) => {
                          field.onChange(value);

                        }}
                        // className=""
                        children={<p className="text-sm tex-gray-700 font-normal">
                          {/* {dict?.login_form?.keep_logged_in} */}
                          {dict?.login_form?.remember_me || "Remember me"}
                          </p>}
                      />


                    </div>
                  )}
                />
              </div>

              <Link
                href={`/${lang}/auth/forget-password`}
                className="text-blue-900 hover:text-blue-800 font-medium "
              >
                <span className="text-blue-900 dark:text-blue-100 hover:text-blue-600 text-sm">
                  {dict?.login_form?.forgot_password || "Forgot Password?"}
                </span>
              </Link>
            </div>

            <Button size="lg"

              {...(loading && {
                icon: <Icon icon="line-md:loading-twotone-loop" width="24" height="24" />
              })}

              disabled={loading} className={`w-full bg-blue-900 text-white hover:bg-blue-800 hover:text-white border-none hover:border-none flex gap-2 justify-center rounded-lg py-3 font-medium  ${isDarkMode ? "hover:bg-gray-600" : "hover:bg-[#101828]"}`} type="submit">
              <span>{dict?.login_form?.login_button || "Login"}</span>
              {/* <Icon icon="mdi:arrow-right" width="20" height="20" /> */}
            </Button>



          </form>

        </div>

      </div>
    </div>
  );
}
