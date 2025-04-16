import RefreshToken from "@/components/refresh-token";
import React, { Suspense } from "react";

export const metadata = {
  title: "Refresh Token",
  description: "Refreshing authentication token",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RefreshTokenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RefreshToken />
    </Suspense>
  );
}
