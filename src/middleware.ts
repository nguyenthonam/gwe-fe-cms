import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  console.log("Middleware is running...", req.nextUrl.pathname);
  return NextResponse.next();

  // const { pathname } = req.nextUrl;
  // const token = req.cookies.get("AccessToken")?.value;
  // const loginUrl = new URL("/sign-in", req.url);
  // const redirectLogin = NextResponse.redirect(loginUrl);
  // redirectLogin.headers.set("X-Clear-LocalStorage", "true");
  // redirectLogin.headers.set("X-Auth-Status", "unauthorized");
  // redirectLogin.cookies.delete("AccessToken");

  // const isStaticFile = /\.(png|jpg|jpeg|gif|svg|ico|ttf|woff|woff2|css|js)$/.test(pathname);
  // if (isStaticFile) {
  //   return NextResponse.next();
  // }

  // if (!token) {
  //   if (pathname !== "/sign-in") {
  //     return redirectLogin;
  //   }
  //   const response = NextResponse.next();
  //   response.headers.set("X-Auth-Status", "unauthorized");
  //   response.headers.set("X-Clear-LocalStorage", "true");
  //   return response;
  // } else if (pathname === "/sign-in") {
  //   return NextResponse.redirect(new URL("/dashboard", req.url));
  // }

  // const initializeAuth = async () => {
  //   try {
  //     const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/verify-token`;
  //     const res = await fetch(apiUrl, {
  //       method: "GET",
  //       headers: {
  //         Authorization: token,
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     if (!res.ok) {
  //       return redirectLogin;
  //     }

  //     const data = await res.json();
  //     if (data?.data) {
  //       const userData = JSON.stringify(data.data);
  //       const response = NextResponse.next();
  //       response.headers.set("X-User-Data", userData);

  //       if (pathname === "/sign-in") {
  //         return NextResponse.redirect(new URL("/dashboard", req.url));
  //       }
  //       return response;
  //     }
  //   } catch (err: any) {
  //     console.error("Error verifying token:", err?.message);
  //     return redirectLogin;
  //   }
  // };

  // const response = await initializeAuth();
  // return response || NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|fonts/|logo.png).*)"],
};
