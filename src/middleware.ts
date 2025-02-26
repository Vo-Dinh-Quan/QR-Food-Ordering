import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privatePaths = ["/manage"];
const unAuthPaths = ["/login", "/register"];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // sử dụng cả accessToken và refreshToken để check trạng thái. (vì có trường hợp accessToken hết hạn, vì vậy chúng ta sẽ check đăng nhập thông qua refreshToken)
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  // Chưa đăng nhập thì không cho vào privatePaths
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // đăng nhập rồi mà cố tình vào trang login thì sẽ chuyển hướng về trang chính
  if (unAuthPaths.some((path) => pathname.startsWith(path)) && refreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Trường hợp đăng nhập rồi nhưng accessToken hết hạn và truy cập vào các page là privatePaths(note: cố tình check trường hợp này cuối cùng)
  if (
    privatePaths.some((path) => pathname.startsWith(path)) &&
    !accessToken &&
    refreshToken
  ) {
    const url = new URL("/refresh-token", request.url);
    url.searchParams.set("refreshToken", refreshToken);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/manage/:path*", "/login"], // /manage/:path* là một path có dạng /manage/abc, /manage/abc/def, /manage/abc/def/ghi, /login là một path đơn giản
};
