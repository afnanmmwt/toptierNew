"use server";
import { createSession, getSession, logout } from "@lib/session";
import { baseUrl, api_key } from "./actions";
import { decodeBearerToken } from "@src/utils/decodeToken";
import { cookies, headers } from "next/headers";
import { userInfo } from "os";
import { z } from 'zod';
import { json } from "stream/consumers";
import { redirect } from "next/navigation";
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
  | { success: true; userType?: string; userId?: string }
  | { success: false; error: string };

export async function signIn(
  prevState: SignInState,
  formData: FormData
): Promise<SignInState> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // ✅ Validate input first
    signInSchema.parse({ email, password });

    const body = new FormData();
    body.append('email', email);
    body.append('password', password);
    if (api_key) body.append('api_key', api_key);

    // Call backend
    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      body,
    });

    const data = await response.json();

    // Check if login actually succeeded
    if (!response.ok || data?.status === false) {
      return { success: false, error: data?.message || 'Invalid credentials' };
    }

    // Only create session if login succeeded
    await createSession(data.data);
    await save_token();

    //  Return success + user info for client redirect
    return {
      success: true,
      userType: data.data.user_type,
      userId: data.data.user_id,
    };
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid email or password format' };
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
//=============cleare token =================
// export const cleartoken = ()=>{
//   logout();
// }
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
  const userinfo = (await getSession()) as any | null;
  const cookie = await cookies();
 const agent_ref = cookie.get('agent_ref')?.value || '';
     const userId =
      typeof userinfo === 'object' && userinfo !== null
        ? (userinfo.user_id || userinfo?.user?.user_id || '')
        : '';
let agent_id = '';

if (agent_ref) {
  // Priority 1: Use referral if present
  agent_id = agent_ref;
} else if (
  typeof userinfo === 'object' &&
  userinfo !== null &&
  (userinfo.user?.type === 'Agent' || userinfo.type === 'Agent')
) {
  // Priority 2: If no referral, and user is an Agent → self-assign
  agent_id = userId;
} else {
  // Priority 3: Not an agent and no referral → no agent_id
  agent_id = '';
}

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
  formData.append('user_id', userId);
  formData.append('agent_id',agent_id);
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
       const userinfo = (await getSession()) as any | null;
  const cookie = await cookies();
 const agent_ref = cookie.get('agent_ref')?.value || '';
     const userId =
      typeof userinfo === 'object' && userinfo !== null
        ? (userinfo.user_id || userinfo?.user?.user_id || '')
        : '';
let agent_id = '';

if (agent_ref) {
  // Priority 1: Use referral if present
  agent_id = agent_ref;
} else if (
  typeof userinfo === 'object' &&
  userinfo !== null &&
  (userinfo.user?.type === 'Agent' || userinfo.type === 'Agent')
) {
  // Priority 2: If no referral, and user is an Agent → self-assign
  agent_id = userId;
} else {
  // Priority 3: Not an agent and no referral → no agent_id
  agent_id = '';
}
  try {
    const formData = new FormData();
    //  match exactly with API keys
    formData.append("hotel_id", String(payload.hotel_id));
    formData.append("checkin", payload.checkin);
    formData.append("checkout", payload.checkout);
    formData.append("rooms", String(payload.rooms));
    formData.append("adults", String(payload.adults));
    formData.append("childs", String(payload.childs));
    formData.append("nationality", payload.nationality || "US");
    formData.append("language", payload.language || "en");
    formData.append("currency", payload.currency || "usd");
    formData.append("supplier_name", payload.supplier_name || "hotels");
    formData.append('user_id',userId || '')
    formData.append('agent_id',agent_id || '');
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
  booking_ref_no: string;
  booking_date: string;
  booking_status: string;
  booking_nights: string;
  price_original: number;
  price_markup: number;
  actual_price: number;
  toptier_fee: string;
  agent_fee: string;
  vat: number;
  tax: number;
  gst: number;
  net_profit: number | string;
  subtotal: number | string;
  supplier_cost: string | number;
  supplier_id: string;
  supplier_payment_type: string;
  customer_payment_type: string;
  supplier_payment_status: string;
  supplier_due_date: string;
  agent_commission_status: string;
  agent_payment_type: string;
  agent_payment_status: string;
  agent_payment_date: string;
  iata: string;
  agent_id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  phone_country_code: string;
  phone: string;
  country: string;
  nationality: string;
  stars: number;
  hotel_id: string;
  hotel_name: string;
  hotel_phone: string;
  hotel_email: string;
  hotel_website: string;
  hotel_address: string;
  hotel_img: string;
  location: string;
  location_cords: string;
  room_data: any[];
  checkin: string;
  checkout: string;
  adults: number;
  childs: number;
  child_ages: string | number;
  currency_original: string;
  currency_markup: string;
  payment_date: string;
  payment_status: string;
  payment_gateway: string;
  module_type: string;
  pnr: string;
  transaction_id: string;
  cancellation_request: string;
  cancellation_status: string;
  cancellation_response: string;
  cancellation_date: string;
  cancellation_error: string;
  cancellation_terms: string;
  booking_data: BookingData;
  booking_response: string;
  error_response: string;
  booking_note: string;
  supplier: string;
  user_id: string;
  user_data: UserData;
  guest: Guest[];
  card: any;
}

export const hotel_booking = async (payload: BookingPayload) => {
  try {
     const userinfo = (await getSession()) as any | null;
  const cookie = await cookies();
 const agent_ref = cookie.get('agent_ref')?.value || '';
     const userId =
      typeof userinfo === 'object' && userinfo !== null
        ? (userinfo.user_id || userinfo?.user?.user_id || '')
        : '';
let agent_id = '';

if (agent_ref) {
  // Priority 1: Use referral if present
  agent_id = agent_ref;
} else if (
  typeof userinfo === 'object' &&
  userinfo !== null &&
  (userinfo.user?.type === 'Agent' || userinfo.type === 'Agent')
) {
  // Priority 2: If no referral, and user is an Agent → self-assign
  agent_id = userId;
} else {
  // Priority 3: Not an agent and no referral → no agent_id
  agent_id = '';
}

    const formData = new FormData();

    // 🔹 Core booking info
    formData.append("booking_ref_no", payload.booking_ref_no || "");
    formData.append("booking_date", payload.booking_date || "");
    formData.append("booking_status", payload.booking_status || "");
    formData.append("booking_nights", payload.booking_nights || "1");

    // 🔹 Financial details
formData.append(
  "price_original",
  String(payload.price_original).replace(/,/g, "")
);
formData.append(
  "price_markup",
  String(payload.price_markup).replace(/,/g, "")
);


    // formData.append("actual_price", String(payload.actual_price));
    formData.append("toptier_fee", payload.toptier_fee);
    formData.append("agent_fee", payload.agent_fee);
    formData.append("vat", String(payload.vat));
    formData.append("tax", String(payload.tax));
    formData.append("gst", String(payload.gst));
    formData.append("net_profit", String(payload.net_profit));
    formData.append("subtotal", String(payload.subtotal));
    formData.append("supplier_cost", String(payload.supplier_cost));
    formData.append("supplier_id", payload.supplier_id);
    formData.append("supplier_payment_type", payload.supplier_payment_type);
    formData.append("customer_payment_type", payload.customer_payment_type);
    formData.append("supplier_payment_status", payload.supplier_payment_status);
    formData.append("supplier_due_date", payload.supplier_due_date);
    formData.append("agent_commission_status", payload.agent_commission_status);
    formData.append("agent_payment_type", payload.agent_payment_type);
    formData.append("agent_payment_status", payload.agent_payment_status);
    formData.append("agent_payment_date", payload.agent_payment_date);
    formData.append("iata", "0");
    formData.append("agent_id", agent_id || payload.agent_id || "");

    // 🔹 Customer info
    formData.append("first_name", payload.first_name);
    formData.append("last_name", payload.last_name);
    formData.append("email", payload.email);
    formData.append("address", payload.address);
    formData.append("phone_country_code", payload.phone_country_code);
    formData.append("phone", payload.phone);
    formData.append("country", payload.country);
    formData.append("nationality", payload.nationality);

    // 🔹 Hotel info
    formData.append("stars", String(payload.stars));
    formData.append("hotel_id", payload.hotel_id);
    formData.append("hotel_name", payload.hotel_name);
    formData.append("hotel_phone", payload.hotel_phone);
    formData.append("hotel_email", payload.hotel_email);
    formData.append("hotel_website", payload.hotel_website);
    formData.append("hotel_address", payload.hotel_address);
    formData.append("hotel_img", payload.hotel_img);
    formData.append("location", payload.location);
    formData.append("location_cords", payload.location_cords);

    // 🔹 Stay info
    formData.append("checkin", payload.checkin);
    formData.append("checkout", payload.checkout);
    formData.append("adults", String(payload.adults));
    formData.append("childs", String(payload.childs));
    formData.append("child_ages", String(payload.child_ages));

    // 🔹 Currency
    formData.append("currency_original", payload.currency_original);
    formData.append("currency_markup", payload.currency_markup);

    // 🔹 Payment & meta
    formData.append("payment_date", payload.payment_date);
    formData.append("payment_status", payload.payment_status);
    formData.append("payment_gateway", payload.payment_gateway);
    formData.append("module_type", payload.module_type);
    formData.append("pnr", payload.pnr);
    formData.append("transaction_id", payload.transaction_id);
    formData.append("user_id", userId || payload.user_id);
    formData.append('agent_id', agent_id || '')
    // 🔹 Cancellation info
    formData.append("cancellation_request", payload.cancellation_request);
    formData.append("cancellation_status", payload.cancellation_status);
    formData.append("cancellation_response", payload.cancellation_response);
    formData.append("cancellation_date", payload.cancellation_date);
    formData.append("cancellation_error", payload.cancellation_error);
    formData.append("cancellation_terms", payload.cancellation_terms);

    // 🔹 Notes and responses
    formData.append("booking_note", payload.booking_note);
    formData.append("supplier", payload.supplier);
    formData.append("booking_response", payload.booking_response);
    formData.append("error_response", payload.error_response);

    // 🔹 JSON fields
    formData.append("room_data", JSON.stringify(payload.room_data));
    formData.append("booking_data", JSON.stringify(payload.booking_data));
    formData.append("guest", JSON.stringify(payload.guest));
    formData.append("user_data", JSON.stringify(payload.user_data));
    formData.append("card", JSON.stringify(payload.card));

    // 🔹 Send request
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
    console.error("Booking Error:", error);
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
booking_status:string ;
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
    formData.append('booking_status', payload.booking_status ==="cancelled" ? "cancelled" : "")
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
  const formData = new FormData();

  // for (const [key, value] of Object.entries(payload)) {
  //   if (value !== undefined && value !== null) {
  //     formData.append(key, String(value));
  //   }
  // }
formData.append('user_id', String(payload.user_id));
formData.append('first_name', String(payload.first_name));
formData.append('last_name', String(payload.last_name));
formData.append('email', String(payload.email));
formData.append('phone', String(payload.phone));
formData.append('phone_country_code', String(payload.phone_country_code));
formData.append('country_code', String(payload.country_code));
formData.append('state', String(payload.state));
formData.append('city', String(payload.city));
formData.append('address1', String(payload.address1));
formData.append('address2', String(payload.address2));

  try {
    const response = await fetch(`${baseUrl}/profile_update`, {
      method: "POST",
      body: formData,

    });

    const data = await response.json().catch(() => null);
    const userData=data.data[0]

    if (!response.ok || data?.status === false) {
      return { error: data?.message || "Failed to update profile" };
    }
    // await createSession(userData as any);
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
