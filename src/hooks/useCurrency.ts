// "use client";
// import { useAppSelector, useAppDispatch } from "@lib/redux/store";
// import { setCurrency } from "@lib/redux/base";
// import { useEffect } from "react";

// const useCurrency = () => {
//   const dispatch = useAppDispatch();
//   const currencies =
//     useAppSelector((state) => state?.appData?.data?.currencies) || [];
//   const currentCurrency = useAppSelector(
//     (state) => state?.root?.currency
//   ) as string;
//   const defaultCurrency = currencies?.find(
//     (currency: any) => currency?.default === "1"
//   );
//   const currency = currentCurrency ? currentCurrency : defaultCurrency?.name;
//   localStorage.setItem('currency', currency)
//   useEffect(() => {
//     if (currency) {
//       dispatch(setCurrency(currency));
//     }
//   }, [currency, dispatch]);

//   return { currency };
// };

// export default useCurrency;

// hooks/useCurrency.ts
"use client";
import { useAppSelector, useAppDispatch } from "@lib/redux/store";
import { setCurrency } from "@lib/redux/base";
import { useEffect, useMemo } from "react";

const useCurrency = () => {
  const dispatch = useAppDispatch();
  const currencies = useAppSelector((state) => state?.appData?.data?.currencies) || [];
  const currentCurrency = useAppSelector((state) => state?.root?.currency) as string;

  // Find default currency (e.g., USD)
  const defaultCurrency = currencies.find((c: any) => c.default === "1")?.name || "USD";
  const activeCurrency = currentCurrency || defaultCurrency;

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("currency", activeCurrency);
    dispatch(setCurrency(activeCurrency));
  }, [activeCurrency, dispatch]);

  // Get exchange rate: e.g., { USD: 1, GBP: 0.79, EUR: 0.93 }
  const exchangeRates = useMemo(() => {
    const rates: Record<string, number> = {};
    currencies.forEach((c: any) => {
      if (c.name && c.rate) {
        rates[c.name] = parseFloat(c.rate);
      }
    });
    // Ensure default currency has rate 1
    if (!rates[defaultCurrency]) rates[defaultCurrency] = 1;
    return rates;
  }, [currencies, defaultCurrency]);

  // Convert price from default currency to active currency
  const convertPrice = (priceInDefault: number): number => {
    if (!priceInDefault) return 0;
    const rate = exchangeRates[activeCurrency] || 1;
    return priceInDefault * rate;
  };

  // Format price with symbol (e.g., "£158.00")
  const priceRateConverssion = (priceInDefault: number): string => {
    const converted = convertPrice(priceInDefault);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: activeCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);
  };

  return {
    currency: activeCurrency,
    defaultCurrency,
    convertPrice,
    priceRateConverssion,
    exchangeRates,
  };
};

export default useCurrency;
