// eslint-disable-next-line import/no-unresolved
import "server-only";
import type { Locale } from "../next-intl";

const dictionaries = {
  en: () =>
    import("./dictionaries/en/en.json").then((module) => module.default),
  ar: () =>
    import("./dictionaries/ar/ar.json").then((module) => module.default),
  tr: () =>
    import("./dictionaries/tr/tr.json").then((module) => module.default),
  ch: () =>
    import("./dictionaries/ch/ch.json").then((module) => module.default),
  ru: () =>
    import("./dictionaries/ru/ru.json").then((module) => module.default),
  ge: () =>
    import("./dictionaries/ge/ge.json").then((module) => module.default),


};

export const getDictionary = async (locale: Locale) => {
  const dictLoader = dictionaries[locale as keyof typeof dictionaries];
  if (dictLoader) {
    return await dictLoader();
  }
  return await dictionaries.en();
};
