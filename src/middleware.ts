
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "../next-intl";
import { NextRequest ,NextResponse} from "next/server";

export default async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;
  const { pathname } = request.nextUrl;
  // Run your session update
    if (pathname === "/manifest.ts" || pathname.startsWith("/images")) {
    return NextResponse.next();
  }

  // await updateSession(request);

  // Use next-intl's middleware to handle locales
  const intlMiddleware = createMiddleware({
    locales,
    defaultLocale,
    localePrefix: "as-needed",
  });

  // Run intl middleware and get its response
  const response = intlMiddleware(request);
  // =========>> Set the domain cookie on the response
  response.cookies.set("domain", hostname, {
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  });
    response.headers.set("domain", hostname);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"], // Match all paths except API/static
};
