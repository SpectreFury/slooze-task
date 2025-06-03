import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicRoutes = ["/login", "/signup", "/api/login", "/api/signup", "/"];

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  console.log("Token:", token);
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    const decoded = payload as unknown as JWTPayload;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);
    requestHeaders.set("x-user-email", decoded.email);
    requestHeaders.set("x-user-role", decoded.role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },    });
  } catch (error) {
    console.error("Invalid token:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public|file.svg|globe.svg|next.svg|vercel.svg|window.svg).*)",
  ],
};
