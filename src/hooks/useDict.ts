import { useQuery } from "@tanstack/react-query";
import { fetchDict } from "@src/actions";

type SupportedLang = "en" | "ar" | "ch" | "fr" | "ge" | "ru" | "tr";

const useDictionary = (lang: SupportedLang) => {
  return useQuery({
    queryKey: ["dictionary", lang],
    queryFn: () => fetchDict(lang),
    enabled: !!lang,
    staleTime: 1000 * 60 * 5,
  });
};

export default useDictionary;
