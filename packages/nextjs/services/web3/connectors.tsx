import { braavos, InjectedConnector, ready } from "@starknet-react/core";
import { BurnerConnector } from "@scaffold-stark/stark-burner";
import { KeplrConnector } from "./keplr";
import { getTargetNetworks } from "../../utils/scaffold-stark/networks";
import scaffoldConfig from "../../scaffold.config";
import { supportedChains } from "../../supportedChains";
import { LAST_CONNECTED_TIME_LOCALSTORAGE_KEY } from "../../utils/Constants";

const targetNetworks = getTargetNetworks();

export const connectors = getConnectors();

// workaround helper function to properly disconnect with removing local storage (prevent autoconnect infinite loop)
function withDisconnectWrapper(connector: InjectedConnector) {
  const connectorDisconnect = connector.disconnect;
  const _disconnect = (): Promise<void> => {
    localStorage.removeItem("lastUsedConnector");
    localStorage.removeItem(LAST_CONNECTED_TIME_LOCALSTORAGE_KEY);
    return connectorDisconnect();
  };
  connector.disconnect = _disconnect.bind(connector);
  return connector;
}

function getConnectors() {
  const { targetNetworks } = scaffoldConfig;

  const connectors: InjectedConnector[] = [ready(), braavos()];
  const isDevnet = targetNetworks.some(
    (network) => (network.network as string) === "devnet",
  );

  if (!isDevnet) {
    connectors.push(new KeplrConnector());
  } else {
    const burnerConnector = new BurnerConnector();
    burnerConnector.chain = supportedChains.devnet;
    connectors.push(burnerConnector as unknown as InjectedConnector);
  }

  return connectors.sort(() => Math.random() - 0.5).map(withDisconnectWrapper);
}

export const appChains = targetNetworks;
