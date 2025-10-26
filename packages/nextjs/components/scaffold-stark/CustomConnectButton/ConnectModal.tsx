import { Connector, useConnect } from "@starknet-react/core";
import { useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { BurnerConnector, burnerAccounts } from "@scaffold-stark/stark-burner";
import { useTheme } from "next-themes";
import { BlockieAvatar } from "../BlockieAvatar";
import Wallet from "./Wallet";
import { LAST_CONNECTED_TIME_LOCALSTORAGE_KEY } from "@/utils/Constants";
import { useTargetNetwork } from "@/hooks/scaffold-stark/useTargetNetwork";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const loader = ({ src }: { src: string }) => src;

const ConnectModal = () => {
  const [isBurnerWallet, setIsBurnerWallet] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";
  const { connectors, connect } = useConnect();
  const [, setLastConnector] = useLocalStorage<{ id: string; ix?: number }>(
    "lastUsedConnector",
    { id: "" }
  );
  const [, setLastConnectionTime] = useLocalStorage<number>(
    LAST_CONNECTED_TIME_LOCALSTORAGE_KEY,
    0
  );
  const [, setWasDisconnectedManually] = useLocalStorage<boolean>(
    "wasDisconnectedManually",
    false
  );
  const { targetNetwork } = useTargetNetwork();
  const [showOtherOptions, setShowOtherOptions] = useState(false);

  // Identify devnet by network name
  const isDevnet = targetNetwork.network === "devnet";

  // Split connectors into main and other options for devnet
  let mainConnectors = connectors;
  let otherConnectors: typeof connectors = [];
  if (isDevnet) {
    mainConnectors = connectors.filter((c) => c.id === "burner-wallet");
    otherConnectors = connectors.filter((c) => c.id !== "burner-wallet");
  }

  function handleConnectWallet(
    e: React.MouseEvent<HTMLButtonElement>,
    connector: Connector
  ) {
    if (connector.id === "burner-wallet") {
      setIsBurnerWallet(true);
      return;
    }
    setWasDisconnectedManually(false);
    connect({ connector });
    setLastConnector({ id: connector.id });
    setLastConnectionTime(Date.now());
    // handleCloseModal();
  }

  function handleConnectBurner(
    e: React.MouseEvent<HTMLButtonElement>,
    ix: number
  ) {
    const connector = connectors.find((it) => it.id == "burner-wallet");
    if (connector && connector instanceof BurnerConnector) {
      connector.burnerAccount = burnerAccounts[ix];
      setWasDisconnectedManually(false);
      connect({ connector });
      setLastConnector({ id: connector.id, ix });
      setLastConnectionTime(Date.now());
      // handleCloseModal();
    }
  }

  return (
    <div>
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setIsBurnerWallet(false);
            setShowOtherOptions(false);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button>Conectar</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isBurnerWallet
                ? "Escoja una cuenta Burner"
                : showOtherOptions
                  ? "Otras opciones de wallet"
                  : "Conectar una wallet"}
            </DialogTitle>
              <div className="flex flex-col flex-1 lg:grid">
                <div className="flex flex-col gap-4 w-full px-8 py-10">
                  {!isBurnerWallet ? (
                    !showOtherOptions ? (
                      <>
                        {mainConnectors.map((connector, index) => (
                          <Wallet
                            key={connector.id || index}
                            connector={connector}
                            loader={loader}
                            handleConnectWallet={handleConnectWallet}
                          />
                        ))}
                        {isDevnet && otherConnectors.length > 0 && (
                          <Button
                            variant="outline"
                            onClick={() => setShowOtherOptions(true)}
                          >
                            Otras opciones
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        {otherConnectors.map((connector, index) => (
                          <Wallet
                            key={connector.id || index}
                            connector={connector}
                            loader={loader}
                            handleConnectWallet={handleConnectWallet}
                          />
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => setShowOtherOptions(false)}
                        >
                          Atras
                        </Button>
                      </>
                    )
                  ) : (
                    <div className="flex flex-col pb-5 justify-end gap-3">
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
                            />
                            {`${burnerAcc.accountAddress.slice(0, 6)}...${burnerAcc.accountAddress.slice(-4)}`}
                          </Button>
                        ))}
                      </ScrollArea>
                      <Button
                        variant="outline"
                        onClick={() => setIsBurnerWallet(false)}
                      >
                        Atras
                      </Button>
                    </div>
                  )}
                </div>
              </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConnectModal;
