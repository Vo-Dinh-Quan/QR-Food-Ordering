"use client";
import { useAppContext } from "@/components/app-provider";
import { decodeToken } from "@/lib/utils";
import { useSetTokenToCookieMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function OAuthPage() {
	const { mutateAsync, isPending } = useSetTokenToCookieMutation();
	const { setRole } = useAppContext();
	const searchParams = useSearchParams();
	const accessToken = searchParams.get("accessToken");
	const refreshToken = searchParams.get("refreshToken");
	const router = useRouter();
	const count = useRef(0); // giữ để chỉ gọi api auth/token 1 lần duy nhất
	const message = searchParams.get("message");
	console.log("accessToken", accessToken);
	console.log("refreshToken", refreshToken);

	useEffect(() => {
		if (accessToken && refreshToken) {
			if (count.current === 0) {
				mutateAsync({ accessToken, refreshToken })
					.then(() => {
						setRole(decodeToken(accessToken).role);
						router.push("/manage/dashboard");
					})
					.catch((error) => {
						toast("Có lỗi xảy ra", {
							description: error.message,
							action: {
								label: "Ẩn",
								onClick: () => console.log("Undo"),
							},
						});
					});
				count.current++;
			}
		} else {
			console.log("message", message);
			toast("Có lỗi xảy ra", {
				description: message,
				action: {
					label: "Ẩn",
					onClick: () => console.log("Undo"),
				},
			});
		}
	}, [accessToken, refreshToken, setRole, router, message, mutateAsync]);
	return <div>Đang xử lý...</div>;
}
