"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  checkAndRefreshToken,
  getRefreshTokenFromLocalStorage,
} from "@/lib/utils";

export default function RefreshToken() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshTokenFromUrl = searchParams.get("refreshToken");
  const redirectPathname = searchParams.get("redirect");

  useEffect(() => {
    if (
      refreshTokenFromUrl &&
      refreshTokenFromUrl === getRefreshTokenFromLocalStorage()
    ) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || "/");
        },
      });
    } else {
      router.push("/login");
    }
  }, [router, refreshTokenFromUrl, redirectPathname]);

  return <div>Refresh Token Page ...</div>;
}

// khi ta sử dụng const logoutMutation = useLogoutMutation(); và gọi logoutMutation.mutateAsync(). object logoutMutation sẽ bị thay đổi tham chiếu mỗi khi ta gọi mutateAsync, dẫn đến dependency của useEffect thay đổi, => vòng lặp vô hạn
