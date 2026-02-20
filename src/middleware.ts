import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/register", "/reset-password", "/verify-email"];
const adminRoutes = ["/admin"];

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isPublicRoute = publicRoutes.some(
    (route) => nextUrl.pathname === route || nextUrl.pathname.startsWith("/api/auth")
  );

  const isAdminRoute = adminRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && (nextUrl.pathname === "/login" || nextUrl.pathname === "/register")) {
    const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";
    return NextResponse.redirect(new URL(isAdmin ? "/admin/dashboard" : "/dashboard", nextUrl));
  }

  // Protect private routes
  if (!isPublicRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect public and user-specific routes from admins
  const isUserAppRoute = ["/dashboard", "/fixture", "/predictions", "/leaderboard", "/groups", "/my-stats", "/profile"].some(route =>
    nextUrl.pathname.startsWith(route)
  );

  if (isUserAppRoute && isLoggedIn && (userRole === "ADMIN" || userRole === "SUPERADMIN")) {
    return NextResponse.redirect(new URL("/admin/dashboard", nextUrl));
  }

  // Protect admin routes
  if (isAdminRoute && userRole !== "ADMIN" && userRole !== "SUPERADMIN") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)"],
};
