import { z } from "zod";

const configSchema = z.object({
	// định nghĩa schema object
	NEXT_PUBLIC_API_ENDPOINT: z.string(),
	NEXT_PUBLIC_API_URL: z.string(),
	NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string(),
	NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI: z.string(),
});

const configProject = configSchema.safeParse({
	// validate config dựa trên biến env
	NEXT_PUBLIC_API_ENDPOINT: process.env.NEXT_PUBLIC_API_ENDPOINT,
	NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
	NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
	NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI:
		process.env.NEXT_PUBLIC_GOOGLE_AUTHORIZED_REDIRECT_URI,
});

if (!configProject.success) {
	console.error(configProject.error);
	throw new Error("Các khai báo biến môi trường không hợp lệ");
}

const envConfig = configProject.data;

export default envConfig;
