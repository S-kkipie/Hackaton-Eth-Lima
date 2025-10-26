"use client";

import { AppSidebar } from "@/components/components/app-sidebar";
import { useClientLoading } from "@/components/components/client-loading";
import { SiteHeader } from "@/components/components/site-header";
import { Footer } from "@/components/templates/Footer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { setClientLoading } = useClientLoading();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader  home />
        {children}
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
