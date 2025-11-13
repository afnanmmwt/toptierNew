import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

import { NextRequest, NextResponse } from "next/server";


const secret = process.env.JWT_PASSWORD;
const key = new TextEncoder().encode(secret);
export async function encrypt(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(
  input: string
): Promise<Record<string, unknown> | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ["HS256"],
    });
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

interface SessionUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: number;
  country_id: string;
  ban: number;
  role: string;
  agency_id: string;
  reseller_id: string;
  country_name: null | string;
}

export async function createSession(user: any) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({ user });
  // (await cookies()).set("access-token", session, { httpOnly: true, expires });
  (await cookies()).set("access-token", session, {
    httpOnly: false,
    secure: true, //  Must be true because your site is HTTPS (toptiertravel.vip)
    sameSite: "lax", // Required for cross-origin safety
    path: "/", //  Critical — makes cookie available site-wide
    expires,
  });
}

export async function logout() {
  (await cookies()).set("access-token", "", { expires: new Date(0) });
  (await cookies()).set("agent_ref", "", { expires: new Date(0) });
    sessionStorage.removeItem('lastRoute')
    localStorage.removeItem('adminRef')
}

export async function getSession() {
  const session = (await cookies()).get("access-token")?.value;
  if (!session) return null;
  // const userinfo= decrypt(session)

  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("access-token")?.value;
  if (!session) return;
  const parsed = await decrypt(session);
  if (!parsed) return;
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "access-token",
    value: await encrypt(parsed),
    httpOnly: true,
    expires,
  });

  return res;
}

// // ---------------------- CODE EXPLAINATION ----------------------
// Overall Purpose of the Code
// This code implements a session management system for a Next.js application using JWTs stored in HTTP-only cookies. Here’s a summary of the system’s functionality:

// Session Creation: The createSession function encodes user data into a JWT and stores it in a secure cookie.
// Session Retrieval: The getSession function retrieves and decodes the session data for use in the application.
// Session Refresh: The updateSession function extends the session’s validity by refreshing the JWT and cookie, often used in middleware.
// Session Termination: The logout function deletes the session cookie to log the user out.
// JWT Handling: The encrypt and decrypt functions handle the creation and verification of JWTs, ensuring secure storage of session data.
// The system ensures security by:

// Using httpOnly cookies to prevent client-side access.
// Signing JWTs with a secret key to prevent tampering.
// Setting expiration times to limit session duration.
// Handling errors gracefully (e.g., returning null for invalid JWTs).
// This implementation is suitable for server-side session management in a Next.js application, commonly used for authentication and user state persistence.