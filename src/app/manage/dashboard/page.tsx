import accountApiRequest from "@/apiRequests/account";
import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  if (!accessToken) {
    throw new Error("Access token is missing");
  }
  let name = "";
  try {
    const response = await accountApiRequest.sMe(accessToken);
    name = response.payload.data.name;
  } catch (error: any) {
    if (error.digest?.includes("NEXT_REDIRECT")) {
      throw error;
    }
  }
  return <div>Dashboard {name}</div>;
}
