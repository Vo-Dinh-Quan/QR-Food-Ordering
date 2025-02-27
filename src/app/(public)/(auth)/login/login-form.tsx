"use client";
import { Button } from "@/components/ui/button";
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
import { handleErrorApi, removeTokensFromLocalStorage } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAppContext } from "@/components/app-provider";

export default function LoginForm() {
  const loginMutation = useLoginMutation(); // cú pháp này có nghĩa là sử dụng hàm useLoginMutation từ file useAuth.tsx
  const searchParams = useSearchParams();
  const clearTokens = searchParams.get("clearTokens");
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
  const { setIsAuth } = useAppContext();

  useEffect(() => {
    console.log("clearTokens", clearTokens);
    if (clearTokens) {
      setIsAuth(false);
    }
  }, [clearTokens, setIsAuth]);

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
      setIsAuth(true);
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
              <Button variant="outline" className="w-full" type="button">
                Đăng nhập bằng Google
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
