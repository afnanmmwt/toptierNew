"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchCountries } from "@src/actions";
// import { useAppSelector } from "@lib/redux/store";
// import { setCountry } from "@lib/redux/base";
// import {  useState } from "react";
// import { count } from "console";

const useCountries = () => {
  // const [countries, setCountries] = useState<any>([]);
  // const [selectedCountry, setSelectedCountry] = useState<any>(null);
  // const defaultCountry =
  //   useAppSelector((state) => state?.appData?.data?.app?.country_name) || "";
  const { data:countries, isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: Infinity,
  });
// useEffect(() => {
//   if (data) {
//     const filtered = (data as any[])
//       .filter((country) => {
//         return country.country_status === "1";
//       })
//       .map((country) => ({
//         label: country.name.toLowerCase(),

//         value: country.iso,

//       }));

//     setCountries(filtered);
//   }
// }, [data]);

//   const dispatch = useAppDispatch();
//   const currentCountry = useAppSelector(
//     (state) => state?.root?.country
//   ) as string;
//   const country = currentCountry;

//   useEffect(() => {
//     const select = countries.find((con: { label: string; value: string }) => {
//       return con.label === defaultCountry || con.value === country;
//     });
//     if (select) {
//       setSelectedCountry(select);
//     }
//   }, [country, countries, isLoading, defaultCountry]);
//   useEffect(() => {
//     if (country) {
//       dispatch(setCountry(country));
//     }
//   }, [country, dispatch]);
  return { countries, isLoading};
};

export default useCountries;
