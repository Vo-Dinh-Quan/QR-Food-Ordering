import Logout from "@/app/(public)/(auth)/logout/logout";
import React, { Suspense } from "react";

export const metadata = {
  title: "Logout",
  description: "Logging out of the application",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LogoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Logout />
    </Suspense>
  );
}
