"use client";

import React, { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLogoutMutation } from "@/queries/useAuth";
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
} from "@/lib/utils";
import { useAppContext } from "@/components/app-provider";

function LogoutContent() {
  const searchParams = useSearchParams();
  const refreshTokenFromUrl = searchParams.get("refreshToken");
  const accessTokenFromUrl = searchParams.get("accessToken");
  const {setIsAuth} = useAppContext();
  const { mutateAsync } = useLogoutMutation();
  const router = useRouter();

  const ref = useRef<any>(null);
  useEffect(() => {
    // ngoài dùng useRef để xử lý useEffect render 2 lần thì dùng refreshToken để xử lý khi vào url logout trực tiếp sẽ bị logout (troll vn)
    if (
      !ref.current &&
      ((refreshTokenFromUrl &&
        refreshTokenFromUrl === getRefreshTokenFromLocalStorage()) ||
      (accessTokenFromUrl &&
        accessTokenFromUrl === getAccessTokenFromLocalStorage()))
    ) {
      ref.current = mutateAsync;
      mutateAsync().then(() => {
        setTimeout(() => {
          ref.current = null;
        }, 1000);
        setIsAuth(false);
        router.push("/login");
      });
    }else {
      router.push("/login");
    }
  }, [mutateAsync, router, refreshTokenFromUrl, accessTokenFromUrl, setIsAuth]);
  return <div>Logout ... </div>;
}

export default function LogoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LogoutContent />
    </Suspense>
  );
}


// khi ta sử dụng const logoutMutation = useLogoutMutation(); và gọi logoutMutation.mutateAsync(). object logoutMutation sẽ bị thay đổi tham chiếu mỗi khi ta gọi mutateAsync, dẫn đến dependency của useEffect thay đổi, => vòng lặp vô hạn
