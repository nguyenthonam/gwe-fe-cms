import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("AccessToken")?.value;
  // Clear invalid token
  const loginUrl = new URL("/login", req.url);
  const redirectLogin = NextResponse.redirect(loginUrl);
  redirectLogin.headers.set("X-Clear-LocalStorage", "true");
  redirectLogin.headers.set("X-Auth-Status", "unauthorized");
  redirectLogin.cookies.delete("AccessToken");

  // 🛑 Bỏ qua các static files, fonts, hình ảnh
  const isStaticFile = /\.(png|jpg|jpeg|gif|svg|ico|ttf|woff|woff2|css|js)$/.test(pathname);
  if (isStaticFile) {
    return NextResponse.next();
  }

  if (!token) {
    if (pathname !== "/login") {
      return redirectLogin;
    }
    const response = NextResponse.next();
    // Set headers with proper Access-Control-Expose-Headers
    // response.headers.set("Access-Control-Expose-Headers", "X-Auth-Status, X-Clear-LocalStorage");
    response.headers.set("X-Auth-Status", "unauthorized");
    response.headers.set("X-Clear-LocalStorage", "true");
    return response;
  } else if (pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  // Validate token
  const initializeAuth = async () => {
    try {
      // Use absolute URL with the same origin as the request
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/verify-token`;
      const res = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        return redirectLogin;
      }

      const data = await res.json();

      // Handle successful validation
      if (data?.data) {
        if (pathname === "/login") {
          return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        return NextResponse.next();
      }
    } catch (error) {
      return redirectLogin;
    }
  };

  const response = await initializeAuth();
  return response || NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api (API routes)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. /favicon.ico, /logo.png (static files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|fonts/|logo.png).*)",
  ],
};
