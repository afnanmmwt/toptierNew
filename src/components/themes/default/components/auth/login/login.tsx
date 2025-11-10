"use client";
import { Icon } from "@iconify/react";
import { useState, useCallback, useEffect } from "react";
import { useForm, Controller } from 'react-hook-form';
import { useParams, usePathname, useRouter } from "next/navigation";
import Input from "@components/core/input";
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Checkbox from "@components/core/checkbox";
import useDarkMode from "@hooks/useDarkMode";
import { useUser } from "@hooks/use-user";
import Alert from "@components/core/alert";
import Button from "@components/core/button";
import Link from "next/link";
import { toast } from 'react-toastify';
import useDirection from "@hooks/useDirection";
import { useFormState } from "react-dom";
import { signIn, SignInState, signOut } from "@src/actions"; //  Import Server Action
const Login = ({ dict }: { dict?: any }) => {
  const { lang } = useParams();
  const router = useRouter();
  const [direction] = useDirection();
  const [isDarkMode] = useDarkMode();
  const lastRoute=sessionStorage.getItem('lastRoute')
  const { checkSession,user } = useUser();
  // Zod schema (use dict messages if available)
  const schema = z.object({
    email: z.string().min(1, { message: dict?.login_form?.email_message || "Email is required" }).email(),
    password: z.string().min(6, { message: dict?.login_form?.password_message || "Password must be at least 6 characters" }),
    keep_logged_in: z.boolean().optional(),
  });
  type Values = z.infer<typeof schema>;
  const defaultValues = { email: '', password: '', keep_logged_in: false } satisfies Values;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  //  useFormState
  const initialState: SignInState = { success: false, error: '' };
  const [state, formAction] = useFormState(signIn, initialState);
  useEffect(()=>{
    if(user){
 signOut()
    }
  },[])
  // Handle result of Server Action


useEffect(() => {
  if (state.success) {
    toast.success(dict?.login_form?.success_message || "Login successful!");
    setLoading(false); //  stop loading
    checkSession?.().then(() => {
      const { userType, userId } = state;

      if (userType === "Agent" && userId) {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('access-token='))?.split('=')[1];

        if (token && lastRoute !== "/bookings") {
          window.location.href = `https://toptier-agent-d-ua92.vercel.app/?token=${encodeURIComponent(token)}&user_id=${userId}`;
          return;
        }
      }
      router.push(lastRoute === "/bookings" ? "/bookings" : `/${lang}`);
    });
  }
  else if (state.error) {
    // 👇 handle incorrect credentials
    setLoading(false);
    toast.error(state.error || "Invalid email or password");

    // Optionally show error inline:
    setError("root", { message: state.error || "Login failed" });
  }
}, [state, router, lang, dict, checkSession, lastRoute, setError]);

  // Client validation only — then submit hidden form
  const onSubmit = useCallback(
    async (values: Values) => {
      setLoading(true);
      const hiddenForm = document.getElementById("hidden-login-form") as HTMLFormElement;
      if (hiddenForm) {
        (hiddenForm.elements.namedItem("email") as HTMLInputElement).value = values.email;
        (hiddenForm.elements.namedItem("password") as HTMLInputElement).value = values.password;
        hiddenForm.requestSubmit();
      }
    },
    []
  );
  return (
    <div className="relative w-full flex flex-col justify-between items-center h-full border-t border-gray-300">
      <div className="w-full flex items-center justify-center p-6 lg:p-8 bg-white dark:bg-gray-800">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-fade-in">
          <div className="text-start">
            <h2 className="text-lg sm:text-3xl font-meduim text-gray-900 mb-2 dark:text-gray-100">
              {dict?.login_form?.text || "Sign in"}
            </h2>
            <p className="text-gray-600 text-base dark:text-gray-100">
              {dict?.login_form?.new_user || "New user ? "}
              <Link href={`/${lang}/auth/signup`} className="text-blue-900 hover:underline">
                {dict?.login_form?.create_account || "Create an account"}
              </Link>
            </p>
          </div>
          {/* Visible form with validation */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root && (
              <Alert showIcon className="my-2 font-medium text-sm" type="danger">
                {errors.root.message}
              </Alert>
            )}
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                {dict?.login_form?.email || "Email *"}
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="email"
                    placeholder={dict?.login_form?.email_placeholder}
                    size="lg"
                    invalid={!!errors.email}
                    className="ps-4"
                    // className={`${direction === "rtl" ? "pr-3" : "pl-0"}`}
                  />
                )}
              />
              {errors.email && (
                <div className="text-red-500 flex items-center gap-1 text-xs pt-1 mb-3">
                  <Icon icon="mdi:warning-circle" width="15" height="15" />
                  <span>{errors.email.message}</span>
                </div>
              )}
            </div>
            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1 mt-6">
                {dict?.login_form?.password || "Password *"}
              </label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type={showPassword ? "text" : "password"}
                    placeholder={dict?.login_form?.password_placeholder}
                    size="lg"
                    invalid={!!errors.password}
                    className=""
                    suffix={
                      <button type="button" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <Icon icon="mdi:eye-off" width="20" height="20" />
                        ) : (
                          <Icon icon="mdi:eye" width="20" height="20" />
                        )}
                      </button>
                    }
                  />
                )}
              />
              {errors.password && (
                <div className="text-red-500 flex items-center gap-1 pt-1 mb-4 text-xs">
                  <Icon icon="mdi:warning-circle" width="15" height="15" />
                  <span>{errors.password.message}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-8">
              <Controller
                name="keep_logged_in"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    checked={field.value}
                    onChange={field.onChange}
                    children={<p className="text-sm text-gray-700 font-normal">
                      {dict?.login_form?.remember_me || "Remember me"}
                    </p>}
                  />
                )}
              />
              <Link href={`/${lang}/auth/forget-password`} className="text-blue-950 hover:text-blue-900 font-medium">
                <span className="text-blue-900 dark:text-blue-100 hover:text-blue-900 text-sm">
                  {dict?.login_form?.forgot_password || "Forgot Password?"}
                </span>
              </Link>
            </div>
             <Button size="lg"
              {...(loading && {
                icon: <Icon icon="line-md:loading-twotone-loop" width="24" height="24" />
              })}
              disabled={loading} className={`w-full bg-blue-900 mt-7 text-white hover:bg-gray-900 hover:text-white border-none hover:border-none flex gap-2 justify-center rounded-lg py-3 font-medium  ${isDarkMode ? "hover:bg-gray-600" : "hover:bg-[#101828]"}`} type="submit">
              <span>{dict?.login_form?.login_button || "Login"}</span>
            </Button>
          </form>
          {/*  Hidden form to trigger Server Action */}
          <form id="hidden-login-form" action={formAction} className="hidden">
            <input name="email" defaultValue="" />
            <input name="password" defaultValue="" />
            <button type="submit" />
          </form>
        </div>
      </div>
    </div>
  );
};
export default Login;