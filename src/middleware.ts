import { Role } from "@/constants/type";
import { decodeToken } from "@/lib/utils";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const managePaths = ["/manage"];
const guestPaths = ["/guest"];
const onlyOwnerPaths = ["/manage/accounts"];
const privatePaths = [...managePaths, ...guestPaths];
const unAuthPaths = ["/login", "/register"];

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;
	// sử dụng cả accessToken và refreshToken để check trạng thái. (vì có trường hợp accessToken hết hạn, vì vậy chúng ta sẽ check đăng nhập thông qua refreshToken)
	const accessToken = request.cookies.get("accessToken")?.value;
	const refreshToken = request.cookies.get("refreshToken")?.value;

	// 1. Chưa đăng nhập thì không cho vào privatePaths
	if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
		const url = new URL("/login", request.url);
		url.searchParams.set("clearTokens", "true");
		return NextResponse.redirect(url);
	}
	// 2. Đã đăng nhập
	if (refreshToken) {
		// 2.1 nếu cố tình vào trang login thì chuyển hướng về trang chủ
		if (unAuthPaths.some((path) => pathname.startsWith(path)) && refreshToken) {
			return NextResponse.redirect(new URL("/", request.url));
		}
		// 2.2 Trường hợp đăng nhập rồi nhưng accessToken hết hạn và truy cập vào các page là privatePaths(note: cố tình check trường hợp này cuối cùng)
		if (
			privatePaths.some((path) => pathname.startsWith(path)) &&
			!accessToken
		) {
			const url = new URL("/refresh-token", request.url);
			url.searchParams.set("refreshToken", refreshToken);
			url.searchParams.set("redirect", pathname);
			return NextResponse.redirect(url);
		}

		// 2.3 Vào không đúng role, chuyển hướng về trang chủ
		const role = decodeToken(refreshToken).role;
		// 2.3.1 Guest nhưng cố vào route Owner
		const isGuestGoToManagePath =
			role === Role.Guest &&
			managePaths.some((path) => pathname.startsWith(path));
		// 2.3.2 Không phải Guest nhưng cố vào route Guest
		const isNotGuestGoToGuestPath =
			role !== Role.Guest &&
			guestPaths.some((path) => pathname.startsWith(path));

		// 2.3.3 Không phải Owner nhưng cố vào route Owner
		const isNotOwnerGoToOwnerPath =
			role !== Role.Owner &&
			onlyOwnerPaths.some((path) => pathname.startsWith(path));
		if (
			isGuestGoToManagePath ||
			isNotGuestGoToGuestPath ||
			isNotOwnerGoToOwnerPath
		) {
			return NextResponse.redirect(new URL("/", request.url));
		}
	}

	return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: ["/manage/:path*", "/guest/:path*", "/login"], // /manage/:path* là một path có dạng /manage/abc, /manage/abc/def, /manage/abc/def/ghi, /login là một path đơn giản
};
