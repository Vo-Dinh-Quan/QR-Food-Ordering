import http from "@/lib/http";
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
} from "@/schemaValidations/auth.schema";

const authApiRequest = {
  sLogin: (body: LoginBodyType) => http.post<LoginResType>("/auth/login", body),
  cLogin: (body: LoginBodyType) =>
    http.post<LoginResType>("/api/auth/login", body, {
      baseUrl: "",
    }),
  // note: vì sLogout là ở server nên nó không được tự động truyền accessToken vào header
  sLogout: (body: LogoutBodyType & { accessToken: string }) =>
    http.post(
      "/auth/logout",
      {
        refreshToken: body.refreshToken,
      },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      }
    ),
  // ở client thì nó tự động truyền accessToken (localStorage) vào header rồi, nên body từ next client truyền lên chỉ cần refreshToken là đủ
  // client gọi đến route handler, không cần truyền AT và RT vào body vì nó đã tự động gửi thông qua cookie rồi
  cLogout: () =>
    http.post("/api/auth/logout", null, {
      baseUrl: "",
    }),
};

export default authApiRequest;
