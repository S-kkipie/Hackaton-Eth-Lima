"use client";

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateProductModal from "./CreateProductModal";
import React from "react";
import { useAccount } from "@/hooks/useAccount";
import { useScaffoldReadContract } from "@/hooks/scaffold-stark/useScaffoldReadContract";
import { toast } from "sonner";
import TransferToStoreModal from "./TransferToStore";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const [openCreateProductModal, setOpenCreateProductModal] =
    React.useState(false);
  const [openTransferToStoreModal, setOpenTransferToStoreModal] =
    React.useState(false);

  const { address } = useAccount();

  const { data: userRole } = useScaffoldReadContract({
    contractName: "IdentityRegistry",
    functionName: "get_role",
    args: address ? [address] : undefined,
  });

  const isManufacturer = userRole === 1n;
  const isSeller = userRole === 2n;
  const isBuyer = userRole === 3n;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog
              open={openCreateProductModal}
              onOpenChange={setOpenCreateProductModal}
            >
              <DialogTrigger asChild>
                <SidebarMenuButton
                  tooltip="Crear producto"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                >
                  <IconCirclePlusFilled />
                  <span>Crear producto</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crea un nuevo producto</DialogTitle>
                  <CreateProductModal
                    open={openCreateProductModal}
                    onOpenChange={setOpenCreateProductModal}
                  />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
        {isManufacturer && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <Dialog
                open={openCreateProductModal}
                onOpenChange={setOpenCreateProductModal}
              >
                <DialogTrigger asChild>
                  <SidebarMenuButton tooltip="Pasar producto a tienda">
                    <IconCirclePlusFilled />
                    <span>Pasar producto a tienda</span>
                  </SidebarMenuButton>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Pasar producto a tienda</DialogTitle>
                    <TransferToStoreModal
                      open={openTransferToStoreModal}
                      onOpenChange={setOpenTransferToStoreModal}
                    />
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
