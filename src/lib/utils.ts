import { toast } from "sonner";
import { EntityError } from "@/lib/http";
import { type ClassValue, clsx } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any;
  setError?: UseFormSetError<any>;
  duration?: number;
}) => {
  if (error instanceof EntityError && setError) {
    // nếu mà có lỗi 422 thì nó sẽ lặp qua từng lỗi và gọi setError để hiển thị lỗi
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: "server",
        message: item.message,
      });
    });
  } else {
    toast("Lỗi", {
      description: error?.payload?.message ?? "Lỗi không xác định",
      action: {
        label: "Ẩn",
        onClick: () => console.log("Lỗi"),
      },
      duration: duration ?? 5000,
    });
  }
};
/**
 * Xóa đi ký tự `/` đầu tiên của path
 */
export const normalizePath = (path: string) => {
  return path.startsWith("/") ? path.slice(1) : path;
};

export const decodeJWT = <Payload = any>(token: string) => {
  return jwt.decode(token) as Payload;
};

const isBrowser = typeof window !== "undefined"; // thằng này được sử dụng trong nav-items.tsx, kiểm tra trước vì nav-items.tsx với use client nó sẽ chạy ở 2 môi trường, 1 là lúc build, 2 là lúc chạy ở browser, nên nó sẽ bị lỗi localStorage is not defined
export const getAccessTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("accessToken") : null;
export const getRefreshTokenFromLocalStorage = () =>
  isBrowser ? localStorage.getItem("refreshToken") : null;

export const setAccessTokenToLocalStorage = (accessToken: string) =>
  isBrowser ? localStorage.setItem("accessToken", accessToken) : null;
export const setRefreshTokenToLocalStorage = (refreshToken: string) =>
  isBrowser ? localStorage.setItem("refreshToken", refreshToken) : null;
