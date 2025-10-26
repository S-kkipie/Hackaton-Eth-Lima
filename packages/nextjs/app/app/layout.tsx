"use client"
import { useAccount } from "@/hooks/useAccount";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { address, status } = useAccount();

  useEffect(() => {
    if (status === "disconnected") {
      toast.warning("Please connect your wallet to continue.");
      redirect("/");
    } else if (status === "connected") {
      toast.success("Connected with address: " + address);
    }
  }, [address, status]);
  return <>{children}</>;
}
