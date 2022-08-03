import { getStarknet, disconnect } from "get-starknet";

export const isWalletConnected = (): boolean => !!getStarknet()?.isConnected;

export const connectWallet = async () =>
  await getStarknet().enable({ showModal: true });

export const walletAddress = async (): Promise<string | undefined> => {
  try {
    const [address] = await getStarknet().enable();
    return address;
  } catch {}
};

export const networkId = () => {
  try {
    const { baseUrl } = getStarknet().provider;
    if (baseUrl.includes("alpha-mainnet.starknet.io")) {
      return "mainnet-alpha";
    } else if (baseUrl.includes("alpha4.starknet.io")) {
      return "goerli-alpha";
    } else if (baseUrl.match(/^https?:\/\/localhost.*/)) {
      return "localhost";
    }
  } catch {}
};

export const disconnectWallet = () => {
  return disconnect({ clearLastWallet: true });
};

export const addToken = async (address: string): Promise<void> => {
  const starknet = getStarknet();
  await starknet.enable();
  await starknet.request({
    type: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address,
      },
    },
  });
};

export const getExplorerBaseUrl = (): string | undefined => {
  if (networkId() === "mainnet-alpha") {
    return "https://voyager.online";
  } else if (networkId() === "goerli-alpha") {
    return "https://goerli.voyager.online";
  }
};

export const networkUrl = (): string | undefined => {
  try {
    return getStarknet().provider.baseUrl;
  } catch {}
};

export const addWalletChangeListener = async (
  handleEvent: (accounts: string[]) => void
) => {
  getStarknet().on("accountsChanged", handleEvent);
};

export const isPreauthorized = async (): Promise<boolean> => {
  return getStarknet().isPreauthorized();
};

export const getLatestBlockHash = async () => {
  const block = await getStarknet().provider.getBlock();

  return block.block_hash;
};
