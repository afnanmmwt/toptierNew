"use client";
import { Icon } from "@iconify/react";
import { useState, useCallback, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { z as zod } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@components/core/input";
import { useMutation } from "@tanstack/react-query";
import { forget_password } from "@src/actions";
import Alert from "@components/core/alert";
import Link from "next/link";
import Button from "@components/core/button";
import useDarkMode from "@hooks/useDarkMode";
export default function ForgetPassword({ dict }: { dict?: any }) {
  const schema = zod.object({
  email: zod.string().min(1, { message:  dict?.errors?.email_invalid }).email(),
});
const defaultValues = { email: "" } satisfies Values;
type Values = zod.infer<typeof schema>;
  const [isDarkMode] = useDarkMode();
  const { lang } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const mutate = useMutation({
    mutationFn: forget_password,
    onSuccess: (data) => {
      setLoading(false);
      if (data?.error) {
        setError("root", { type: "manual", message: data.error });
      } else if (data?.status) {
        setIsModalOpen(true); // ✅ Show modal instead of redirect
      } else {
        setError("root", { type: "manual", message: dict?.errors?.something_went_wrong || "Something went wrong" });
      }
    },
    onError: () => {
      setLoading(false);
      setError("root", { type: "manual", message: dict?.errors?.something_went_wrong || "Something went wrong" });
    },
  });

  const onSubmit = useCallback(
    async (values: Values) => {
      if (loading) return;
      setLoading(true);
      await mutate.mutateAsync(values.email);
    },
    [loading, mutate]
  );

  // Prevent body scroll when modal is open (optional UX polish)
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <div className="relative w-full flex flex-col justify-between min-h-screen">
      <div className="w-full relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md space-y-6 sm:space-y-8 animate-fade-in">
          <div className="text-center">
            <h2 className="text-2xl sm:text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">
              {dict?.forget_password?.title || "Forget Password"}
            </h2>
            <p className="text-gray-600 text-sm sm:text-sm dark:text-gray-100">
              {dict?.forget_password?.subtitle || "Enter your email to receive a reset link."}
            </p>
          </div>

          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            {errors.root && (
              <Alert showIcon className="my-2 font-medium text-sm" type="danger">
                {errors.root.message}
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
                {dict?.forget_password?.label || "Email *"}
              </label>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <div className="relative flex flex-col gap-2">
                    <Input
                      {...field}
                      type="email"
                      placeholder={dict?.forget_password?.email_placeholder || "john.doe@example.com"}
                      size="lg"
                      className="w-full"
                      invalid={!!errors.email}
                      autoComplete="email"
                      maxLength={100}
                    />
                    {errors.email && (
                      <div className="text-red-500 flex items-center gap-1 text-xs">
                        <Icon icon="mdi:warning-circle" width="15" height="15" />
                        <span>{errors.email.message}</span>
                      </div>
                    )}
                  </div>
                )}
              />
            </div>

            <Button
              size="lg"
              {...(loading && {
                icon: <Icon icon="line-md:loading-twotone-loop" width="24" height="24" />,
              })}
              disabled={loading}
              className={`w-full flex gap-2 bg-blue-900 hover:bg-black hover:text-white text-white hover:border-none justify-center rounded-lg py-3 font-medium ${
                isDarkMode ? "hover:bg-gray-600" : "hover:bg-[#101828]"
              }`}
              type="submit"
            >
              <span>{dict?.forget_password?.submit || "Submit"}</span>
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-100">
                <span className="me-2">{dict?.forget_password?.back_to || "Back to"}</span>
                <Link
                  href={`/${lang}/auth/login`}
                  className="text-gray-700 dark:text-gray-100 hover:text-blue-800 font-medium underline"
                >
                  {dict?.forget_password?.login || "Login"}
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* ✅ Celebration Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-8 w-full max-w-sm shadow-xl transform scale-90 opacity-0 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  icon="mdi:email-check-outline"
                  className="text-green-600 dark:text-green-400"
                  width="40"
                  height="40"
                />
              </div>

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {dict?.forget_password?.success_title || "Check Your Email!"}
              </h2>

              {/* Message */}
              <p className="text-gray-600 dark:text-gray-300 mb-6 px-2">
                {dict?.forget_password?.success_message ||
                  "We’ve sent a password reset link to your email. 🎉"}
              </p>

              {/* Login Button */}
              <Button
                onClick={() => router.push(`/auth/login`)}
                className="bg-blue-900 hover:bg-blue-800 text-white rounded-lg px-6 py-2.5 font-medium shadow-sm transition-all"
              >
                {dict?.forget_password?.go_to_login || "Go to Login"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}