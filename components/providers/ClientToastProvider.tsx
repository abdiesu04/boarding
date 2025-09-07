"use client";

import dynamic from "next/dynamic";

// Dynamically import ToastProvider with no SSR
const ToastProvider = dynamic(
  () => import("@/components/ui/toast-provider"),
  { ssr: false }
);

export default function ClientToastProvider() {
  return <ToastProvider />;
}
