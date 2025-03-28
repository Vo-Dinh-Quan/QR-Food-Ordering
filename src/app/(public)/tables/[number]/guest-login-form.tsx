"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	GuestLoginBody,
	GuestLoginBodyType,
} from "@/schemaValidations/guest.schema";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useGuestLoginMutation } from "@/queries/useGuest";
import { useAppContext } from "@/components/app-provider";
import { generateSocketInstance, handleErrorApi } from "@/lib/utils";

export default function GuestLoginForm() {
	const { setRole } = useAppContext();
	const { setSocket } = useAppContext();
	const searchParams = useSearchParams();
	const params = useParams();
	// với url là http://localhost:3000/tables/1?token=8931e14820384e2f99bb400022692a6c thì searchParams.get("token") sẽ trả về "8931e14820384e2f99bb400022692a6c" và params sẽ trả về { number: "1" }
	// console.log("searchParams", searchParams.get("token"));
	// console.log("params", params);
	const tableNumber = Number(params.number);
	const token = searchParams.get("token");
	const router = useRouter();
	const loginMutation = useGuestLoginMutation();

	const form = useForm<GuestLoginBodyType>({
		resolver: zodResolver(GuestLoginBody),
		defaultValues: {
			name: "",
			token: token ?? "",
			tableNumber,
		},
	});

	useEffect(() => {
		if (!token) {
			router.push("/");
		}
	}, [token, router]);

	async function onSubmit(values: GuestLoginBodyType) {
		console.log("values", values);
		if (loginMutation.isPending) {
			return;
		}
		try {
			const response = await loginMutation.mutateAsync(values);
			setRole(response.payload.data.guest.role);
			setSocket(generateSocketInstance(response.payload.data.accessToken));
			router.push(`/guest/menu`);
		} catch (error) {
			handleErrorApi({
				error,
				setError: form.setError,
			});
		}
	}

	return (
		<Card className="mx-auto max-w-sm">
			<CardHeader>
				<CardTitle className="text-2xl">Đăng nhập gọi món</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
						className="space-y-2 max-w-[600px] flex-shrink-0 w-full"
						noValidate
						onSubmit={form.handleSubmit(onSubmit, console.log)}>
						<div className="grid gap-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<div className="grid gap-2">
											<Label htmlFor="name">Tên khách hàng</Label>
											<Input id="name" type="text" required {...field} />
											<FormMessage />
										</div>
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full">
								Đăng nhập
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
