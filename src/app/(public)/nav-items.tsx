// giải thích 1 chút là: thằng nav-item này được import vào layout public nên những page nào nằm trong thư mục public thì đều bị ảnh hưởng chuyển sang dynamic-rendering khi nav-item có sử dụng cookie từ next/headers, vậy nên chúng ta sẽ chuyển nó sang 'useClient' để dùng localStorage thay vì cookie
"use client";

import { useAppContext } from "@/components/app-provider";
import { Role } from "@/constants/type";
import { cn, handleErrorApi } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useGuestLogoutMutation } from "@/queries/useGuest";
import { RoleType } from "@/types/jwt.types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const menuItems: {
	title: string;
	href: string;
	role?: RoleType[];
	hideWhenLogin?: boolean;
}[] = [
	{
		title: "Trang chủ",
		href: "/", // authRequired = undefined nghĩa là đăng nhập hay chưa đều cho hiển thị
	},
	{
		title: "Thực đơn",
		href: "/guest/menu",
		role: [Role.Guest],
	},
	{
		title: "Đơn hàng",
		href: "/guest/orders",
		role: [Role.Guest],
	},
	{
		title: "Đăng nhập",
		href: "/login",
		hideWhenLogin: true,
	},
	{
		title: "Quản lý",
		href: "/manage/dashboard",
		role: [Role.Owner, Role.Employee],
	},
];

// Server: Món ăn, Đăng nhập. Do server không biết trạng thái đăng nhập của user
// CLient: Đầu tiên client sẽ hiển thị là Món ăn, Đăng nhập.
// Nhưng ngay sau đó thì client render ra là Món ăn, Đơn hàng, Quản lý do đã check được trạng thái đăng nhập
// điều này dẫn đến warning: Content did not match. Server: "Món ăn, Đăng nhập". Client: "Món ăn, Đơn hàng, Quản lý"
// và 1 cái lỗi nữa là hydration failed, thích thì copy cái này bắn lên gpt để hiểu rõ hơn

/**
react-dom-client.development.js:4128 Uncaught Error: Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

// paste cái này lên google: Hydration failed because the server rendered HTML didn't match the client.
// và vào link này: https://nextjs.org/docs/messages/react-hydration-error
It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.
 */

// hướng giải quyết: sử dụng useEffect để check trạng thái đăng nhập của user (theo gợi ý của nextjs)
// cách này sẽ giúp tránh lỗi hydration failed và warning Content did not match
export default function NavItems({ className }: { className?: string }) {
	const { role, setRole, disconnectSocket } = useAppContext();
	const logoutMutation = useLogoutMutation();
	const guestLogoutMutation = useGuestLogoutMutation();
	const router = useRouter();
	const [isLoggedOut, setIsLoggedOut] = useState(false);

	const logout = async () => {
		if (role === Role.Guest && logoutMutation.isPending) return;
		if (role !== Role.Guest && guestLogoutMutation.isPending) return;
		try {
			if (role === Role.Guest) {
				await guestLogoutMutation.mutateAsync();
			} else {
				await logoutMutation.mutateAsync();
			}
			disconnectSocket();
			// sau phần này, trong http.ts nó sẽ có phần xóa localStorage cho mình rồi
			router.push("/");
			setRole(undefined);
			setIsLoggedOut(true);
		} catch (error: any) {
			handleErrorApi({ error });
		}
	};
	useEffect(() => {
		if (isLoggedOut) {
			setIsLoggedOut(false);
		}
	}, [isLoggedOut]);

	return (
		<>
			{menuItems.map((item) => {
				// trường hợp đăng nhập thì chỉ hiển thị menu đăng nhập
				const isAuth = item.role && role && item.role.includes(role);
				// trường hợp menu item có thể hiển thị dù cho đã đăng nhập hay chưa
				const canShow =
					(item.role === undefined && !item.hideWhenLogin) ||
					(!role && item.hideWhenLogin);
				if (isAuth || canShow) {
					return (
						<Link href={item.href} key={item.href} className={className}>
							{item.title}
						</Link>
					);
				}
				return null;
			})}
			{role && (
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<div className={cn(className, "cursor-pointer")}>Đăng xuất</div>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Bạn có muốn đăng xuất không?</AlertDialogTitle>
							<AlertDialogDescription>
								Đăng xuất có thể làm mất đi dữ liệu đơn hàng của bạn
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Thoát</AlertDialogCancel>
							<AlertDialogAction onClick={logout}>Đăng xuất</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			)}
		</>
	);
}
