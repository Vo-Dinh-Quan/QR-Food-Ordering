"use client";
import { Button } from "@/components/ui/button";
import { SiGoogle } from "react-icons/si";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "@/queries/useAuth";
import { toast } from "sonner";
import {
	decodeToken,
	generateSocketInstance,
	getAccessTokenFromLocalStorage,
	handleErrorApi,
	removeTokensFromLocalStorage,
} from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { use, useEffect } from "react";
import { useAppStore } from "@/components/app-provider";
import envConfig from "@/config";
import Link from "next/link";
import { io } from "socket.io-client";

const getOauthGoogleUrl = () => {
	const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
	const options = {
		redirect_uri: envConfig.NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI,
		client_id: envConfig.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
		access_type: "offline",
		response_type: "code",
		prompt: "consent",
		scope: [
			"https://www.googleapis.com/auth/userinfo.profile",
			"https://www.googleapis.com/auth/userinfo.email",
		].join(" "),
	};
	const qs = new URLSearchParams(options);
	return `${rootUrl}?${qs.toString()}`;
};
const googleOauthUrl = getOauthGoogleUrl();

export default function LoginForm() {
	const loginMutation = useLoginMutation(); // cú pháp này có nghĩa là sử dụng hàm useLoginMutation từ file useAuth.tsx
	const searchParams = useSearchParams();
	const clearTokens = searchParams.get("clearTokens");
	const setRole = useAppStore((state) => state.setRole); // lấy setRole từ context
	const setSocket = useAppStore((state) => state.setSocket);
	// cấu hình form sử dụng react-hook-form và zodResolver để validate form
	const form = useForm<LoginBodyType>({
		resolver: zodResolver(LoginBody), // react-hook-form sử dụng zodResolver để validate dữ liệu dựa trên LoginBoy.
		// nếu có lỗi, các lỗi này sẽ được truyền vào FormField và FormMessage để hiển thị lỗi
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const router = useRouter();
	// khi nhấn submit thì react hook form sẽ validate cái form bằng zodResolver trước rồi mới validate trên server

	useEffect(() => {
		console.log("clearTokens", clearTokens);
		if (clearTokens) {
			setRole(undefined);
		}
	}, [clearTokens, setRole]);

	const onSubmit = async (data: LoginBodyType) => {
		if (loginMutation.isPending) return; // nếu đang loading thì không cho submit nữa
		try {
			const response = await loginMutation.mutateAsync(data);
			toast("Chào mừng quay trở lại", {
				description: response.payload.message,
				action: {
					label: "Ẩn",
					onClick: () => console.log("Undo"),
				},
			});
			setRole(response.payload.data.account.role);
			setSocket(generateSocketInstance(response.payload.data.accessToken));
			router.push("/manage/dashboard");
		} catch (error: any) {
			handleErrorApi({
				error,
				setError: form.setError,
			});
		}
	};

	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Đăng nhập</CardTitle>
				<CardDescription>
					Nhập email và mật khẩu của bạn để đăng nhập vào hệ thống
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						className="space-y-2 max-w-[600px] flex-shrink-0 w-full"
						noValidate
						onSubmit={form.handleSubmit(onSubmit, (errors) => {
							console.log(errors);
						})}>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<div className="grid gap-2">
											<Label htmlFor="email">Email</Label>
											<Input
												id="email"
												type="email"
												placeholder="m@example.com"
												required
												{...field}
											/>
											<FormMessage />{" "}
											{/* FormMessage này là một component để hiển thị lỗi của input */}
										</div>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<div className="grid gap-2">
											<div className="flex items-center">
												<Label htmlFor="password">Password</Label>
											</div>
											<Input
												id="password"
												type="password"
												required
												{...field}
											/>
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full">
								Đăng nhập
							</Button>
							<Link href={googleOauthUrl}>
								<Button variant="outline" className="w-full" type="button">
									Đăng nhập bằng Google
									<svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none">
										<path
											d="M23.766 12.276c0-.88-.08-1.72-.224-2.52H12v4.76h6.68c-.28 1.36-1.08 2.52-2.32 3.32v2.76h3.72c2.16-1.96 3.38-4.84 3.38-8.32z"
											fill="#4285F4"
										/>
										<path
											d="M12 24c3.24 0 5.96-1.08 7.94-2.92l-3.72-2.76c-1.04.7-2.36 1.12-4.22 1.12-3.24 0-5.98-2.18-6.96-5.1H.34v3.18C2.34 21.14 6.86 24 12 24z"
											fill="#34A853"
										/>
										<path
											d="M5.04 14.34c-.24-.7-.38-1.44-.38-2.34s.14-1.64.38-2.34V6.48H.34A11.96 11.96 0 000 12c0 1.92.46 3.72 1.34 5.52l3.7-3.18z"
											fill="#FBBC05"
										/>
										<path
											d="M12 4.76c1.8 0 3.38.62 4.64 1.84l3.46-3.46C17.96 1.16 15.24 0 12 0 6.86 0 2.34 2.86.34 6.48L5.04 9.66c.98-2.92 3.72-4.9 6.96-4.9z"
											fill="#EA4335"
										/>
									</svg>
								</Button>
							</Link>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
