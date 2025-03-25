import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { HttpError } from "@/lib/http";

export async function POST(request: Request) {
	const body = (await request.json()) as {
		accessToken: string;
		refreshToken: string;
	};
	const { accessToken, refreshToken } = body;
	const cookieStore = await cookies();
	try {
		const decodeAccessToken = jwt.decode(accessToken) as { exp: number };
		const decodeRefreshToken = jwt.decode(refreshToken) as { exp: number };

		cookieStore.set("accessToken", accessToken, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: true,
			// nó có dạng number và là 1 epoch time nên chúng ta không cần new Date()
			expires: decodeAccessToken.exp * 1000,
		});
		cookieStore.set("refreshToken", refreshToken, {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: true,
			expires: decodeRefreshToken.exp * 1000,
		});
		return Response.json(body);
	} catch (error) {
		if (error instanceof HttpError) {
			return Response.json(error.payload, { status: error.status });
		} else {
			return Response.json({ message: "Đã có lỗi xãy ra" }, { status: 500 });
		}
	}
}
