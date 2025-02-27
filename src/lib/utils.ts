import { toast } from "sonner";
import { EntityError } from "@/lib/http";
import { type ClassValue, clsx } from "clsx";
import { UseFormSetError } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import jwt from "jsonwebtoken";
import authApiRequest from "@/apiRequests/auth";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const handleErrorApi = ({
  error,
  setError,
  duration,
} : {
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

export const removeTokensFromLocalStorage = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const checkAndRefreshToken = async (params?: {
  // params là một object có thể có hoặc không có, nếu có thì nó sẽ có 2 key là onError và onSuccess và cả 2 đều là function
  onError?: () => void;
  onSuccess?: () => void;
}) => {
  // không nên đưa logic lấy access, refresh token ra khỏi func checkAndRefresh
  // vì để mỗi lần checkAndRefreshToken chạy thì nó sẽ fetch lại cho chúng ta cặp token mới
  // tránh hiện tượng bug nó lấy token cũ ở lần đầu rồi gọi cho các lần tiếp theo
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  // chưa đăng nhập thì củng không cho chạy
  if (!accessToken || !refreshToken) return;
  const decodedAccessToken = jwt.decode(accessToken) as {
    exp: number; // thời điểm hết hạn của token (đơn vị: s)
    iat: number; // thời điểm tạo token (đơn vị: s)
  };
  const decodedRefreshToken = jwt.decode(refreshToken) as {
    exp: number; // thời điểm hết hạn của token (đơn vị: s)
    iat: number; // thời điểm tạo token (đơn vị: s)
  };
  // thời điểm hết hạn của token được tính theo epoch time (s)
  // còn khi dùng cú pháp new Date().getTime() thì nó trả về epoch time (ms)

  // bug ở đây có 2 vấn đề, 1 là làm tròn lên dẫn đến hết hạn sớm hơn. 2 là cookie đổi sang ms nó cao hơn vài trăm ms so với epoch time trong localStorage. dẫn đến middleware check có token nên => /home thay vì /login
  const now = (new Date().getTime() / 1000) - 1; // không làm tròn chỗ này (-1s trừ hao do trong cookie hết hạn trễ hơn localStorage vài trăm ms)
  // trường hợp refresh token hết hạn thì không xử lý nữa
  if (now >= decodedRefreshToken.exp) {
    removeTokensFromLocalStorage();
    if (params?.onError) return params.onError();
  } // nếu số giây ở thời điểm hiện tại lớn hơn số giây ở thời điểm hết hạn của token thì token đã hết hạn
  // ví dụ access token hết hạn 10 phút thì mình sẽ kiểm tra 1/3 thời gian (3p) thì mình sẽ cho refresh token lại.
  // thời gian còn lại sẽ tính dựa trên công thức: decodedAccessToken.exp - now
  // thời gian hết hạn của access token dựa trên công thức: decodedAccessToken.exp - decodedAccessToken.iat
  if (
    decodedAccessToken.exp - now <
    (decodedAccessToken.exp - decodedAccessToken.iat) / 3
  ) {
    // gọi API refresh token
    try {
      const response = await authApiRequest.cRefreshToken(); // nếu thực chất refresh token nó vừa mới hết hạn rồi nhưng ta cố tình trừ now đi 1s thì tính là chưa hết hạn, xuống dưới đây gọi api thì nó check đã hết hạn rồi thì sẽ đc tự logout thôi
      setAccessTokenToLocalStorage(response.payload.data.accessToken);
      setRefreshTokenToLocalStorage(response.payload.data.refreshToken);
      if (params?.onSuccess) params.onSuccess();
    } catch (error) {
      if (params?.onError) params.onError();
    }
  }
};
