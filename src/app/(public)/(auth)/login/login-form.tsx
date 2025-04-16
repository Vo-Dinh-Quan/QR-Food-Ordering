"use client";
import { useState } from "react";
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
import { useEffect } from "react";
import { useAppStore } from "@/components/app-provider";
import envConfig from "@/config";
import { LoaderCircle } from "lucide-react";

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
  return `${rootUrl}?${new URLSearchParams(options).toString()}`;
};

export default function LoginForm() {
  const loginMutation = useLoginMutation();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: { email: "admin@order.com", password: "123456" },
  });
  const router = useRouter();
  const setRole = useAppStore((s) => s.setRole);
  const setSocket = useAppStore((s) => s.setSocket);
  const searchParams = useSearchParams();
  const clearTokens = searchParams.get("clearTokens");

  useEffect(() => {
    if (clearTokens) setRole(undefined);
  }, [clearTokens, setRole]);

  const onSubmit = async (data: LoginBodyType) => {
    if (loginMutation.isPending) return;
    try {
      const resp = await loginMutation.mutateAsync(data);
      toast("Chào mừng quay trở lại", { description: resp.payload.message });
      setRole(resp.payload.data.account.role);
      setSocket(generateSocketInstance(resp.payload.data.accessToken));
      router.push("/manage/dashboard");
    } catch (err: any) {
      handleErrorApi({ error: err, setError: form.setError });
    }
  };

  const handleGoogleLogin = () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    // chuyển hướng sang Google OAuth
    window.location.href = getOauthGoogleUrl();
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
            noValidate
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4">
            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" required {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input id="password" type="password" required {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Button đăng nhập */}
            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2"
              disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : null}
              Đăng nhập
            </Button>

            {/* Button Google OAuth */}
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}>
              {isGoogleLoading ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <SiGoogle className="w-5 h-5" />
              )}
              Đăng nhập bằng Google
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
