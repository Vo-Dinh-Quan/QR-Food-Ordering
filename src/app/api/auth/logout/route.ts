import authApiRequest from "@/apiRequests/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  // nhận và lấy cookie từ Next Client gửi lên trong header
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  if (!accessToken || !refreshToken) {
    return Response.json(
      { message: "Không nhận được accessToken và refreshToken" },
      { status: 200 }
    );
  }
  try {
    const response = await authApiRequest.sLogout({
      refreshToken,
      accessToken,
    });
    return Response.json(response.payload);
  } catch (error) {
    console.error("error", error);
    return Response.json(
      { message: "Lỗi khi gọi API đến server backend" },
      { status: 200 }
    );
  }
}
