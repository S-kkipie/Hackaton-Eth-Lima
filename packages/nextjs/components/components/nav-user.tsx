"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { CustomConnectButton } from "../scaffold-stark/CustomConnectButton";
export function NavUser() {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <CustomConnectButton />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
