"use client";
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenToLocalStorage,
} from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef } from "react";

export default function LogoutPage() {
  const searchParams = useSearchParams();
  const refreshTokenFromUrl = searchParams.get("refreshToken");
  const accessTokenFromUrl = searchParams.get("accessToken");

  const { mutateAsync } = useLogoutMutation();
  const router = useRouter();

  const ref = useRef<any>(null);
  useEffect(() => {
    // ngoài dùng useRef để xử lý useEffect render 2 lần thì dùng refreshToken để xử lý khi vào url logout trực tiếp sẽ bị logout (troll vn)
    if (
      ref.current ||
      (refreshTokenFromUrl &&
        refreshTokenFromUrl !== getRefreshTokenToLocalStorage()) ||
      (accessTokenFromUrl &&
        accessTokenFromUrl !== getAccessTokenFromLocalStorage())
    )
      return;
    ref.current = mutateAsync;
    mutateAsync().then((res) => {
      setTimeout(() => {
        ref.current = null;
      }, 1000);
      router.push("/login");
    });
  }, [mutateAsync, router, refreshTokenFromUrl, accessTokenFromUrl]);
  return <div>Logout ... </div>;
}
// đã tạm dừng ở phút 12:20

// khi ta sử dụng const logoutMutation = useLogoutMutation(); và gọi logoutMutation.mutateAsync(). object logoutMutation sẽ bị thay đổi tham chiếu mỗi khi ta gọi mutateAsync, dẫn đến dependency của useEffect thay đổi, => vòng lặp vô hạn
