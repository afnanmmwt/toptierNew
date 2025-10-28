"use client";
// import React, { ReactElement } from "react";
// import { Icon } from "@iconify/react";
import {
  HeroSection,
  FeaturedDestinations,
  OfferSection,
  TestimonialSection,FeaturedHotels,NewsLatter,
  // HotelsListing,
  // HotelsListing

} from "@components/themes/default";
// import { baseUrl, token, siteUrl } from "@src/actions";

// import { useAppSelector } from "@lib/redux/store";
// import useLocale from "@hooks/useLocale";
// import useDictionary from "@hooks/useDict";
import useDirection from "@hooks/useDirection";
// import { HotelsListing } from "../../modules/hotels/components/hotelsListing";
// import Spinner from "@components/core/Spinner";

export default function HomeWrapper({dict}:{dict:any}) {
  // const { locale } = useLocale();
  // const { data: dict, isLoading: dictLoading } = useDictionary(locale as any);
  // const app = useAppSelector((state) => state?.appData?.data);
  const [direction] = useDirection();



  // const isFeaturesLoading = !dict ;

  return (
    <div className=" bg-white dark:bg-gray-800 min-h-full " dir={direction}>
      {/* HERO SECTION */}
      <div>
        <HeroSection />
      </div>
      {/* FEATURED destination */}
      <div>
        {/* <HotelsListing/> */}
       <FeaturedDestinations/>
      </div>
      <div>
        <FeaturedHotels/>
      </div>
      <div>
        <OfferSection/>
      </div>
      <div>
        <TestimonialSection/>
      </div>
      <div>
        <NewsLatter/>
      </div>

      <div>


        {/* {isFeaturesLoading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner />
          </div>
        ) : (
          <div className="max-w-[1200px] mx-auto">
              <div className="max-w-[1200px]  px-5 sm:px-6 md:px-8 pt-6 md:pt-12  space-y-2">
   <h2 className="text-2xl dark:text-white font-bold">{dict?.services_section?.heading || 'Features Services'}</h2>
        <p className="dark:text-gray-400">{dict?.services_section?.description || 'Explore our featured modules for the best deals and offers.'}</p>
        </div>

          </div>

        )} */}
      </div>
    </div>
  );
}
