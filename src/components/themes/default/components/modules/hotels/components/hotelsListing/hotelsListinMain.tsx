"use client";

import React, { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { HotelsListing } from "@components/themes/default";
import { hotel_search_multi } from "@src/actions";
import useHotelSearch from "@hooks/useHotelSearch";
import { setHotels } from "@lib/redux/base";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@lib/redux/store";

interface Props {
  slug?: string[];
}

const HotelsListingMain = ({ slug }: Props) => {
  const dispatch = useDispatch();
  const { hotelModuleNames } = useHotelSearch();

  const slugArr = Array.isArray(slug) ? slug : [];
  const city = slugArr[0]?.replace(/-/g, " ") ?? "";
  const isSlugValid = slugArr.length === 7 && slugArr.every(Boolean);
  const {country, currency, locale}=useAppSelector((state)=>state.root)
  const enabled = isSlugValid && !!hotelModuleNames?.length;
 const savedForm = localStorage.getItem("hotelSearchForm");
  if (!savedForm) return;
  const parsedForm: any = JSON.parse(savedForm);

  const { data, isLoading, error } = useQuery({
    queryKey: ["hotels", ...slugArr],
    queryFn: async () => {
      // queryFn will only run when `enabled` is true
      const result = await hotel_search_multi(
        {
          destination: city,
          checkin: slugArr[1],
          checkout: slugArr[2],
          rooms: Number(slugArr[3]),
          adults: Number(slugArr[4]),
          children: Number(slugArr[5]),
          nationality: slugArr[6],
          page: 1,
          price_from: "1",
          price_to: "5000",
          rating: "",
          language:locale,
          currency:currency,
           child_age: parsedForm.children_ages || [],
        },
        hotelModuleNames
      );

      return result?.success ?? [];
    },
    staleTime: 1000 * 60 * 5,
    enabled,
  });

  useEffect(() => {
    if (Array.isArray(data)) {
      dispatch(setHotels(data));
    } else {
      dispatch(setHotels([]));
    }
  }, [data, dispatch]);

  if (!slugArr.length) return null;

  if (error) return <div>Error loading hotels</div>;

  return <HotelsListing isLoading={isLoading} />;
};

export default HotelsListingMain;
