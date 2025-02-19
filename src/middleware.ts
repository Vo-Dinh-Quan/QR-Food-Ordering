import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privatePaths = ["/manage"];
const unAuthPaths = ["/login", "/register"];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("pathname", pathname);
  const isAuth = Boolean(request.cookies.get("accessToken")?.value);
  if (privatePaths.some((path) => pathname.startsWith(path)) && !isAuth) {
    // nếu mà path hiện tại nằm trong privatePaths và không có accessToken thì chuyển hướng về trang login
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (unAuthPaths.some((path) => pathname.startsWith(path)) && isAuth) {
    // nếu mà path hiện tại nằm trong unAuthPaths và có accessToken thì chuyển hướng về trang home
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
  // return NextResponse.redirect(new URL("/home", request.url));
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/manage/:path*", "/login"], // /manage/:path* là một path có dạng /manage/abc, /manage/abc/def, /manage/abc/def/ghi, /login là một path đơn giản
};
