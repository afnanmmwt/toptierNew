"use client";
import { useAppSelector, useAppDispatch } from "@lib/redux/store";
import { usePathname } from "next/navigation";
import { setLocale } from "@lib/redux/base";
import { useEffect } from "react";

const useLocale = () => {
  const dispatch = useAppDispatch();
  const languages =
    useAppSelector((state) => state?.appData?.data?.languages) || [];
  const currentLang = useAppSelector((state) => state?.root?.locale) as string;
  const pathname = usePathname();

  // Get first segment from path
  const segments = pathname.split("/").filter(Boolean);
  const urlLocale = segments[0];

  // Find language by code
  const foundLang = languages?.find(
    (lang: any) => lang.language_code === urlLocale
  );
  // Find default language
  const defaultLang = languages?.find((lang: any) => lang.default === "1");
  const locale = foundLang
    ? foundLang.language_code
    : defaultLang
    ? defaultLang.language_code
    : currentLang;

  // Set locale in Redux if changed
  useEffect(() => {
    if (locale && locale !== currentLang) {
      dispatch(setLocale(locale));
    }
  }, [locale, currentLang, dispatch]);
  return {
    locale,
  };
};

export default useLocale;
