import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import OAuth from "@/app/(public)/(auth)/login/oauth/oauth";

// Dynamically import the OAuth component as it is a client component

export const metadata = {
  title: "OAuth",
  description: "Processing OAuth authentication",
};

export default function OAuthPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OAuth />
    </Suspense>
  );
}
