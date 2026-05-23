import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/env";
import { updateSession } from "@/lib/supabase/middleware";

const protectedRoutes = ["/kalender"];

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const { response, user } = await updateSession(request);
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/kalender", request.url));
  }

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "Du behöver logga in för att se kalendern.");
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/login", "/kalender/:path*"],
};