import http from "@/lib/http";
import {
	LoginBodyType,
	LoginResType,
	LogoutBodyType,
	RefreshTokenBodyType,
	RefreshTokenResType,
} from "@/schemaValidations/auth.schema";

const authApiRequest = {
	// khai báo 1 key ban đầu là null và kiểu dữ liệu là Promise<RefreshTokenResType> | null
	// Phần null as Promise<...> | null là một ép kiểu (type assertion). Nó cho TypeScript biết rằng mặc dù giá trị hiện tại là null, nhưng về mặt kiểu dữ liệu, biến này có thể nhận một giá trị thuộc kiểu:
	// Promise<{ status: number; payload: RefreshTokenResType; }> hoặc null.
	refreshTokenRequest: null as Promise<{
		status: number;
		payload: RefreshTokenResType;
	}> | null,

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
	sRefreshToken: (body: RefreshTokenBodyType) =>
		http.post<RefreshTokenResType>("auth/refresh-token", body),
	async cRefreshToken() {
		if (this.refreshTokenRequest) return this.refreshTokenRequest; // nếu refreshTokenRequest đã tồn tại thì return luôn
		this.refreshTokenRequest = http.post<RefreshTokenResType>(
			"/api/auth/refresh-token",
			null,
			{
				baseUrl: "",
			}
		);
		const response = await this.refreshTokenRequest;
		this.refreshTokenRequest = null;
		return response;
	},
	setTokenToCookie: (body: { accessToken: string; refreshToken: string }) =>
		http.post("/api/auth/token", body, { baseUrl: "" }),
};

export default authApiRequest;
