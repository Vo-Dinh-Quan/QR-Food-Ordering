import { useAppStore } from "@/components/app-provider";
import { handleErrorApi } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

const UNAUTHENTICATED_PAGES = ["/login", "/logout", "refresh-token"];
export default function ListenLogoutSocKet() {
	const { isPending, mutateAsync } = useLogoutMutation(); // với component này ta cần lấy trực tiếp isPending và mutateAsync thay vì object. Bởi vì mỗi lần re-render nó sẽ tạo ra 1 instance mới, khiến useEffect bị gọi lại liên tục
	const socket = useAppStore((state) => state.socket);
	const setRole = useAppStore((state) => state.setRole);
	const disconnectSocket = useAppStore((state) => state.disconnectSocket);

	const router = useRouter();
	const pathname = usePathname();
	useEffect(() => {
		if (UNAUTHENTICATED_PAGES.includes(pathname)) return;
		async function onLogout() {
			if (isPending) return;
			try {
				await mutateAsync();
				disconnectSocket();
				// sau phần này, trong http.ts nó sẽ có phần xóa localStorage cho mình rồi
				router.push("/");
				setRole(undefined);
			} catch (error: any) {
				handleErrorApi({ error });
			}
		}
		socket?.on("logout", onLogout);
		return () => {
			socket?.off("logout", onLogout);
		};
	}, [
		pathname,
		router,
		socket,
		isPending,
		mutateAsync,
		disconnectSocket,
		setRole,
	]);
	return null;
}
