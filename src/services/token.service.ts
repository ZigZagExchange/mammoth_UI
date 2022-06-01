import { getStarknet } from "get-starknet";
import { utils } from "ethers";
import * as starknet from "starknet";

export const erc20TokenAddressByNetwork = {
  "goerli-alpha":
    "0x07394cbe418daa16e42b87ba67372d4ab4a5df0b05c6e554d158458ce245bc10",
  "mainnet-alpha":
    "0x06a09ccb1caaecf3d9683efe335a667b2169a409d19c589ba1eb771cd210af75",
};

export type PublicNetwork = keyof typeof erc20TokenAddressByNetwork;
export type Network = PublicNetwork | "localhost";

export const getErc20TokenAddress = (network: PublicNetwork) =>
  erc20TokenAddressByNetwork[network];

export const transfer = async (
  transferTo: string,
  transferAmount: string,
  network: keyof typeof erc20TokenAddressByNetwork
): Promise<any> => {
  const wallet = getStarknet();
  await wallet.enable();
  const tokenAddress = erc20TokenAddressByNetwork[network];
  const amountBn = utils.parseUnits(transferAmount, 18).toString();

  // checks that enable succeeded
  if (wallet.isConnected === false)
    throw Error("starknet wallet not connected");  

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: tokenAddress,
    entrypoint: 'transfer',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      starknet.number.toBN(transferTo.toString()),
      starknet.uint256.bnToUint256(amountBn)
    ].flatMap((x) => x)),
  });  
  if (code !== 'TRANSACTION_RECEIVED') return false;
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash;
};
