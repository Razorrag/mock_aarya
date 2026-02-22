 "use client";

import React from "react";

export default function DevBypassBanner() {
  const enabled = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";
  if (!enabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[45] rounded-full border border-[#F2C29A]/60 bg-[#2A1208]/90 px-4 py-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#F2C29A] shadow-[0_0_20px_rgba(242,194,154,0.2)]">
      Dev Auth Bypass Enabled
    </div>
  );
}
