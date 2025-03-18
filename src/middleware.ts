import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value; // Get token from cookies

  if (!token) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  return NextResponse.next();
}

// Apply middleware to protect all /admin routes
export const config = {
  matcher: ["/","/users","/cars","/bookings","/discount","/packages","/addons","/gallery"], // Protect all routes under /admin
};
