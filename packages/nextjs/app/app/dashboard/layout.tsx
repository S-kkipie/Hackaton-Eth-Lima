"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { useClientLoading } from "@/components/client-loading";
import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/templates/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useScaffoldReadContract } from "@/hooks/scaffold-stark/useScaffoldReadContract";
import { useAccount } from "@/hooks/useAccount";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { setClientLoading } = useClientLoading();
  const { address } = useAccount();

  const { data: userRole } = useScaffoldReadContract({
    contractName: "IdentityRegistry",
    functionName: "get_role",
    args: address ? [address] : undefined,
  });

 
  useEffect(() => {
    if (userRole === 0n) {
      toast.warning("Porfavor registrate antes.");
      redirect("/app");
    } else if (userRole === 1n) {
      toast.success("Connected as Manufacturer");
    } else if (userRole === 2n) {
      toast.success("Connected as Seller");
    } else if (userRole === 3n) {
      toast.success("Connected as Buyer");
    }
  }, [address, userRole]);
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader home />
        {children}
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
