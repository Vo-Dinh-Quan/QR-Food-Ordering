import accountApiRequest from "@/apiRequests/account";
import { cookies } from "next/headers";
import React from "react";

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
    if (error.digest?.includes("NEXT_REDIRECT")) throw error; // xử lý trường hợp sử dụng redirect ở http.ts nó sẽ throw lỗi, chúng ta sẽ không catch thằng này
  }
  return <div>Dashboard {name}</div>;
}
