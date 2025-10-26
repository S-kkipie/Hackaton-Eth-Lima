import { useState } from "react";
import { NetworkOptions } from "./NetworkOptions";
import CopyToClipboard from "react-copy-to-clipboard";
import { Address as AddressC } from "../Address";

import { useLocalStorage } from "usehooks-ts";
import { BurnerConnector, burnerAccounts } from "@scaffold-stark/stark-burner";
import { Address } from "@starknet-react/chains";
import { useDisconnect, useNetwork, useConnect } from "@starknet-react/core";
import { useTheme } from "next-themes";
import { default as NextImage } from "next/image";
import {
  CheckCircleIcon,
  DocumentDuplicateIcon,
  QrCodeIcon,
  ArrowTopRightOnSquareIcon,
  UserCircleIcon,
  ArrowLeftEndOnRectangleIcon,
} from "@heroicons/react/20/solid";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { isENS } from "../Input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getTargetNetworks, notification } from "@/utils/scaffold-stark";
import { useScaffoldStarkProfile } from "@/hooks/scaffold-stark/useScaffoldStarkProfile";
import { getStarknetPFPIfExists } from "@/utils/profile";
import { BlockieAvatar } from "../BlockieAvatar";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
const allowedNetworks = getTargetNetworks();

type AddressInfoDropdownProps = {
  address: Address;
  blockExplorerAddressLink: string | undefined;
  displayName: string;
  ensAvatar?: string;
};

export const AddressInfoDropdown = ({
  address,
  ensAvatar,
  displayName,
  blockExplorerAddressLink,
}: AddressInfoDropdownProps) => {
  const { disconnect } = useDisconnect();
  const [addressCopied, setAddressCopied] = useState(false);
  const { data: profile } = useScaffoldStarkProfile(address);
  const { chain } = useNetwork();
  const [showBurnerAccounts, setShowBurnerAccounts] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [selectingNetwork, setSelectingNetwork] = useState(false);
  const { connectors, connect } = useConnect();
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  // const dropdownRef = useRef<HTMLDetailsElement>(null);
  // const closeDropdown = () => {
  //   setSelectingNetwork(false);
  //   dropdownRef.current?.removeAttribute("open");
  // };

  // useOutsideClick(dropdownRef, closeDropdown);

  function handleConnectBurner(
    e: React.MouseEvent<HTMLButtonElement>,
    ix: number
  ) {
    const connector = connectors.find((it) => it.id == "burner-wallet");
    if (connector && connector instanceof BurnerConnector) {
      connector.burnerAccount = burnerAccounts[ix];
      connect({ connector });
      setLastConnector({ id: connector.id, ix });
      setShowBurnerAccounts(false);
    }
  }

  const [_, setLastConnector] = useLocalStorage<{ id: string; ix?: number }>(
    "lastUsedConnector",
    { id: "" },
    {
      initializeWithValue: false,
    }
  );

  const [, setWasDisconnectedManually] = useLocalStorage<boolean>(
    "wasDisconnectedManually",
    false,
    {
      initializeWithValue: false,
    }
  );

  const handleDisconnect = () => {
    try {
      disconnect();
      localStorage.removeItem("lastUsedConnector");
      localStorage.removeItem("lastConnectionTime");
      setWasDisconnectedManually(true);
      window.dispatchEvent(new Event("manualDisconnect"));
      notification.success("Disconnect successfully!");
    } catch (err) {
      console.log(err);
      notification.success("Disconnect failure!");
    }
  };
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="gap-0 h-auto! flex items-center">
          <div className="hidden [@media(min-width:412px)]:block">
            {getStarknetPFPIfExists(profile?.profilePicture) ? (
              <NextImage
                src={profile?.profilePicture || ""}
                alt="Profile Picture"
                className="rounded-full"
                width={30}
                height={30}
              />
            ) : (
              <BlockieAvatar address={address} size={28} ensImage={ensAvatar} />
            )}
          </div>
          <span className="ml-2 mr-2 text-sm">
            {isENS(displayName)
              ? displayName
              : profile?.name ||
                address?.slice(0, 6) + "..." + address?.slice(-4)}
          </span>
          <ChevronDownIcon className="h-6 w-4 ml-2 sm:ml-0 sm:block hidden" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <NetworkOptions hidden={!selectingNetwork} />
          <DropdownMenuItem className={selectingNetwork ? "hidden" : ""}>
            {addressCopied ? (
              <div className="btn-sm rounded-xl! flex gap-3">
                <CheckCircleIcon
                  className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                  aria-hidden="true"
                />
                <span className=" whitespace-nowrap">Copy address</span>
              </div>
            ) : (
              //@ts-ignore
              <CopyToClipboard
                text={address}
                onCopy={() => {
                  setAddressCopied(true);
                  setTimeout(() => {
                    setAddressCopied(false);
                  }, 1200);
                }}
              >
                <div className="btn-sm rounded-xl! flex gap-3">
                  <DocumentDuplicateIcon
                    className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                    aria-hidden="true"
                  />
                  <span className=" whitespace-nowrap">Copiar direccion</span>
                </div>
              </CopyToClipboard>
            )}
          </DropdownMenuItem>
          {/* //todo qr code */}
          <DropdownMenuItem
            onSelect={() => setShowQRCodeModal(true)}
            className={selectingNetwork ? "hidden" : "flex gap-3"}
          >
            <QrCodeIcon className="h-6 w-4 ml-2 sm:ml-0" />
            <span className="whitespace-nowrap">Ver código QR</span>
          </DropdownMenuItem>
          {chain.network != "devnet" ? (
            <DropdownMenuItem
              className={selectingNetwork ? "hidden" : "flex gap-3"}
            >
              <ArrowTopRightOnSquareIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <Link
                target="_blank"
                href={blockExplorerAddressLink}
                rel="noopener noreferrer"
                className="whitespace-nowrap"
              >
                Ver en el explorador de bloques
              </Link>
            </DropdownMenuItem>
          ) : null}

          {chain.network == "devnet" ? (
            <DropdownMenuItem
              onSelect={() => {
                setShowBurnerAccounts(true);
              }}
              className={selectingNetwork ? "hidden" : "flex gap-3"}
            >
              <UserCircleIcon className="h-6 w-4 ml-2 sm:ml-0" />
              <span className="whitespace-nowrap">Cambiar de cuenta</span>
            </DropdownMenuItem>
          ) : null}

          {/* TODO: reinstate if needed */}
          {/* {allowedNetworks.length > 1 ? (
            <li className={selectingNetwork ? "hidden" : ""}>
              <button
                className="btn-sm rounded-xl! flex gap-3 py-3"
                type="button"
                onClick={() => {
                  setSelectingNetwork(true);
                }}
              >
                <ArrowsRightLeftIcon className="h-6 w-4 ml-2 sm:ml-0" />{" "}
                <span>Switch Network</span>
              </button>
            </li>
          ) : null} */}
          <DropdownMenuItem
            onClick={handleDisconnect}
            className={selectingNetwork ? "hidden" : "flex gap-3"}
          >
            <ArrowLeftEndOnRectangleIcon className="h-6 w-4 ml-2 sm:ml-0" />
            <span>Disconnect</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showBurnerAccounts} onOpenChange={setShowBurnerAccounts}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Escoje una cuenta</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-3 mx-8 pb-10 pt-8">
            <ScrollArea className="h-[300px] overflow-y-auto flex w-full flex-col gap-4">
              {burnerAccounts.map((burnerAcc, ix) => (
                <Button
                  key={burnerAcc.publicKey}
                  variant="outline"
                  className="py-6 my-1 w-full"
                  onClick={(e) => handleConnectBurner(e, ix)}
                >
                  <BlockieAvatar
                    address={burnerAcc.accountAddress}
                    size={35}
                  ></BlockieAvatar>
                  {`${burnerAcc.accountAddress.slice(
                    0,
                    6
                  )}...${burnerAcc.accountAddress.slice(-4)}`}
                </Button>
              ))}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={showQRCodeModal} onOpenChange={setShowQRCodeModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Address QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-6">
            <div className="flex space-x-4 flex-col items-center gap-6">
              <QRCodeSVG value={address} size={256} />
              <AddressC address={address} format="short" disableAddressLink />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
