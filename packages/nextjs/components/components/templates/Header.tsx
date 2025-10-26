"use client";
import { HomeIcon, MenuIcon } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { AvatarImage, AvatarFallback, Avatar } from "../ui/avatar";
import { Button } from "../ui/button";
import { Section } from "../features/landing/Section";
import { CenteredMenu } from "../features/landing/CenteredMenu";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import type { UserResource } from "@clerk/types";
import { Badge } from "../ui/badge";
import {
  IconUserCircle,
  IconCreditCard,
  IconLogout,
} from "@tabler/icons-react";

export default function Header({ className }: { className?: string }) {
  const { user } = useUser();
  return (
    <Section className={cn("px-3 py-3 shadow", className)}>
      <CenteredMenu
        logo={<Logo />}
        rightMenu={
          user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <li className="ml-1 mr-2.5">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/sign-in">Iniciar Sesión</Link>
                </Button>
              </li>
              <li>
                <Button asChild className="rounded-full">
                  <Link href="/sign-up">Regístrate</Link>
                </Button>
              </li>
            </>
          )
        }
      >
        <li>
          <Link className="transition-all duration-75" href="/sign-up">
            Producto
          </Link>
        </li>

        <li>
          <Link className="transition-all duration-75" href="/sign-up">
            Documentación
          </Link>
        </li>

        <li>
          <Link className="transition-all duration-75" href="/sign-up">
            Blog
          </Link>
        </li>

        <li>
          <Link className="transition-all duration-75" href="/sign-up">
            Comunidad
          </Link>
        </li>

        <li>
          <Link className="transition-all duration-75" href="/sign-up">
            Compañía
          </Link>
        </li>
      </CenteredMenu>
    </Section>
  );
}

function UserMenu({ user }: { user: UserResource }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer">
        <div className="flex items-center">
          <Avatar className="h-8 w-8 rounded-lg ">
            <AvatarImage
              src={user.imageUrl ?? undefined}
              alt={user.fullName ?? undefined}
            />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <Badge variant="outline" className="ml-2">
            <MenuIcon />
          </Badge>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={"bottom"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage
                src={user.imageUrl ?? undefined}
                alt={user.fullName ?? undefined}
              />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.firstName}</span>
              <span className="text-muted-foreground truncate text-xs">
                {user.primaryEmailAddress?.emailAddress}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="cursor-pointer" asChild>
            <Link href="/app">
              <HomeIcon />
              App
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconUserCircle />
            Cuenta
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconCreditCard />
            Facturacion
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuItem className="cursor-pointer">
          <IconLogout />
          <SignOutButton>
            <span>Sign Out</span>
          </SignOutButton>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
