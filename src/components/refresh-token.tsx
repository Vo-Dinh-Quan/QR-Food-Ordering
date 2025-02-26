"use-client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import jwt from "jsonwebtoken";
import authApiRequest from "@/apiRequests/auth";
import { setAccessTokenToLocalStorage, setRefreshTokenToLocalStorage } from "@/lib/utils";

// Những page sau sẽ không check refresh token
const UNAUTHENTICATED_PAGES = ["/login", "/logout", "refresh-token"];

export default function RefreshToken() {
  const pathname = usePathname();
  console.log("pathname", pathname);
  useEffect(() => {
    if (UNAUTHENTICATED_PAGES.includes(pathname)) return;
    let interval: any = null;
    const checkAndRefreshToken = async () => {
      // không nên đưa logic lấy access, refresh token ra khỏi func checkAndRefresh
      // vì để mỗi lần checkAndRefreshToken chạy thì nó sẽ fetch lại cho chúng ta cặp token mới
      // tránh hiện tượng bug nó lấy token cũ ở lần đầu rồi gọi cho các lần tiếp theo
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      // chưa đăng nhập thì củng không cho chạy
      if (!accessToken || !refreshToken) return;
      const decodeAccessToken = jwt.decode(accessToken) as {
        exp: number; // thời điểm hết hạn của token (đơn vị: s) 
        iat: number; // thời điểm tạo token (đơn vị: s)
      };
      const decodeRefreshToken = jwt.decode(refreshToken) as {
        exp: number; // thời điểm hết hạn của token (đơn vị: s)
        iat: number; // thời điểm tạo token (đơn vị: s)
      };
      // thời điểm hết hạn của token được tính theo epoch time (s)
      // còn khi dùng cú pháp new Date().getTime() thì nó trả về epoch time (ms)
      const now = Math.round(new Date().getTime() / 1000);
      // trường hợp refresh token hết hạn thì không xử lý nữa
      if (decodeRefreshToken.exp < now) return; // nếu số giây ở thời điểm hiện tại lớn hơn số giây ở thời điểm hết hạn của token thì token đã hết hạn
      // ví dụ access token hết hạn 10 phút thì mình sẽ kiểm tra 1/3 thời gian (3p) thì mình sẽ cho refresh token lại. 
      // thời gian còn lại sẽ tính dựa trên công thức: decodeAccessToken.exp - now
      // thời gian hết hạn của access token dựa trên công thức: decodeAccessToken.exp - decodeAccessToken.iat
      if (decodeAccessToken.exp - now < (decodeAccessToken.exp - decodeAccessToken.iat) / 3) {
        // gọi API refresh token
        try {
          const response = await authApiRequest.cRefreshToken();
          setAccessTokenToLocalStorage(response.payload.data.accessToken);
          setRefreshTokenToLocalStorage(response.payload.data.refreshToken);
        } catch (error) {
          clearInterval(interval); // nếu có lỗi thì dừng interval
        }
      };
    };
    // phải gọi lần đầu tiên, vì interval sẽ chạy sau thời gian TIMEOUT
    checkAndRefreshToken();
    // TIMEOUT interval phải bé hơn thời gian hết hạn của access token
    // vd: thời gian sống của access token là 10s thì TIMEOUT out là 1s
    const TIMEOUT = 1000;
    interval = setInterval(checkAndRefreshToken, TIMEOUT);
    fetch("/api/auth/refresh-token", { method: "POST" });
    return () => clearInterval(interval); // clear interval khi component unmount
  }, [pathname]);
  return null;
}


// vấn đề gặp phải: duplicate gọi API refresh token liên tục quá nhanh, dẫn đến cả 2 request đều dùng chung token để gửi đi, dẫn đến lỗi 401

// chia ra 2 vấn đề con cần giải quyết:
// 1. Nhiều interval đang chạy đồng thời Nếu component re-render hoặc useEffect chạy lại (ví dụ, khi pathname thay đổi) mà interval cũ không được clear đúng cách, sẽ có nhiều interval hoạt động đồng thời. Mỗi interval sẽ gọi hàm checkAndRefreshToken định kỳ, dẫn đến việc gọi API refresh token nhiều lần.
// => cách xử lý: clear interval bằng return của useEffect

// 2. Không đồng bộ khi gọi API: Nếu hàm checkAndRefreshToken chưa hoàn thành một lần gọi API refresh token nhưng lại được gọi lại từ interval mới, sẽ có nhiều yêu cầu gửi đi cùng lúc. Điều này có thể dẫn đến việc hệ thống nhận về token giống nhau từ các request trùng lặp.
// => cách xử lý: trong file auth.ts 