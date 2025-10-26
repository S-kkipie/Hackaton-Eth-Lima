// "use client";

import { cn } from "@/lib/utils";
import { Section } from "./features/landing/Section";
import { CenteredMenu } from "./features/landing/CenteredMenu";
import { Title } from "./ui/title";
import { useTargetNetwork } from "@/hooks/scaffold-stark/useTargetNetwork";
import { devnet } from "@starknet-react/chains";
import { useAccount, useNetwork, useProvider } from "@starknet-react/core";
import { useEffect, useState } from "react";
import { CustomConnectButton } from "./scaffold-stark/CustomConnectButton";
import { SwitchTheme } from "./SwitchTheme";
import Link from "next/link";

export default function Header({ className }: { className?: string }) {
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.network === devnet.network;

  const { provider } = useProvider();
  const { address, status, chainId } = useAccount();
  const { chain } = useNetwork();
  const [isDeployed, setIsDeployed] = useState(true);

  useEffect(() => {
    if (
      status === "connected" &&
      address &&
      chainId === targetNetwork.id &&
      chain.network === targetNetwork.network
    ) {
      provider
        .getClassHashAt(address)
        .then((classHash) => {
          if (classHash) setIsDeployed(true);
          else setIsDeployed(false);
        })
        .catch((e) => {
          console.error("contract check", e);
          if (e.toString().includes("Contract not found")) {
            setIsDeployed(false);
          }
        });
    }
  }, [
    status,
    address,
    provider,
    chainId,
    targetNetwork.id,
    targetNetwork.network,
    chain.network,
  ]);

  return (
    <Section className={cn("px-3 py-3 shadow", className)}>
      <CenteredMenu
        logo={<Title>EcoTrace</Title>}
        rightMenu={
          <>
            {status === "connected" && !isDeployed ? (
              <span className="p-1">Wallet Not Deployed</span>
            ) : null}
            <CustomConnectButton />
            {/* <FaucetButton /> */}
            <SwitchTheme
              className={`pointer-events-auto ${
                isLocalNetwork ? "mb-1 lg:mb-0" : ""
              }`}
            />
          </>
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

// function UserMenu({ user }: { user: UserResource }) {
//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild className="cursor-pointer">
//         <div className="flex items-center">
//           <Avatar className="h-8 w-8 rounded-lg ">
//             <AvatarImage
//               src={user.imageUrl ?? undefined}
//               alt={user.fullName ?? undefined}
//             />
//             <AvatarFallback className="rounded-lg">CN</AvatarFallback>
//           </Avatar>
//           <Badge variant="outline" className="ml-2">
//             <MenuIcon />
//           </Badge>
//         </div>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent
//         className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
//         side={"bottom"}
//         align="end"
//         sideOffset={4}
//       >
//         <DropdownMenuLabel className="p-0 font-normal">
//           <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
//             <Avatar className="h-8 w-8 rounded-lg">
//               <AvatarImage
//                 src={user.imageUrl ?? undefined}
//                 alt={user.fullName ?? undefined}
//               />
//               <AvatarFallback className="rounded-lg">CN</AvatarFallback>
//             </Avatar>
//             <div className="grid flex-1 text-left text-sm leading-tight">
//               <span className="truncate font-medium">{user.firstName}</span>
//               <span className="text-muted-foreground truncate text-xs">
//                 {user.primaryEmailAddress?.emailAddress}
//               </span>
//             </div>
//           </div>
//         </DropdownMenuLabel>
//         <DropdownMenuSeparator />
//         <DropdownMenuGroup>
//           <DropdownMenuItem className="cursor-pointer" asChild>
//             <Link href="/app">
//               <HomeIcon />
//               App
//             </Link>
//           </DropdownMenuItem>
//           <DropdownMenuItem>
//             <IconUserCircle />
//             Cuenta
//           </DropdownMenuItem>
//           <DropdownMenuItem>
//             <IconCreditCard />
//             Facturacion
//           </DropdownMenuItem>
//         </DropdownMenuGroup>
//         <DropdownMenuItem className="cursor-pointer">
//           <IconLogout />
//           <SignOutButton>
//             <span>Sign Out</span>
//           </SignOutButton>
//         </DropdownMenuItem>
//       </DropdownMenuContent>
//     </DropdownMenu>
//   );
// }
