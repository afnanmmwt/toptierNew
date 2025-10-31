"use client";

import useDictionary from "@hooks/useDict";
import useLocale from "@hooks/useLocale";
import { useAppSelector } from "@lib/redux/store";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";

const TestimonialSection = () => {
  const ChevronLeft = () => (
    <svg
      width="11"
      height="10"
      className="rotate-180"
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.333984 5.83724H10.4757L7.49232 8.82891L8.66732 10.0039L12.9602 5.71101C13.3507 5.32049 13.3507 4.68732 12.9602 4.2968L8.66732 0.00390625L7.49232 1.17891L10.4757 4.17057H0.333985L0.333984 5.83724Z"
        fill="#0F1112"
      />
    </svg>
  );

  const ChevronRight = () => (
    <svg
      width="11"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.333984 5.83724H10.4757L7.49232 8.82891L8.66732 10.0039L12.9602 5.71101C13.3507 5.32049 13.3507 4.68732 12.9602 4.2968L8.66732 0.00390625L7.49232 1.17891L10.4757 4.17057H0.333985L0.333984 5.83724Z"
        fill="#0F1112"
      />
    </svg>
  );

  const Star = ({ className }: { className: string }) => (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const testimonials = useAppSelector(
    (state) => state.appData?.data?.testimonials || []
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();
  const { data: dict } = useDictionary(locale as any);

  const isRTL = ["ar", "ur", "fa", "he"].includes((locale as string) || "");

  const items = testimonials || [];
  const totalItems = items.length;

  // Create 3x cloned items for infinite loop
  const extendedItems = totalItems > 1 ? [...items, ...items, ...items] : items;
  const middleStartIndex = totalItems; // Start at beginning of middle copy

  // Detect mobile
  useEffect(() => {
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
      }
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, [isMobile]);

  // Initialize to middle copy
  useEffect(() => {
    if (totalItems > 1) {
      setCurrentIndex(middleStartIndex);
    }
  }, [totalItems]);

  // Autoplay for mobile
  useEffect(() => {
    if (isMobile && totalItems > 1) {
      const startAutoplay = () => {
        autoplayRef.current = setInterval(() => {
          goToNext();
        }, 3000);
      };

      const stopAutoplay = () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
          autoplayRef.current = null;
        }
      };

      startAutoplay();

      const handleTouchStart = () => stopAutoplay();
      const handleTouchEnd = () => setTimeout(startAutoplay, 2000);

      document.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchend", handleTouchEnd);

      return () => {
        stopAutoplay();
        document.removeEventListener("touchstart", handleTouchStart);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [isMobile, totalItems]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      if (transitionTimeoutRef.current)
        clearTimeout(transitionTimeoutRef.current);
    };
  }, []);

  const goToNext = () => {
    if (isTransitioning || totalItems <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);

    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);

      // Reset to middle copy if we've scrolled past it
      if (currentIndex + 1 >= 2 * totalItems) {
        setCurrentIndex(middleStartIndex);

        if (carouselRef?.current) {
          const el = carouselRef.current;
          el.style.transition = "none";
          el.style.transform = `translateX(-${
            middleStartIndex * (isMobile ? 100 : 60)
          }%)`;
          void el.offsetHeight; // force reflow
          el.style.transition = "";
        }
      }
    }, 500);
  };

  const goToPrev = () => {
    if (isTransitioning || totalItems <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);

    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);

      // Reset to middle copy if we've scrolled before it
      if (currentIndex - 1 < middleStartIndex) {
        setCurrentIndex(2 * totalItems - 1);
        if (carouselRef.current) {
          carouselRef.current.style.transition = "none";
          carouselRef.current.style.transform = `translateX(-${
            (2 * totalItems - 1) * (isMobile ? 100 : 60)
          }%)`;
          void carouselRef.current.offsetHeight;
          carouselRef.current.style.transition = "";
        }
      }
    }, 500);
  };

  const goToSlide = (index: number) => {
    if (isTransitioning || totalItems <= 1) return;

    setIsTransitioning(true);
    setCurrentIndex(middleStartIndex + index);

    transitionTimeoutRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  const getCurrentRealIndex = () => {
    if (totalItems <= 1) return 0;
    return (currentIndex - middleStartIndex + totalItems) % totalItems;
  };

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rounded ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  // No testimonials
  if (!Array.isArray(testimonials) || testimonials.length === 0) return null;
  if (totalItems === 0) return null;

  // Single item case
  if (totalItems === 1) {
    const testimonial = items[0];
    return (
      <div
        className="max-w-[1200px] mx-auto appHorizantalSpacing py-8 sm:py-12 lg:py-16 bg-white"
        style={{ fontFamily: "Urbanist, sans-serif" }}
      >
        <div
          dir={isRTL ? "rtl" : undefined}
          className="bg-[#F5F6F7] rounded-2xl p-4 sm:p-6 lg:p-8 min-h-[350px] sm:min-h-[390px] relative overflow-hidden border border-gray-100"
        >
          <div className="flex md:block items-start gap-3 md:gap-0 mb-4">
            <Image
              src={testimonial.profile_photo || "/images/default-user.jpg"}
              alt={testimonial.name || "User"}
              width={64}
              height={64}
              className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover shadow-sm flex-shrink-0 md:mb-4"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/images/default-user.jpg";
              }}
            />
            <div className="flex-1 md:flex-none min-w-0">
              <h3 className="text-lg md:text-xl font-bold text-black mb-1 md:mb-2 truncate md:truncate-none">
                {testimonial.name}
              </h3>
              <div className="flex items-center gap-1 mb-2 md:mb-4">
                {renderStars(parseFloat(testimonial.ratings))}
              </div>
            </div>
          </div>

          <div className="relative z-10 md:w-[60%] md:pr-4">
            <h4 className="text-lg md:text-xl font-bold text-black mb-3 leading-tight">
              {testimonial.title}
            </h4>
            <p
              className="text-[#4B5154] text-base md:text-lg leading-relaxed mb-4 md:mb-0 md:line-clamp-3 md:w-[80%]"
              dangerouslySetInnerHTML={{ __html: testimonial.description }}
            />
          </div>

          {testimonial.photo && (
            <div
              className={`absolute hidden md:block top-2 bottom-2 ${
                isRTL ? "left-2.5" : "right-2.5"
              } w-[50%] h-[370px]`}
            >
              <Image
                src={testimonial.photo}
                alt={`${testimonial.name} testimonial image`}
                fill
                className="rounded-lg object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Multiple items - infinite carousel
  return (
    <div
      className="max-w-[1200px] mx-auto appHorizantalSpacing py-8 sm:py-12 lg:py-16 bg-white"
      style={{ fontFamily: "Urbanist, sans-serif" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 sm:mb-12 gap-6 sm:gap-8">
        <div className="flex-1">
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-[900] text-[#051036] lg:mb-2"
            dir={isRTL ? "rtl" : undefined}
          >
            {dict?.testi_sec?.testi_heading || "What Our"} <br />
            {dict?.testi_sec?.testi_heading_2 || "Guests Are Saying"}
          </h2>
        </div>
        <div className="flex-1 sm:max-w-md">
          <p
            className="text-base sm:text-lg text-[#697488] max-w-md mx-auto mt-4 leading-relaxed px-6"
            style={{ fontFamily: "Urbanist, sans-serif" }}
            dir={isRTL ? "rtl" : undefined}
          >
            {dict?.testi_sec?.testi_subheading ||
              "See why travelers trust us — real reviews of comfort, convenience, and unforgettable stays"}
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="overflow-hidden">
          {/* Keep the moving track LTR so translateX(-…) logic remains valid in RTL */}
          <div dir="ltr">
            <div
              ref={carouselRef}
              className={`flex transition-transform duration-500 ease-in-out ${
                isTransitioning ? "pointer-events-none" : ""
              }`}
              style={{
                transform: `translateX(-${
                  currentIndex * (isMobile ? 100 : 60)
                }%)`,
              }}
            >
              {extendedItems.map((testimonial: any, index: number) => (
                <div
                  key={`${testimonial?.id ?? "t"}-${index}`}
                  className="flex-shrink-0 px-2 sm:px-3"
                  style={{ width: isMobile ? "100%" : "60%" }}
                >
                  {/* Content back to RTL if needed */}
                  <div
                    dir={isRTL ? "rtl" : undefined}
                    className="bg-[#F5F6F7] rounded-2xl p-4 sm:p-6 lg:p-8 min-h-[350px] sm:min-h-[390px] relative overflow-hidden border border-gray-100"
                  >
                    <div className="flex md:block items-start gap-3 md:gap-0 mb-4">
                      <Image
                        src={
                          testimonial.profile_photo ||
                          "/images/default-user.jpg"
                        }
                        alt={testimonial.name || "User"}
                        width={64}
                        height={64}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover shadow-sm flex-shrink-0 md:mb-4"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/images/default-user.jpg";
                        }}
                      />
                      <div className="flex-1 md:flex-none min-w-0">
                        <h3 className="text-lg md:text-xl font-bold text-black mb-1 md:mb-2 truncate md:truncate-none">
                          {testimonial.name}
                        </h3>
                        <div className="flex items-center gap-1 mb-2 md:mb-4">
                          {renderStars(parseFloat(testimonial.ratings))}
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 md:w-[60%] md:pr-4">
                      <h4 className="text-lg md:text-xl font-bold text-black mb-3 leading-tight">
                        {testimonial.title}
                      </h4>
                      <p
                        className="text-[#4B5154] text-base md:text-lg leading-relaxed mb-4 md:mb-0 md:line-clamp-3 md:w-[80%]"
                        dangerouslySetInnerHTML={{
                          __html: testimonial.description,
                        }}
                      />
                    </div>

                    {testimonial.photo && (
                      <div
                        className={`absolute hidden md:block top-2 bottom-2 ${
                          isRTL ? "left-2.5" : "right-2.5"
                        } w-[50%] h-[370px]`}
                      >
                        <Image
                          src={testimonial.photo}
                          alt={`${testimonial.name} testimonial image`}
                          fill
                          className="rounded-lg object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div
          className={`hidden md:block absolute top-1/2 -translate-y-1/2 z-20 ${
            isRTL ? "-left-5" : "-left-3"
          }`}
        >
          <button
            onClick={isRTL ? goToPrev : goToNext}
            disabled={isTransitioning}
            className="bg-[#E5E5E5] shadow-xl cursor-pointer rounded-full p-4 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            <ChevronLeft />
          </button>
        </div>

        <div
          className={`hidden md:block absolute top-1/2 -translate-y-1/2 z-20 
            ${
            isRTL ? "-right-6" : "-right-6"
          }`}
        >
          <button
           onClick={isRTL ? goToNext : goToPrev}
            disabled={isTransitioning}
            className="bg-[#E5E5E5] shadow-xl cursor-pointer rounded-full p-4 hover:bg-gray-300 transition-colors disabled:opacity-50"
          >
            <ChevronRight />
          </button>
        </div>

        {/* Mobile Dots */}
        <div className="flex md:hidden justify-center mt-6 gap-2">
          {items.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === getCurrentRealIndex() ? "bg-gray-800" : "bg-gray-300"
              } disabled:opacity-50`}
            />
          ))}
        </div>

        {isMobile && totalItems > 1 && (
          <div className="flex md:hidden justify-center mt-2">
            <div className="text-xs text-gray-500">
              {dict?.testi_sec?.testi_autoplay ||
                "Auto-playing • Touch to pause"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestimonialSection;
