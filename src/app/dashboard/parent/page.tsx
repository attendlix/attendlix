"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ParentRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/student");
  }, [router]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-xs text-slate-500">
      Loading Student & Parent Portal...
    </div>
  );
}
