import authApiRequest from "@/apiRequests/auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) {
    return Response.json(
      { message: "Không tìm thấy refresh token" },
      { status: 401 }
    );
  }
  try {
    const { payload } = await authApiRequest.sRefreshToken({ refreshToken });

    const decodeAccessToken = jwt.decode(payload.data.accessToken) as {
      exp: number;
    };
    // console.log("decodeAccessToken", decodeAccessToken);
    const decodeRefreshToken = jwt.decode(payload.data.refreshToken) as {
      exp: number;
    };

    cookieStore.set("accessToken", payload.data.accessToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      // nó có dạng number và là 1 epoch time nên chúng ta không cần new Date()
      expires: decodeAccessToken.exp * 1000,
    });
    cookieStore.set("refreshToken", payload.data.refreshToken, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: decodeRefreshToken.exp * 1000,
    });
    return Response.json(payload);
  } catch (error: any) {
    return Response.json(
      { message: error.message ?? "Đã có lỗi xãy ra" },
      { status: 401 }
    );
  }
}
