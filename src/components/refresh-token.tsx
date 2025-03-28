"use-client";

import { useAppContext } from "@/components/app-provider";
import { checkAndRefreshToken } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

// Những page sau sẽ không check refresh token
const UNAUTHENTICATED_PAGES = ["/login", "/logout", "refresh-token"];

export default function RefreshToken() {
	const router = useRouter();
	const pathname = usePathname();
	const { socket, disconnectSocket } = useAppContext();
	// console.log("pathname", pathname);
	useEffect(() => {
		if (UNAUTHENTICATED_PAGES.includes(pathname)) return;
		let interval: any = null;
		// phải gọi lần đầu tiên, vì interval sẽ chạy sau thời gian TIMEOUT
		const onRefreshToken = (force?: boolean) => {
			// console.log("refresh token");
			checkAndRefreshToken({
				onError: () => {
					clearInterval(interval);
					disconnectSocket();
				},
				force,
			});
		};

		onRefreshToken();
		// TIMEOUT interval phải bé hơn thời gian hết hạn của access token
		// vd: thời gian sống của access token là 10s thì TIMEOUT out là 1s
		const TIMEOUT = 1000;
		interval = setInterval(onRefreshToken, TIMEOUT);
		if (socket?.connected) {
			onConnect();
		}
		function onConnect() {
			console.log(socket?.id);
		}

		function onDisconnect() {
			console.log("disconnect");
		}

		function onRefreshTokenSocket() {
			onRefreshToken(true);
		}

		socket?.on("connect", onConnect);
		socket?.on("disconnect", onDisconnect);
		socket?.on("refresh-token", onRefreshTokenSocket);
		return () => {
			socket?.off("connect", onConnect);
			socket?.off("disconnect", onDisconnect);
			socket?.off("refresh-token", onRefreshTokenSocket);
			clearInterval(interval);
		}; // clear interval khi component unmount
	}, [pathname, router, disconnectSocket]);
	return null;
}

// vấn đề gặp phải: duplicate gọi API refresh token liên tục quá nhanh, dẫn đến cả 2 request đều dùng chung token để gửi đi, dẫn đến lỗi 401

// chia ra 2 vấn đề con cần giải quyết:
// 1. Nhiều interval đang chạy đồng thời Nếu component re-render hoặc useEffect chạy lại (ví dụ, khi pathname thay đổi) mà interval cũ không được clear đúng cách, sẽ có nhiều interval hoạt động đồng thời. Mỗi interval sẽ gọi hàm checkAndRefreshToken định kỳ, dẫn đến việc gọi API refresh token nhiều lần.
// => cách xử lý: clear interval bằng return của useEffect

// 2. Không đồng bộ khi gọi API: Nếu hàm checkAndRefreshToken chưa hoàn thành một lần gọi API refresh token nhưng lại được gọi lại từ interval mới, sẽ có nhiều yêu cầu gửi đi cùng lúc. Điều này có thể dẫn đến việc hệ thống nhận về token giống nhau từ các request trùng lặp.
// => cách xử lý: trong file auth.ts
