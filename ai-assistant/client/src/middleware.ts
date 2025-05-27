import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Matcher entries are relative to the `basePath`
  matcher: [
    // Handles the root of the basePath (e.g., /ai)
    '/',
    // Matches all other paths except for the ones defined below
    '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
  ]
};
