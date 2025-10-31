// Login.tsx
"use client";

import { useFormState } from "react-dom";
import { useFormStatus } from "react-dom"; // ✅ for loading state
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { useUser } from "@hooks/use-user";
import Link from "next/link";
import Button from "@components/core/button";
import Alert from "@components/core/alert";
import Input from "@components/core/input";
import Checkbox from "@components/core/checkbox";
import { signIn, SignInState } from "@src/actions";
import { Icon } from "@iconify/react";

// ✅ Submit Button with Loading Spinner
function LoginSubmitButton({ dict }: { dict?: any }) {
  const { pending } = useFormStatus(); // true while Server Action is running

  return (
    <Button
      size="lg"
      type="submit"
      disabled={pending}
      className="w-full bg-blue-900 mt-7 hover:text-white text-white hover:bg-[#101828] border-none rounded-lg py-3 font-medium flex items-center justify-center gap-2"
    >
      {pending ? (
        <>
          <Icon icon="line-md:loading-twotone-loop" width="20" height="20" className="animate-spin" />
          <span>{dict?.login_form?.logging_in || "Logging in..."}</span>
        </>
      ) : (
        <span>{dict?.login_form?.login_button || "Login"}</span>
      )}
    </Button>
  );
}

const Login = ({ dict }: { dict?: any }) => {
  const { lang } = useParams();
  const router = useRouter();
  const { checkSession } = useUser();

  const initialState: SignInState = { success: false, error: '' };
  const [state, formAction] = useFormState(signIn, initialState);

  // Handle post-login redirect
  useEffect(() => {
    if (state.success) {
      toast.success(dict?.login_form?.success_message || "Login successful!");
      checkSession?.().then(() => {
        const { userType, userId } = state;

        if (userType === "Agent" && userId) {
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('access-token='))?.split('=')[1];

          if (token) {
            window.location.href = `https://toptier-agent-d-ua92.vercel.app/?token=${encodeURIComponent(token)}&user_id=${userId}`;
            return;
          }
        }

        router.push(`/${lang}`);
      });
    }
  }, [state, router, lang, dict, checkSession]);

  // Safely extract error (only when success: false)
  const errorMessage = !state.success ? state.error : null;

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

          <form action={formAction} className="space-y-4">
            {errorMessage && (
              <Alert showIcon className="my-2 font-medium text-sm" type="danger">
                {errorMessage}
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1">
                {dict?.login_form?.email || "Email *"}
              </label>
              <Input
                name="email"
                type="email"
                placeholder={dict?.login_form?.email_placeholder}
                size="lg"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-1 mt-6">
                {dict?.login_form?.password || "Password *"}
              </label>
              <Input
                name="password"
                type="password"
                placeholder={dict?.login_form?.password_placeholder}
                size="lg"
                required
              />
            </div>

            <div className="flex items-center justify-between mt-8">
              <Checkbox name="keep_logged_in">
                <span className="text-sm text-gray-700 font-normal">
                  {dict?.login_form?.remember_me || "Remember me"}
                </span>
              </Checkbox>
              <Link href={`/${lang}/auth/forget-password`} className="text-blue-900 hover:underline text-sm">
                {dict?.login_form?.forgot_password || "Forgot Password?"}
              </Link>
            </div>

            {/* ✅ Button with spinner */}
            <LoginSubmitButton dict={dict} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;