"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import {
  checkAndRefreshToken,
  getRefreshTokenFromLocalStorage,
} from "@/lib/utils";

function RefreshTokenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refreshTokenFromUrl = searchParams.get("refreshToken");
  const redirectPathname = searchParams.get("redirect");

  useEffect(() => {
    // ngoài dùng useRef để xử lý useEffect render 2 lần thì dùng refreshToken để xử lý khi vào url logout trực tiếp sẽ bị logout (troll vn)
    if (
      refreshTokenFromUrl &&
      refreshTokenFromUrl === getRefreshTokenFromLocalStorage()
    ) {
      checkAndRefreshToken({
        onSuccess: () => {
          router.push(redirectPathname || "/");
        },
      });
    }else {
      router.push("/login");
    }
  }, [router, refreshTokenFromUrl, redirectPathname]);
  return <div>Refresh Token Page ...</div>;
}

export default function RefreshTokenPage() {
  // Component nội bộ chứa toàn bộ logic sử dụng useSearchParams()
  return (
    // You could have a loading skeleton as the `fallback` too
    <Suspense fallback={<div>Đang tải...</div>}>
      <RefreshTokenContent />
    </Suspense>
  );
}

// khi ta sử dụng const logoutMutation = useLogoutMutation(); và gọi logoutMutation.mutateAsync(). object logoutMutation sẽ bị thay đổi tham chiếu mỗi khi ta gọi mutateAsync, dẫn đến dependency của useEffect thay đổi, => vòng lặp vô hạn
