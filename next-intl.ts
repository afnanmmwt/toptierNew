import { Pathnames, LocalePrefix } from "next-intl/routing";
export const defaultLocale = "en" as const;
export const locales = ["en", "ar", "ch", "fr", "ge", "ru", "tr"] as const;
export const pathnames: Pathnames<typeof locales> = {
  "/": "/",
};

export const localePrefix = "as-needed" as LocalePrefix;
export type Locale = (typeof locales)[number];
