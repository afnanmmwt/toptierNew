import { useAppSelector } from "@lib/redux/store";
import React from "react";
import Image from "next/image";
import useDictionary from "@hooks/useDict";
import useLocale from "@hooks/useLocale";

const OfferSection = () => {
  const { our_services } = useAppSelector((state) => state.appData?.data || {});
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!Array.isArray(our_services) || our_services.length === 0) {
    return null;
  }

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <div className="py-6 mt-6">
        <div className="max-w-[1200px] mx-auto">
          {/*============= Heading */}
          <div className="text-center mb-12">
            <h1
              className="text-4xl text-[#112233] mb-4 font-[900]"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {dict?.offer_sec?.offer_heading || "Why Choose Us"}
            </h1>
            <p
              className="text-base sm:text-lg text-[#697488] max-w-md mx-auto mt-4 leading-relaxed px-6"
              style={{ fontFamily: "Urbanist, sans-serif" }}
            >
              {dict?.offer_sec?.offer_subheading ||
                "Experience unparalleled travel services with us, where your satisfaction is our top priority."}
            </p>
          </div>

          {/*============= Dynamic Cards */}
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center appHorizantalSpacing">
            {our_services.map((service: any, idx: number) => (
              <div
                key={idx}
                className="relative max-w-[410px] max-h-[270px] bg-[#163C8C] rounded-2xl p-6 text-white overflow-hidden"
              >
                {/*=========== Content */}
                <div className="relative z-8 text-left flex flex-col justify-between h-full">
                  <div>
                    <h3
                      className="text-2xl font-bold mb-3"
                      style={{ fontFamily: "Urbanist, sans-serif" }}
                    >
                      {service.title}
                    </h3>
                    <p
                      className={`text-blue-100 text-md leading-relaxed mb-7 max-w-[70%] line-clamp-3 ${
                        locale === "ar" ? "mr-auto" : ""
                      }`}
                      style={{ fontFamily: "Urbanist, sans-serif" }}
                      dangerouslySetInnerHTML={{ __html: service.description }}
                    />
                  </div>

                  <button
                    onClick={handleScrollToTop}
                    className={`
                      bg-white text-[#112233] cursor-pointer 
                      px-5 sm:px-6 md:px-7 py-2 sm:py-2.5 
                      rounded-full text-xs sm:text-sm md:text-base 
                      font-semibold hover:bg-gray-100 transition-colors 
                      w-fit
                      ${locale === "ar" ? "mr-auto" : ""}
                    `}
                    style={{ fontFamily: "Urbanist, sans-serif" }}
                  >
                    {service.button_text}
                  </button>
                </div>

                {/*============ Background Image */}
                {service.background_image && (
                  <div className="absolute -right-15 top-30 opacity-100">
                    <div className="opacity-100 w-[180px] h-[180px] flex items-center justify-center">
                      <Image
                        src={service.background_image}
                        alt={service.title}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover -rotate-10"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default OfferSection;