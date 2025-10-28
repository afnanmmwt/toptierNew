"use client";

import useDictionary from "@hooks/useDict";
import useLocale from "@hooks/useLocale";
// import Alert from "@components/core/alert";
import { Icon } from "@iconify/react";
import { useAppSelector } from "@lib/redux/store";
import { subscribe_to_newsLatter } from "@src/actions";
import Image from "next/image";
import React, { useState, ChangeEvent } from "react";
import { toast } from "react-toastify";
import { z } from "zod";


interface FormData {
  name: string;
  email: string;
}

const NewsLatter: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);


  const app = useAppSelector((state) => state?.appData?.data);
  const { newsletter_description, newsletter_image, newsletter_title } = app.app
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" })); 
  };

  const handleSubmit = async () => {
    setMessage(null);

    const newsLatterSchema = z.object({
      name: z.string().min(2, dict?.news_letter_sec?.errors?.name_too_short || "Name must be at least 2 characters"),
      email: z.string().email(dict?.news_letter_sec?.errors?.email_invalid || "Invalid email address"),
    });

    try {
      newsLatterSchema.parse(formData);

      setLoading(true);
      const res = await subscribe_to_newsLatter(formData);

      if (res?.error) {
        toast.error(res.error);
        // setMessage({ type: "danger", text: res.error });
      } else {
        toast.success(dict?.footer?.success || "Subscribed successfully!");
        setFormData({ name: "", email: "" });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        // collect field errors
        const fieldErrors: Partial<FormData> = {};
        err.errors.forEach((e) => {
          const field = e.path[0] as keyof FormData;
          fieldErrors[field] = e.message;
        });
        setErrors(fieldErrors);
      } else {
        setMessage({ type: "danger", text: "Something went wrong. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  // No NewsLetter CHECK
  if (!app?.app?.newsletter_title) {
    return null;
  }

  return (
    <div className="py-4 sm:py-6 lg:py-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 appHorizantalSpacing">
          {/* Image */}
          <div className="order-2 lg:order-1">
            <div className="relative w-full h-[250px] sm:h-[320px] lg:h-[393px]">
              <Image
                src={newsletter_image || "/images/newsletter.jpg"}
                alt="Newsletter Banner"
                fill
                priority
                sizes="(max-width: 640px) 100vw,
           (max-width: 1024px) 100vw,
           1200px"
                className="object-cover rounded-[20px_50px_20px_50px] sm:rounded-[30px_70px_30px_70px] lg:rounded-[40px_100px_40px_100px]"
              />
            </div>


          </div>

          {/* Form Section */}
          <div className="flex flex-col gap-2 sm:gap-4 order-1 lg:order-2">
            <p className="text-white bg-[#0101019E] pt-1 transition text-sm font-medium px-3 max-w-30 text-center h-[29px] rounded-md mb-2">
              {dict?.news_letter_sec?.letter || "NewsLetter"}
            </p>
            <div>
              <p className="text-[28px] sm:text-[36px] lg:text-[44px] text-[#051036] font-[900] w-full lg:max-w-100 leading-13">
                {newsletter_title}
              </p>
              {/* <p className="text-[28px] sm:text-[36px] lg:text-[44px] text-[#051036] font-[900]">
                Journey Starts Here
              </p> */}
            </div>

            <p className="text-[16px] sm:text-[17px] lg:text-[18px] font-[400] text-[#697488]">
              {newsletter_description}
            </p>

            {/* Input Fields */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-4">
              {/* Name */}
              <div className="relative w-full sm:w-1/2">
                {/* <Icon
                  icon="mdi:account-outline"
                  width="20"
                  height="20"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                /> */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="14" height="17" viewBox="0 0 14 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.79251 7.05181C8.39207 7.05181 9.68878 5.75511 9.68878 4.15554C9.68878 2.55598 8.39207 1.25928 6.79251 1.25928C5.19294 1.25928 3.89624 2.55598 3.89624 4.15554C3.89624 5.75511 5.19294 7.05181 6.79251 7.05181Z" stroke="#8C96A5" strokeWidth="1.0861" />
                    <path d="M12.5851 12.4824C12.5851 14.2817 12.5851 15.7407 6.79253 15.7407C1 15.7407 1 14.2817 1 12.4824C1 10.6831 3.59361 9.22412 6.79253 9.22412C9.99146 9.22412 12.5851 10.6831 12.5851 12.4824Z" stroke="#8C96A5" strokeWidth="1.0861" />
                  </svg>

                </div>
                <input
                  type="text"
                  name={dict?.news_letter_sec?.letter_name || "name"}
                  placeholder={dict?.news_letter_sec?.letter_name_placeholder || "Name"}
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-[#F3F3F3] pl-10 px-4 h-[45px] sm:h-[47px] lg:h-[49px] rounded-lg focus:outline-none focus:ring-2 ${errors.name
                    ? "focus:ring-red-500 border border-red-500"
                    : "focus:ring-blue-500"
                    }`}
                />
                {errors.name && (
                  <p className="absolute -bottom-5 left-2 text-red-500 text-xs">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="relative w-full sm:w-1/2">
                {/* <Icon
                  icon="mdi:email-outline"
                  width="20"
                  height="20"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                /> */}
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="18" height="15" viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.3241 0.789551H14.9557C15.6676 0.789551 16.3503 1.07235 16.8537 1.57574C17.3571 2.07913 17.6399 2.76186 17.6399 3.47376V11.5264C17.6399 12.2383 17.3571 12.921 16.8537 13.4244C16.3503 13.9278 15.6676 14.2106 14.9557 14.2106H3.3241C2.61221 14.2106 1.92947 13.9278 1.42608 13.4244C0.922693 12.921 0.639893 12.2383 0.639893 11.5264V3.47376C0.639893 2.76186 0.922693 2.07913 1.42608 1.57574C1.92947 1.07235 2.61221 0.789551 3.3241 0.789551ZM3.3241 1.68429C2.87673 1.68429 2.48305 1.83639 2.17884 2.10481L9.13989 6.60534L16.1009 2.10481C15.7967 1.83639 15.4031 1.68429 14.9557 1.68429H3.3241ZM9.13989 7.68797L1.65095 2.82955C1.57937 3.02639 1.53463 3.25008 1.53463 3.47376V11.5264C1.53463 12.001 1.72316 12.4562 2.05875 12.7917C2.39435 13.1273 2.84951 13.3159 3.3241 13.3159H14.9557C15.4303 13.3159 15.8854 13.1273 16.221 12.7917C16.5566 12.4562 16.7452 12.001 16.7452 11.5264V3.47376C16.7452 3.25008 16.7004 3.02639 16.6288 2.82955L9.13989 7.68797Z" fill="#8C96A5" />
                  </svg>
                </div>
                <input
                  type="email"
                  name={dict?.news_letter_sec?.letter_email || "email"}
                  placeholder={dict?.news_letter_sec?.letter_email_placeholder || "Email"}
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-[#F3F3F3] pl-10 px-4 h-[45px] sm:h-[47px] lg:h-[49px] rounded-lg focus:outline-none focus:ring-2 ${errors.email
                    ? "focus:ring-red-500 border border-red-500"
                    : "focus:ring-blue-500"
                    }`}
                />
                {errors.email && (
                  <p className="absolute -bottom-5 left-2 text-red-500 text-xs">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-1">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-lg bg-[#163C8C] cursor-pointer text-white hover:bg-gray-800 w-full py-2 h-[45px] sm:h-[47px] lg:h-[49px] flex items-center justify-center"
              >
                {loading ? (
                  <Icon
                    icon="eos-icons:loading"
                    className="animate-spin text-white"
                    width="24"
                    height="24"
                  />
                ) : (
                  dict?.news_letter_sec?.letter_continue || "Continue"
                )}
              </button>
            </div>

            {/* Status Message using Alert */}
            {message && (
              <div className="mt-3">
                {/* <Alert type={message.type} closable showIcon>
                  {message.text}
                </Alert> */}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsLatter;
