// utils/currency.ts
export default function getCurrencySymbol(code: string): string {
  if (!code) return "";

  const map: Record<string, string> = {
    usd: "USD",    // US Dollar
    eur: "EUR",    // Euro
    gbp: "GBP",    // British Pound
    jpy: "JPY",    // Japanese Yen
    aud: "AUD",   // Australian Dollar
    cad: "CAD",   // Canadian Dollar
    chf: "CHF",  // Swiss Franc
    cny: "CNY",    // Chinese Yuan
    hkd: "HKD",  // Hong Kong Dollar
    nzd: "NZD",  // New Zealand Dollar
    sek: "SEK",   // Swedish Krona
    krw: "KRW",    // South Korean Won
    sgd: "SGD",   // Singapore Dollar
    nok: "NOK",   // Norwegian Krone
    mxn: "MXN", // Mexican Peso
    inr: "INR",    // Indian Rupee
    rub: "RUB",    // Russian Ruble
    zar: "ZAR",    // South African Rand
    try: "TRY",    // Turkish Lira
    brl: "BRL",   // Brazilian Real

    // 🔹 Riyal / Rial
    sar: "SAR",    // Saudi Riyal
    qar: "﷼",    // Qatari Riyal
    omr: "﷼",    // Omani Rial

    // 🔹 Dinar
    kwd: "kd",   // Kuwaiti Dinar
    bhd: "bd",   // Bahraini Dinar
    jod: "jd",   // Jordanian Dinar
    iqd: "ع.د",  // Iraqi Dinar

    // 🔹 Extra (common in hotels/travel)
    aed: "د.إ",  // UAE Dirham
    egp: "£",    // Egyptian Pound
    lkr: "₨",    // Sri Lankan Rupee
  };

  return map[code.toLowerCase()] || code;
}
