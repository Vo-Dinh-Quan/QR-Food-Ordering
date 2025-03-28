"use client";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	UpdateEmployeeAccountBody,
	UpdateEmployeeAccountBodyType,
} from "@/schemaValidations/account.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useGetAccount, useUpdateAccountMutation } from "@/queries/useAccount";
import { number, set } from "zod";
import { useUploadMediaMutation } from "@/queries/useMedia";
import { toast } from "sonner";
import { handleErrorApi } from "@/lib/utils";
import { Role, RoleValues } from "@/constants/type";

export default function EditEmployee({
	id,
	setId,
	onSubmitSuccess,
}: {
	id?: number | undefined;
	setId: (value: number | undefined) => void;
	onSubmitSuccess?: () => void;
}) {
	const [file, setFile] = useState<File | null>(null);
	const avatarInputRef = useRef<HTMLInputElement | null>(null);

	const { data } = useGetAccount({ id: id as number, enable: Boolean(id) });
	const updateAccountMutation = useUpdateAccountMutation();
	const uploadMediaMutation = useUploadMediaMutation();

	const form = useForm<UpdateEmployeeAccountBodyType>({
		resolver: zodResolver(UpdateEmployeeAccountBody),
		defaultValues: {
			name: "",
			email: "",
			avatar: undefined,
			password: undefined,
			confirmPassword: undefined,
			changePassword: false,
			role: Role.Employee,
		},
	});
	const avatar = form.watch("avatar");
	const name = form.watch("name");
	const changePassword = form.watch("changePassword");
	const previewAvatarFromFile = useMemo(() => {
		if (file) {
			return URL.createObjectURL(file);
		}
		return avatar;
	}, [file, avatar]);

	useEffect(() => {
		if (data) {
			const { name, avatar, email, role } = data.payload.data;
			form.reset({
				name,
				avatar: avatar ?? undefined,
				email,
				changePassword: form.getValues("changePassword"),
				password: form.getValues("password"),
				confirmPassword: form.getValues("confirmPassword"),
				role: role,
			});
		}
	}, [data, form]);

	const reset = () => {
		setId(undefined);
		form.reset();
		setFile(null);
	};

	const onSubmit = async (values: UpdateEmployeeAccountBodyType) => {
		if (updateAccountMutation.isPending) return;
		try {
			// id: id as number để báo là khi submit thì id sẽ không bao giờ là undefined
			let body: UpdateEmployeeAccountBodyType & { id: number } = {
				id: id as number,
				...values,
			};
			// Nếu có file mới được chọn, cần upload file trước
			if (file) {
				const formData = new FormData();
				formData.append("file", file);
				// Sử dụng mutateAsync để upload file, giúp sử dụng cú pháp async/await
				const uploadImageResult = await uploadMediaMutation.mutateAsync(
					formData
				);
				const imageUrl = uploadImageResult.payload.data;
				// Sau khi upload thành công, cập nhật lại giá trị avatar trong body
				body = {
					...body,
					avatar: imageUrl,
				};
			}
			// Gọi mutation để cập nhật thông tin cá nhân với dữ liệu đã xử lý
			const response = await updateAccountMutation.mutateAsync(body);
			// Hiển thị thông báo thành công cho người dùng
			toast(response.payload.message, {
				action: {
					label: "Ẩn",
					onClick: () => console.log("Undo"),
				},
			});
			reset();
			if (onSubmitSuccess) {
				onSubmitSuccess();
			}
		} catch (error) {
			// Xử lý lỗi từ API, set lỗi lên form nếu có
			handleErrorApi({
				error,
				setError: form.setError,
			});
		}
	};

	return (
		<Dialog
			open={Boolean(id)}
			onOpenChange={(value) => {
				if (!value) {
					reset();
				}
			}}>
			<DialogContent className="sm:max-w-[600px] max-h-screen overflow-auto">
				<DialogHeader>
					<DialogTitle>Cập nhật tài khoản</DialogTitle>
					<DialogDescription>
						Các trường tên, email, mật khẩu là bắt buộc
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						noValidate
						className="grid auto-rows-max items-start gap-4 md:gap-8"
						id="edit-employee-form"
						onSubmit={form.handleSubmit(onSubmit, (e) => {
							console.log(e);
						})}>
						<div className="grid gap-4 py-4">
							<FormField
								control={form.control}
								name="avatar"
								render={({ field }) => (
									<FormItem>
										<div className="flex gap-2 items-start justify-start">
											<Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
												<AvatarImage
													src={previewAvatarFromFile}
													className="object-cover"
												/>
												<AvatarFallback className="rounded-none">
													{name || "Avatar"}
												</AvatarFallback>
											</Avatar>
											<input
												type="file"
												accept="image/*"
												ref={avatarInputRef}
												onChange={(e) => {
													const file = e.target.files?.[0];
													if (file) {
														setFile(file);
														field.onChange(
															"http://localhost:3000/" + file.name
														);
													}
												}}
												className="hidden"
											/>
											<button
												className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
												type="button"
												onClick={() => avatarInputRef.current?.click()}>
												<Upload className="h-4 w-4 text-muted-foreground" />
												<span className="sr-only">Upload</span>
											</button>
										</div>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<div className="grid grid-cols-4 items-center justify-items-start gap-4">
											<Label htmlFor="name">Tên</Label>
											<div className="col-span-3 w-full space-y-2">
												<Input id="name" className="w-full" {...field} />
												<FormMessage />
											</div>
										</div>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<div className="grid grid-cols-4 items-center justify-items-start gap-4">
											<Label htmlFor="email">Email</Label>
											<div className="col-span-3 w-full space-y-2">
												<Input id="email" className="w-full" {...field} />
												<FormMessage />
											</div>
										</div>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="role"
								render={({ field }) => (
									<FormItem>
										<div className="grid grid-cols-4 items-center justify-items-start gap-4">
											<Label htmlFor="role">Vai trò</Label>
											<div className="col-span-3 w-full space-y-2">
												<Select
													onValueChange={field.onChange}
													value={field.value}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Chọn vai trò" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{RoleValues.map((role) => {
															if (role === Role.Guest) return null;
															return (
																<SelectItem key={role} value={role}>
																	{role}
																</SelectItem>
															);
														})}
													</SelectContent>
												</Select>
												<FormMessage />
											</div>
										</div>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="changePassword"
								render={({ field }) => (
									<FormItem>
										<div className="grid grid-cols-4 items-center justify-items-start gap-4">
											<Label htmlFor="email">Đổi mật khẩu</Label>
											<div className="col-span-3 w-full space-y-2">
												<Switch
													checked={field.value}
													onCheckedChange={field.onChange}
												/>
												<FormMessage />
											</div>
										</div>
									</FormItem>
								)}
							/>
							{changePassword && (
								<FormField
									control={form.control}
									name="password"
									render={({ field }) => (
										<FormItem>
											<div className="grid grid-cols-4 items-center justify-items-start gap-4">
												<Label htmlFor="password">Mật khẩu mới</Label>
												<div className="col-span-3 w-full space-y-2">
													<Input
														id="password"
														className="w-full"
														type="password"
														{...field}
														value={field.value || ""}
													/>
													<FormMessage />
												</div>
											</div>
										</FormItem>
									)}
								/>
							)}
							{changePassword && (
								<FormField
									control={form.control}
									name="confirmPassword"
									render={({ field }) => (
										<FormItem>
											<div className="grid grid-cols-4 items-center justify-items-start gap-4">
												<Label htmlFor="confirmPassword">
													Xác nhận mật khẩu mới
												</Label>
												<div className="col-span-3 w-full space-y-2">
													<Input
														id="confirmPassword"
														className="w-full"
														type="password"
														{...field}
														value={field.value || ""}
													/>
													<FormMessage />
												</div>
											</div>
										</FormItem>
									)}
								/>
							)}
						</div>
					</form>
				</Form>
				<DialogFooter>
					<Button type="submit" form="edit-employee-form">
						Lưu
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
