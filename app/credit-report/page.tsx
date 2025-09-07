"use client";
import { Suspense } from "react";
import CreditReportContent from "./component/CreditReportContent";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreditReportContent />
    </Suspense>
  );
}