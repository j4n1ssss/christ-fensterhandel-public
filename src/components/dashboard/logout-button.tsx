"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/users/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-black-600 transition-colors hover:bg-black-50 hover:text-black-950"
      title="Abmelden"
    >
      <LogOut className="size-3.5" aria-hidden />
      <span className="hidden sm:inline">Abmelden</span>
    </button>
  );
}
