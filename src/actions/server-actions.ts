"use server";
import { createSession, getSession, logout } from "@lib/session";
import { baseUrl, api_key } from "./actions";
import { decodeBearerToken } from "@src/utils/decodeToken";
import { cookies, headers } from "next/headers";
import { userInfo } from "os";
import { z } from 'zod';
import { json } from "stream/consumers";
// console.log("base",baseUrl);


// ============== COMMON HEADER ================
export async function getHeaders(contentType: string = "application/x-www-form-urlencoded") {
  // const domain = await getDomain();

  const headers: Record<string, string> = {
    Accept: "application/json",
    // Authorization: `Bearer ${token}`,
  };
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  return headers;
}
// ---------------- Fetch App Data ---------------- //
// define what your session looks like
interface SessionUser {
  user?: {
    id?: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    // ... add other fields you need
  };
  iat?: number;
  exp?: number;
}


interface appDataPayload {
  language: string;
  currency: string;
}
export const fetchAppData = async (payload: appDataPayload) => {
  try {
    // explicitly type userinfo
    const userinfo = (await getSession()) as SessionUser | null;
    const user_id = userinfo?.user?.user_id ?? "";
    const formData = new FormData();
    formData.append("api_key", api_key ?? "");
    formData.append("language", payload.language);
    formData.append("currency", payload.currency);

    if (user_id) {
      formData.append("user_id", user_id);
    }
    const response = await fetch(`${baseUrl}/app`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }
    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};

//--------------------------- FETCH COUNTRY LIST ----------------------//

export const fetchCountries = async () => {
  try {
    const formData = new FormData();
    formData.append("api_key", api_key ?? "");

    const response = await fetch(`${baseUrl}/countries`, {
      method: "POST",
      body: formData,
      headers: await getHeaders("application/json"), // do NOT set Content-Type manually
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};
//=============== FETCH HOTEL DESTINATIN FOR HOTEL SEARCH ==================
export const fetchHotelsLocations = async (city: string) => {
  try {
    const url = new URL(`${baseUrl}/hotels_locations`);
    url.searchParams.append("city", city); // attach query param

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};
//================ NEWSLATTER =========================
interface Payload {
  name: string;
  email: string;
}

export const subscribe_to_newsLatter = async (payload: Payload) => {
  try {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("email", payload.email);

    const response = await fetch(`${baseUrl}/newsletter-subscribe`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};
//================ NEWSLATTER =========================
interface newsLaterPayload {
  item_id: string;
  module: string;
  user_id: string;
}

export const addToFavourite = async (payload: newsLaterPayload) => {
  try {
    const formData = new FormData();
    formData.append("item_id", payload.item_id);
    formData.append("module", payload.module);
    formData.append("user_id", payload.user_id);

    const response = await fetch(`${baseUrl}/favourites`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};
// ---------------------------- FETCH DISTINATION FOR FLIGHT INPUT ------------------------//

export const fetchDestinations = async (city: string) => {
  try {
    const formData = new FormData();
    formData.append("city", city); // <-- Make sure to send the city

    const response = await fetch(`${baseUrl}/flights-cities`, {
      method: "POST",
      body: formData,
      headers: await getHeaders("application/json"),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }
    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};

//---------------------------- SIGN UP --------------------------------------//
export const sign_up = async (signUpData: {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone_country_code: number | string;
  password: string;
  // terms?: boolean;
}) => {
  try {
    const formData = new FormData();
    formData.append("first_name", signUpData.first_name);
    formData.append("last_name", signUpData.last_name);
    formData.append("email", signUpData.email);
    formData.append("phone", signUpData.phone);
    formData.append("phone_country_code", String(signUpData.phone_country_code));
    formData.append("password", signUpData.password);
    formData.append("api_key", api_key ?? "");
    formData.append("user_type", "agent");

    // if (signUpData.terms !== undefined) {
    //   formData.append("terms", signUpData.terms ? "1" : "0");
    // }

    const response = await fetch(`${baseUrl}/signup`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};

//---------------------------- LOGIN --------------------------------------//
// export const signIn = async (payload: { email: string; password: string }) => {
//   try {
//     const formData = new FormData();
//     formData.append("email", payload.email);
//     formData.append("password", payload.password);
//     formData.append("api_key", api_key ?? ""); //  add api_key if needed
//     const response = await fetch(`${baseUrl}/login`, {
//       method: "POST",
//       body: formData,
//       //  don't set Content-Type, browser sets it for FormData
//     });

//     const data = await response.json().catch(() => null);
//     if (!response.ok || data?.status === false) {
//       return { error: data?.message || "Something went wrong" };
//     }
//     const userinfo = data?.data;
//     // const user = decodeBearerToken(data.data);
//     await createSession(userinfo);
//     //   const cookie = await cookies();
//     //     const token = await cookie.get('access-token')?.value || '';
//     // const saveed_token=await save_token({user_id:userinfo.user_id, token:token})
//     // // return { success: "Logged in successfully" };
//     // console.log("sign in user info", saveed_token);
//     return data;
//   } catch (error) {
//     return { error: (error as Error).message || "An error occurred" };
//   }
// };



const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type SignInState =
  | { success: true }
  | { success: false; error: string };

export async function signIn(
  prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate
    signInSchema.parse({ email, password });

    // Call your API


    const body = new FormData();
    body.append('email', email);
    body.append('password', password);
    if (api_key) body.append('api_key', api_key);

    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      body,
    });

    const data = await response.json();

    if (!response.ok || data?.status === false) {
      return { success: false, error: data?.message || 'Invalid credentials' };
    }
    // ✅ Create session (this runs on server, so cookies() works!)
    await createSession(data.data);
    await save_token();
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input' };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
}
export const signOut = async () => {
   const userinfo = (await getSession()) as any | null;

  try {
    //  Ensure user_id is always a string
    const userId =
      typeof userinfo === 'object' && userinfo !== null
        ? (userinfo.user_id || userinfo?.user?.user_id || '')
        : '';
 const cookie = await cookies();
  const token = cookie.get('access-token')?.value || '';
    const formData = new FormData();
    formData.append('user_id', String(userId)); //always a string
    formData.append('token', String(token));
    const response = await fetch(`${baseUrl}/logout`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json().catch(() => null);
     await logout();
    if (!response.ok || data?.status === false) {
      return { error: data?.message || 'Something went wrong' };
    }
    return { success: "Logged out successfully" };
  } catch (error) {
    return { error: (error as Error).message || 'An error occurred' };
  }
};
export const getUser = async () => {
  const session = await getSession();
  return session?.user;
};
//------------- SAVE TOKEN --------------------//
export const save_token = async () => {
   const userinfo = (await getSession()) as any | null;
  const cookie = await cookies();
  const token = cookie.get('access-token')?.value || '';
  try {
    //  Ensure user_id is always a string
    const userId =
      typeof userinfo === 'object' && userinfo !== null
        ? (userinfo.user_id || userinfo?.user?.user_id || '')
        : '';

    const formData = new FormData();
    formData.append('user_id', String(userId)); // ✅ always a string
    formData.append('token', String(token));

    const response = await fetch(`${baseUrl}/save_token`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || 'Something went wrong' };
    }
    return data;
  } catch (error) {
    return { error: (error as Error).message || 'An error occurred' };
  }
};
//------------------------ VERIFY_TOKEN -----------------------------//
export const verify_token = async () => {
   const userinfo = (await getSession()) as any | null;
  const cookie = await cookies();
  const token = cookie.get('access-token')?.value || '';

  try {
    //  Ensure user_id is always a string
    const userId =
      typeof userinfo === 'object' && userinfo !== null
        ? (userinfo.user_id || userinfo?.user?.user_id || '')
        : '';

    const formData = new FormData();
    formData.append('user_id', String(userId)); // ✅ always a string
    formData.append('token', String(token));
   console.log("verifying token for user server action:", formData);
    const response = await fetch(`${baseUrl}/verify_token`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
      return { error: data || 'Something went wrong' };
    }
    return data;
  } catch (error) {
    return { error: error || 'An error occurred' };
  }
};
export const getAccessToken = async () => {
  const cookie = await cookies();
  const token = cookie.get('access-token')?.value || '';
  return token;
};
//------------------------ FORGET PASSWORD -----------------------------//
export const forget_password = async (payload: {
  email: string;

  // terms: boolean;
}) => {
  try {
    const response = await fetch(`${baseUrl}/forget-password`, {
      method: "POST",
      body: new URLSearchParams({
        email: payload.email,
        // terms: signUpData.terms.toString(),
      }).toString(),
      headers: await getHeaders("application/x-www-form-urlencoded"),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};

// --------------------- ACTIVATE ACCOUNT --------------------------------------//
export const activate_account = async (payload: {
  user_id: string;
  email_code: string;
}) => {
  try {
    const formData = new FormData();
    formData.append("user_id", payload.user_id);
    formData.append("email_code", payload.email_code);
    // formData.append("api_key", api_key ?? ""); // ✅ if your API always needs api_key

    const response = await fetch(`${baseUrl}/activation`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};



//====================== CHANGE PASSWORD =========================//

export const change_password = async (payload: {
  user_id: string;
  old_pass: string;
  new_pass: string;
  c_pass: string;
}) => {
  try {
    const response = await fetch(`${baseUrl}/update-password`, {
      method: "POST",
      body: new URLSearchParams({
        ...payload,
      }).toString(),
      headers: await getHeaders("application/x-www-form-urlencoded"),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};



// for multi models
interface HotelSearchPayload {
  destination: string;
  checkin: string;
  checkout: string;
  rooms: number;
  adults: number;
  children: number;
  nationality: string;
  page: number;
  price_from: string;
  price_to: string;
  rating: string;
  language:string;
  currency:string;
  child_age?: string[];
  // Remove `modules` from this interface if you're handling it externally
}
// This function handles ONE module
export const hotel_search = async (payload: HotelSearchPayload & { modules: string }) => {
  const formData = new FormData();
  formData.append("city", String(payload.destination));
  formData.append("checkin", payload.checkin);
  formData.append("checkout", payload.checkout);
  formData.append("rooms", String(payload.rooms));
  formData.append("adults", String(payload.adults));
  formData.append("childs", String(payload.children));
  formData.append("nationality", payload.nationality);
  formData.append("language", payload.language);
  formData.append("currency", payload.currency);
  formData.append("module_name", payload.modules); //  single module
  formData.append("pagination", String(payload.page));
  formData.append("price_from", payload.price_from || "");
  formData.append("price_to", payload.price_to || "");
  formData.append("price_low_to_high", "");
  formData.append("rating", payload.rating || "");
  if (payload.child_age && payload.child_age.length > 0) {
    const formattedAges = payload.child_age.map((age) => ({ ages: age }));
    formData.append("child_age", JSON.stringify(formattedAges));
  } else {
    formData.append("child_age", "[]"); // send empty array if no children
  }

  try {
    const response = await fetch(`${baseUrl}/hotel_search`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });
    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong", module: payload.modules };
    }

    return { ...data, module: payload.modules }; //  attach module name to result
  } catch (error) {
    return { error: (error as Error).message || "An error occurred", module: payload.modules };
  }
};
// New function: accepts array of modules
export const hotel_search_multi = async (
  basePayload: Omit<HotelSearchPayload, "modules">,
  modules: string[]
) => {
  if (!modules?.length) {
    throw new Error("At least one module is required");
  }
  const promises = modules.map((module) =>
    hotel_search({
      ...basePayload,
      modules: module, // pass single module
    })
  );

  // Use allSettled to avoid one failure breaking all
  const results = await Promise.allSettled(promises);
// console.log('successful hotels', JSON.parse(results));
  // console.log('multi search result ', results)
  const successful = results
    .map((result) => {
      if (result.status === "fulfilled") {
        const value = result.value;
        if (!value.error && value.response?.length) {
          return value.response; //  just hotels
        }
      }
      return null;
    })
    .filter(Boolean) // remove nulls
    .flat(); // flatten into single array

  return {
    success: successful,
    total: successful.length,
  };
};
//====================== HOTEL DETAILS ===================
interface HotelDetailsPayload {
  hotel_id: string;
  checkin: string;
  checkout: string;
  rooms: number;
  adults: number;
  childs: number;
  child_age: string[];
  nationality: string;
  language: string;
  currency: string;
  supplier_name: string;
}

export const hotel_details = async (payload: HotelDetailsPayload) => {
  try {
    const formData = new FormData();
    //  match exactly with API keys
    formData.append("hotel_id", String(payload.hotel_id));
    formData.append("checkin", payload.checkin);
    formData.append("checkout", payload.checkout);
    formData.append("rooms", String(payload.rooms));
    formData.append("adults", String(payload.adults));
    formData.append("childs", String(payload.childs));
    formData.append("nationality", payload.nationality || "PK");
    formData.append("language", payload.language || "en");
    formData.append("currency", payload.currency || "usd");
    formData.append("supplier_name", payload.supplier_name || "");
    formData.append("child_age","0" );
     if(payload.child_age && payload.child_age.length > 0) {
    const formattedAges = payload.child_age.map((age: string) => ({ ages: age }));
    formData.append("child_age", JSON.stringify(formattedAges));
  } else {
    formData.append("child_age", "[]"); // send empty array if no children
  }
    const response = await fetch(`${baseUrl}/hotel_details`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};

// ================ COMPLETE BOOKING API ======================
interface RoomData {
  id: string;
  name: string;
  price: string;
  currency: string;
}

interface BookingData {
  ResultId: string;
  TokenId: string;
  TrackingId: string;
}

interface Guest {
  traveller_type: "adults" | "child";
  title: string;
  first_name: string;
  last_name: string;
  nationality: string;
  dob_day: string;
  dob_month: string;
  dob_year: string;
  passport?: string;
  passport_day?: string;
  passport_month?: string;
  passport_year?: string;
  passport_issuance_day?: string;
  passport_issuance_month?: string;
  passport_issuance_year?: string;
}

interface UserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  nationality: string;
  country_code: string;
}

export interface BookingPayload {
  price_original: number;
  price_markup: number;
  vat: number;
  tax: number;
  gst: number;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  phone_country_code: string;
  phone: string;
  country: string;
  stars: number;
  hotel_id: string;
  hotel_name: string;
  hotel_phone: string;
  hotel_email: string;
  hotel_website: string;
  hotel_address: string;
  room_data: any[];
  location: string;
  location_cords: string;
  hotel_img: string;
  checkin: string;
  checkout: string;
  adults: number;
  childs: number;
  child_ages: string | number;
  currency_original: string;
  currency_markup: string;
  booking_data: BookingData;
  supplier: string;
  user_id?: string;
  guest: Guest[];
  nationality: string;
  payment_gateway?: string;
  user_data: UserData;
  booking_ref_no: string;
}

interface SessionUser {
  user?: {
    id?: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    // ... add other fields you need
  };
  iat?: number;
  exp?: number;
}

export const hotel_booking = async (payload: BookingPayload) => {
  try {
    const userinfo = (await getSession()) as SessionUser | null;
    const user_id = userinfo?.user?.user_id ?? "";
    const formData = new FormData();
    //  Append normal fields
    formData.append("booking_ref_no", payload.booking_ref_no || "");
    formData.append("price_original", String(payload.price_original));
    formData.append("price_markup", String(payload.price_markup));
    formData.append("vat", String(payload.vat));
    formData.append("tax", String(payload.tax));
    formData.append("gst", String(payload.gst));
    formData.append("first_name", payload.first_name);
    formData.append("last_name", payload.last_name);
    formData.append("email", payload.email);
    formData.append("address", payload.address);
    formData.append("phone_country_code", payload.phone_country_code);
    formData.append("phone", payload.phone);
    formData.append("country", payload.country);
    formData.append("stars", String(payload.stars));
    formData.append("hotel_id", payload.hotel_id);
    formData.append("hotel_name", payload.hotel_name);
    formData.append("hotel_phone", payload.hotel_phone);
    formData.append("hotel_email", payload.hotel_email);
    formData.append("hotel_website", payload.hotel_website);
    formData.append("hotel_address", payload.hotel_address);
    formData.append("location", payload.location);
    formData.append("location_cords", payload.location_cords);
    formData.append("hotel_img", payload.hotel_img);
    formData.append("checkin", payload.checkin);
    formData.append("checkout", payload.checkout);
    formData.append("adults", String(payload.adults));
    formData.append("childs", String(payload.childs));
    formData.append("child_ages", String(payload.child_ages));
    formData.append("currency_original", payload.currency_original);
    formData.append("currency_markup", payload.currency_markup);
    formData.append("supplier", payload.supplier);
    formData.append("supplier_cost",  String(payload.price_original));
    formData.append("nationality", payload.nationality);
    formData.append("payment_gateway", payload.payment_gateway ?? "");
    formData.append("user_id", user_id ?? "");

    // hardcoded fields
    formData.append("supplier_id", "");
    formData.append("agent_fee", "0");
    // agent_fee= price_markup - price_original
    formData.append("net_profit", String(payload.price_markup - payload.price_original));
    // if user is agent logged as agent
    formData.append("agent_id", api_key ?? "");


    // Append JSON fields (must stringify)
    formData.append("room_data", JSON.stringify(payload.room_data));
    formData.append("booking_data", JSON.stringify(payload.booking_data));
    formData.append("guest", JSON.stringify(payload.guest));
    formData.append("user_data", JSON.stringify(payload.user_data));
    const response = await fetch(`${baseUrl}/hotel_booking`, {
      method: "POST",
      body: formData,
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};

//====================== INVOICE API ========================
export const hotel_invoice = async (payload: string) => {
  try {
    const formData = new FormData();

    //  match exactly with API keys
    formData.append("booking_ref_no", payload);

    const response = await fetch(`${baseUrl}/hotels/invoice`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};
//====================== PRAPARE PAYMENT ========================
interface payment1_payload {
  booking_ref_no: string;
  invoice_url: string;
  payment_getway:string;
}
export const prapare_payment = async (payload: payment1_payload) => {
  try {
    const formData = new FormData();
    //  match exactly with API keys
    formData.append("booking_ref_no", payload.booking_ref_no);
    formData.append('invoice_url', payload.invoice_url)
    formData.append('payment_gateway', payload.payment_getway)

    const response = await fetch(`${baseUrl}/invoice/pay`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};

interface processedPay_payload {
  payload: string;
  payment_gateway: string;

}
export const processed_payment = async (payload: processedPay_payload) => {
  try {
    const formData = new FormData();

    //  match exactly with API keys
    formData.append("payload", payload.payload);
    formData.append('payment_gateway', payload.payment_gateway)

    const response = await fetch(`${baseUrl}/invoice/process-payment`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};
export const cancel_payment = async (booking_ref_no:string) => {
  try {
    const formData = new FormData();

    //  match exactly with API keys
    formData.append("booking_ref_no", booking_ref_no);

    const response = await fetch(`${baseUrl}/hotels/cancellation`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);


    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};
// ============== CMS CONTENT PAGE =====================
interface cms_page_payload {
  slug_url: string;
  lang: string;
}

export const cms_pages_content = async (payload: cms_page_payload) => {
  try {
    const formData = new FormData();
    //  match exactly with API keys
    formData.append("slug_url", String(payload.slug_url));
    formData.append("lang", payload.lang);


    const response = await fetch(`${baseUrl}/cms_page`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};
//===================== PROFILE =======================
export const get_profile = async () => {
  try {
     const userinfo = (await getSession()) as SessionUser | null;
    const user_id = userinfo?.user?.user_id ?? "";
    const formData = new FormData();
    formData.append("user_id", user_id);

    const response = await fetch(`${baseUrl}/profile`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }

    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};
// ================== DASHBOARD API ====================
interface dashboardPayload {
page : string;
limit : string ;
search : string ;
payment_status: string;
}
export const fetch_dashboard_data = async (payload: dashboardPayload) => {
  try {
     const userinfo = (await getSession()) as SessionUser | null;
    const user_id = userinfo?.user?.user_id ?? "";

    const formData = new FormData();

    // match exactly with API keys
    formData.append("api_key", api_key ?? "");
    formData.append("user_id",user_id );
    formData.append("page", payload.page);
    formData.append("limit",payload.limit);
    formData.append("search", payload.search ?? "");
    formData.append("payment_status", payload.payment_status ?? "");
    formData.append("type", "customer");
    const response = await fetch(`${baseUrl}/user_bookings`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json, text/plain, */*",
      },
    });
    const data = await response.json().catch(() => null);

    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }
    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};

// ====================== PROFILE UPDATE (NEW ENDPOINT: /profile_update) ======================
// @src/actions/index.ts
interface ProfileUpdatePayload {
  user_id: string | number;
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone: string;
  phone_country_code: string | number;
  country_code: string | number;
  state: string;
  city: string;
  address1: string;
  address2: string;
}

export const profile_update = async (payload: ProfileUpdatePayload) => {
  const formData = new URLSearchParams();

  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  }
  try {
    const response = await fetch(`${baseUrl}/profile_update`, {
      method: "POST",
      body: formData.toString(),
      headers: await getHeaders("application/x-www-form-urlencoded"),
    });

    const data = await response.json().catch(() => null);
    const userData=data.user[0]
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Failed to update profile" };
    }
    await createSession(userData as any);
    return { success: true, data };
  } catch (error) {
    return { error: (error as Error).message || "An error occurred while updating profile" };
  }
};

// ========================= get gateayyyyyyyyyy==================
export const fetch_gateway = async () => {
  try {
   const response = await fetch(`${baseUrl}/get_gateway`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    const data = await response.json().catch(() => null);
    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Something went wrong" };
    }
    return data;
  } catch (error) {
    return { error: (error as Error).message || "An error occurred" };
  }
};
