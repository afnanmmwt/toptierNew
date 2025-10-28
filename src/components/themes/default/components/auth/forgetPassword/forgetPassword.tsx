
// "use client";
// import { Icon } from "@iconify/react";

// import { useState, useCallback } from "react";

// import useDirection from "@hooks/useDirection";
// import { useParams ,useRouter} from "next/navigation";
// import { useAppSelector } from "@lib/redux/store";
// // Add imports for react-hook-form, zod, and Input
// import { z as zod } from "zod";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Input from "@components/core/input";
// import { useMutation } from "@tanstack/react-query";
// import { forget_password } from "@src/actions";
// import Alert from "@components/core/alert";
// // import { set } from "lodash";
// import Link from "next/link";
// import Button from "@components/core/button";
// import useDarkMode from "@hooks/useDarkMode";



// const schema = zod.object({
//   email: zod.string().min(1, { message: 'Email is required' }).email(),
// });
// type Values = zod.infer<typeof schema>;
// const defaultValues = { email: '', } satisfies Values;

// export default function ForgetPassword({ ...props }: { dict?: any }) {
//   // const { isLoginPending, login } = useAuth();
//   const [isDarkMode] = useDarkMode();
//   // const app = useAppSelector((state) => state?.appData?.data);
//   // const [direction] = useDirection();
//   const { lang } = useParams();
//   const { dict } = props
//   const [loading, setLoading] = useState<boolean>(false);
//   const router = useRouter();

//   // Use react-hook-form
//   const {
//     control,
//     handleSubmit,
//     setError,
//     formState: { errors },
//   } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });
//   const mutate = useMutation({
//     mutationFn: forget_password,
//     onSuccess: (data) => {
//       if (data.error) {
//         const message = data.error;
//         if (message) {
//           setError("root", { type: "manual", message });
//         }
//         setLoading(false);
//         return;
//       } else if (data?.status && data?.is_email_sent) {
//         // show any success mesg in toastify


//       }

//       router.push(`/${lang}/auth/login`);
//     }
//   })

//   // Submission handler
//   const onSubmit = useCallback(
//     async (values: Values): Promise<void> => {
//       setLoading(true);
//       const { error } = await mutate.mutateAsync({
//         email: values.email,
//       });
//     },
//     [router, setError]
//   );

//   return (
//     <div className="relative w-full  flex flex-col justify-between h-full  ">
//       {/* Left Side - Form */}
//       <div className="w-full relative h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900">
//         <div className="w-full  max-w-md space-y-6 sm:space-y-8 animate-fade-in">
//           <div className="text-center">
//             <h2 className="text-2xl sm:text-2xl font-bold text-gray-900 mb-2 dark:text-gray-100">
//               {dict?.forget_passForm?.title || "Forget Password"}
//             </h2>
//             <p className="text-gray-600 text-sm sm:text-sm dark:text-gray-100">
//               {dict?.forget_passForm?.subtex || "Welcome back! Please enter your details."}
//             </p>
//           </div>

//           <form
//             className="space-y-4 sm:space-y-6"
//             onSubmit={handleSubmit(onSubmit)}
//             noValidate
//           >
//             {errors.root ? <Alert showIcon className="my-2 font-medium text-sm" type="danger">{errors.root.message}</Alert> : null}

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-100 mb-2">
//                 {dict?.forget_passForm?.email_title || "Email *"}
//               </label>
//               <Controller
//                 name="email"
//                 control={control}
//                 render={({ field }) => (
//                   <div className="relative flex flex-col gap-2">
//                     <Input
//                       {...field}
//                       type="email"
//                       placeholder={
//                         dict?.forget_passForm?.email_placeholder || "john.doe@example.com"
//                       }
//                       size="lg"
//                       className="w-full"
//                       invalid={!!errors.email}
//                       autoComplete="email"
//                       maxLength={100}
//                       required
//                     />
//                     {errors.email && (
//                       <div className="text-red-500 flex items-center gap-1 text-xs">
//                         <span>
//                           <Icon icon="mdi:warning-circle" width="15" height="15" />
//                         </span>
//                         <span>{errors.email.message}</span>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               />
//             </div>

//             {/* <button
//               type="submit"
//               // disabled={isLoginPending}
//               className="w-full bg-blue-600  py-3 px-6 font-medium flex items-center
//                 hover:bg-gray-800 hover:border-gray-300 border border-gray-200 rounded-lg text-white
//                 dark:border-gray-600  dark:hover:bg-gray-700 dark:hover:border-gray-500
//                 justify-center gap-2  focus:outline-none cursor-pointer transition-all duration-200"
//             > */}
//             {/* { loading ?  icon: <Icon icon="line-md:loading-twotone-loop" width="24" height="24" />

//                 // ? ( dict?.forget_passForm?.login_loading || "Logging in...")
//                 : ( dict?.forget_passForm?.btn_text || "Send Code")}
//             </button> */}
//             <Button size="lg"

//               {...(loading && {
//                 icon: <Icon icon="line-md:loading-twotone-loop" width="24" height="24" />
//               })}

//               disabled={loading} variant="solid" className={`w-full flex gap-2 justify-center rounded-lg py-3 font-medium  ${isDarkMode ? "hover:bg-gray-600" : "hover:bg-[#101828]"}`} type="submit">
//               <span>{dict?.forget_passForm?.btn_text || "Send Code"}</span>
//               {/* <Icon icon="mdi:arrow-right" width="20" height="20" /> */}
//             </Button>

//             <div className="text-center mt-4">
//               <p className="text-sm text-gray-600 dark:text-gray-100 ">
//                 <span className="me-2">{dict?.forget_passForm?.back_to || "Back to"}</span>
//                 <Link
//                   href={`/${lang}/auth/login`}

//                   className="text-gray-700 dark:text-gray-100 hover:text-blue-800 font-medium underline"
//                 >
//                   {dict?.forget_passForm?.login || "Login"}
//                 </Link>
//               </p>
//             </div>
//           </form>

//         </div>
//       </div>

//       {/* Right Side - Hero Section */}
//       <div className="  pb-15 left-0  w-full flex  gap-2 text-xs justify-center  text-gray-500">
//         <span className="border-r-gray-400 h-5"> {dict?.forget_passForm?.policy?.policy || "Privacy Policy"}</span>|
//         <span>{dict?.forget_passForm?.policy?.terms || "Terms and Conditions"}</span>|
//         <span>{dict?.forget_passForm?.policy?.status || "System Status"}</span>
//       </div>
//     </div>
//   );
// }
