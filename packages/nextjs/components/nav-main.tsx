"use client";

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
import SellProductModal from "./SellProductModal";
import CreateReturnModal from "./CreateReturnModal";
import ValidateReturnModal from "./ValidateReturnModal";

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

  const [openSellProductModal, setOpenSellProductModal] = React.useState(false);

  const [openCreateReturnModal, setOpenCreateReturnModal] =
    React.useState(false);

  const [openValidateReturnModal, setOpenValidateReturnModal] =
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

  return isManufacturer ? (
    <SidebarGroup>
      <SidebarGroupLabel>Fabrica</SidebarGroupLabel>

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

        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog
              open={openSellProductModal}
              onOpenChange={setOpenSellProductModal}
            >
              <DialogTrigger asChild>
                <SidebarMenuButton tooltip="Vender Producto a tienda">
                  <IconCirclePlusFilled />
                  <span>Vender Producto a tienda</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Vender Producto a tienda</DialogTitle>
                  <SellProductModal
                    open={openTransferToStoreModal}
                    onOpenChange={setOpenTransferToStoreModal}
                  />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog
              open={openValidateReturnModal}
              onOpenChange={setOpenValidateReturnModal}
            >
              <DialogTrigger asChild>
                <SidebarMenuButton tooltip="Validar retorno de producto">
                  <IconCirclePlusFilled />
                  <span>Validar retorno de producto</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Validar retorno de producto</DialogTitle>
                  <ValidateReturnModal
                    open={openValidateReturnModal}
                    onOpenChange={setOpenValidateReturnModal}
                  />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ) : isSeller ? (
    <SidebarGroup>
      <SidebarGroupLabel>Tienda</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog
              open={openTransferToStoreModal}
              onOpenChange={setOpenTransferToStoreModal}
            >
              <DialogTrigger asChild>
                <SidebarMenuButton tooltip="Pasar producto a cliente">
                  <IconCirclePlusFilled />
                  <span>Vender Producto a cliente</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Vender Producto a cliente</DialogTitle>
                  <TransferToStoreModal
                    open={openTransferToStoreModal}
                    onOpenChange={setOpenTransferToStoreModal}
                  />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog
              open={openCreateReturnModal}
              onOpenChange={setOpenCreateReturnModal}
            >
              <DialogTrigger asChild>
                <SidebarMenuButton tooltip="Pasar producto a fabrica">
                  <IconCirclePlusFilled />
                  <span>Retornar a fabrica</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Retornar a fabrica</DialogTitle>
                  <CreateReturnModal
                    open={openCreateReturnModal}
                    onOpenChange={setOpenCreateReturnModal}
                    isBuyer
                  />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ) : isBuyer ? (
    <SidebarGroup>
      <SidebarGroupLabel>Cliente</SidebarGroupLabel>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <Dialog
              open={openCreateReturnModal}
              onOpenChange={setOpenCreateReturnModal}
            >
              <DialogTrigger asChild>
                <SidebarMenuButton tooltip="Pasar producto a tienda">
                  <IconCirclePlusFilled />
                  <span>Retornar a tienda</span>
                </SidebarMenuButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Retornar a tienda</DialogTitle>
                  <CreateReturnModal
                    open={openCreateReturnModal}
                    onOpenChange={setOpenCreateReturnModal}
                    isBuyer
                  />
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ) : null;
}
