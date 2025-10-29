"use client";

import React, { useEffect, useState } from "react";
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
  const { currency, locale } = useAppSelector((state) => state.root);

  //  Move localStorage logic inside component render, but AFTER hooks
  const [savedForm, setSavedForm] = useState<string | null>(null);

  useEffect(() => {
    //  Client-side only: safe to access localStorage here
    const form = localStorage.getItem("hotelSearchForm");
    setSavedForm(form);
  }, []);

  

  const enabled = savedForm && isSlugValid && !!hotelModuleNames?.length;

  const parsedForm = savedForm ? JSON.parse(savedForm) : null;

  const { data, isLoading, error } = useQuery({
    queryKey: ["hotels", ...slugArr],
    queryFn: async () => {
      if (!parsedForm) return [];
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
          language: locale,
          currency: currency,
          child_age: parsedForm.children_ages || [],
        },
        hotelModuleNames
      );
      return result?.success ?? [];
    },
    staleTime: 1000 * 60 * 5,
    enabled: !!enabled,
  });

  useEffect(() => {
    if (Array.isArray(data)) {
      dispatch(setHotels(data));
    } else {
      dispatch(setHotels([]));
    }
  }, [data, dispatch]);

  
  if (!savedForm) {
    return null; 
  }

  if (!slugArr.length) return null;
  if (error) return <div>Error loading hotels</div>;

  return <HotelsListing isLoading={isLoading} />;
};

export default HotelsListingMain;