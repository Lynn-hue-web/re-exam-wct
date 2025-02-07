import { clerkMiddleware, ClerkMiddlewareOptions } from "@clerk/nextjs/server";

const publicRoutes = ["/", "/sign-in", "/contact"];
const ignoredRoutes = ["/api/public"];

export default clerkMiddleware({
  ...({
    publicRoutes,
    ignoredRoutes,
  } as ClerkMiddlewareOptions)
});

// Matcher configuration for Next.js
export const config = {
  matcher: [
    "/((?!.*\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ]
};