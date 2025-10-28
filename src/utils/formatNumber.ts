import { replace } from "lodash";
import numeral from "numeral";

// ----------------------------------------------------------------------

export function fCurrency(number: number) {
  return numeral(number).format(
    Number.isInteger(number) ? "PKR0,0" : "PKR0,0.00"
  );
}

export function fPercent(number: number) {
  return numeral(number / 100).format("0.0%");
}

export function fNumber(number: number) {
  return numeral(number).format();
}

export function fShortenNumber(number: number) {
  return replace(numeral(number).format("0.00a"), ".00", "");
}
export function fData(number: number) {
  return numeral(number).format("0.0 b");
}
export function formatCardNumber(value: string) {
  const val = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
  const matches = val.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || "";
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }

  if (parts.length) {
    return parts.join(" ");
  } else {
    return value;
  }
}
export function formatBankAccount(value: string): string {
  // Remove all non-numeric characters
  value = value.replace(/[^0-9]/g, "");

  // Format based on the standard pattern for bank accounts
  if (value.length <= 5) {
    return value; // Return as-is if it's too short to format
  } else if (value.length <= 12) {
    return value.replace(/^([0-9]{5})([0-9]{1,7})$/, "$1-$2");
  } else if (value.length === 13) {
    return value.replace(/^([0-9]{5})([0-9]{7})([0-9]{1})$/, "$1-$2-$3");
  } else if (value.length === 14) {
    return value.replace(
      /^([0-9]{5})([0-9]{7})([0-9]{1})([0-9]{1})$/,
      "$1-$2-$3-$4"
    );
  } else {
    return value; // Return as-is if it's longer than expected
  }
}
export function formatCNIC(value: string): string {
  // Remove all non-numeric characters
  value = value.replace(/[^0-9]/g, "");

  // Format the CNIC if it has a valid length
  if (value.length <= 5) {
    return value; // If less than or equal to 5 digits, return as is
  } else if (value.length <= 12) {
    return value.replace(/^([0-9]{5})([0-9]{1,7})$/, "$1-$2");
  } else {
    return value.replace(/^([0-9]{5})([0-9]{7})([0-9]{1})$/, "$1-$2-$3");
  }
}
export function formatMobileNumber(value: string): string {
  // Remove all non-numeric characters
  value = value.replace(/[^0-9]/g, "");

  // Format the mobile number if it has a valid length
  if (value.length <= 4) {
    return value; // Return as is for short inputs
  } else {
    return value.replace(/^([0-9]{4})([0-9]{1,7})$/, "$1-$2");
  }
}

export function formatExpires(value: string) {
  return value
    .replace(/[^0-9]/g, "")
    .replace(/^([2-9])$/g, "0$1")
    .replace(/^(1{1})([3-9]{1})$/g, "0$1/$2")
    .replace(/^0{1,}/g, "0")
    .replace(/^([0-1]{1}[0-9]{1})([0-9]{1,2}).*/g, "$1/$2");
}
