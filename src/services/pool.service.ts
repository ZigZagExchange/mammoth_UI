import { getStarknet } from "get-starknet";
import * as starknet from "starknet";
import { walletAddress } from "./wallet.service";
import starknetERC20_ABI from "./ABI/starknetERC20_ABI.json";
import starknetPool_ABI from "./ABI/starknetPool_ABI.json";

const tokenOne = {
  address: "0x032b911608a90366220ebbabd99f7a57b4b315804605e241920c37bcd74d76fc",
  name: "FantieCoin",
  symbol: "FC",
};

const tokenTwo = {
  address: "0x067e22e3d37bc747b6444efe1e39b9a06f6f4610a77a7a87866b328467699afc",

  name: "testUSDC",
  symbol: "TUSDC",
};

const tokenThree = {
  address: "0x012fd485450708217ffca7b9dd17e0323a3ea0299ccef5d8411577f120293977",
  name: "testETH",
  symbol: "TEETH",
};

export const tokens = [tokenOne, tokenTwo, tokenThree];

const routerAddress = "0x07334817d544f8dc403da10e2b6732289e7abc5b04f0c17435e105bd5bd42195";

const poolAddress = "0x055dfb8a071d3ea23e63c3264edc0fecbde4162634e019c41c58a841db5689e6";

export const mintToken = async (tokenIndex: number): Promise<any> => {
  const userWalletAddress = await walletAddress();
  const tokenAddress = tokens[tokenIndex].address;
  const erc20 = new starknet.Contract(starknetERC20_ABI as starknet.Abi, tokenAddress);
  const { transaction_hash: mintTxHash } = await erc20.mint(
    userWalletAddress,
    starknet.uint256.bnToUint256('100000')
  );
  await starknet.defaultProvider.waitForTransaction(mintTxHash);
};

export const getTokeAllowance = async (tokenIndex: number) => {
  const userWalletAddress = await walletAddress();
  const tokenAddress = tokens[tokenIndex].address;

  const erc20 = new starknet.Contract(starknetERC20_ABI as starknet.Abi, tokenAddress);
  const result = await erc20.allowance(
    userWalletAddress,
    poolAddress
  );
  const allowance = starknet.uint256.uint256ToBN(result[0]);
  return allowance;
};

export const approveToken = async (
  tokenIndex: number,
  amount: string = "10000000"
): Promise<any> => {
  const wallet = getStarknet();
  await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;
  console.log('start')

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: tokenAddress,
    entrypoint: 'approve',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      starknet.number.toBN(poolAddress.toString()), // address decimal
      Object.values(starknet.uint256.bnToUint256(amount.toString())),
    ].flatMap((x) => x)),
  });

  if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash
};

export const getApproveTokenFee = async (
  tokenIndex: number,
  amount: string = "10000000"
): Promise<any> => {
  const wallet = getStarknet();
  await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;

  const { amount: fee } = await wallet.account.estimateFee({
    contractAddress: tokenAddress,
    entrypoint: 'approve',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      starknet.number.toBN(poolAddress.toString()), // address decimal
      Object.values(starknet.uint256.bnToUint256(amount.toString())),
    ].flatMap((x) => x)),
  });

  return fee.toString();
};

export const depositPool = async (
  amount: string,
  tokenIndex: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const token = tokens[tokenIndex].address;

  // checks that enable succeeded
  if (wallet.isConnected === false)
    throw Error("starknet wallet not connected");

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_deposit',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amount.toString())),
      starknet.number.toBN(address),
      starknet.number.toBN(poolAddress),
      starknet.number.toBN(token)
    ].flatMap((x) => x)),
  });
  if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash;
};

export const getDepositPoolFee = async (
  amount: string,
  tokenIndex: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const token = tokens[tokenIndex].address;

  // checks that enable succeeded
  if (wallet.isConnected === false)
    throw Error("starknet wallet not connected");

  const { amount: fee } = await wallet.account.estimateFee({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_deposit',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amount.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(token.toString())
    ].flatMap((x) => x)),
  });

  return fee.toString();
};

export const withdrawPool = async (
  amount: string,
  tokenIndex: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const token = tokens[tokenIndex].address;

  // checks that enable succeeded
  if (wallet.isConnected === false)
    throw Error("starknet wallet not connected");

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_withdraw',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amount.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(token.toString())
    ].flatMap((x) => x)),
  });
  if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash;
};

export const getWithdrawPoolFee = async (
  amount: string,
  tokenIndex: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const token = tokens[tokenIndex].address;

  // checks that enable succeeded
  if (wallet.isConnected === false)
    throw Error("starknet wallet not connected");

  const { amount: fee } = await wallet.account.estimateFee({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_withdraw',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amount.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(token.toString())
    ].flatMap((x) => x)),
  });

  return fee.toString();
};

export const swapPool = async (
  amount: string,
  tokenIndexBuy: number,
  tokenIndexSell: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const buyToken = tokens[tokenIndexBuy].address;
  const sellToken = tokens[tokenIndexSell].address;

  // checks that enable succeeded
  if (wallet.isConnected === false)
    throw Error("starknet wallet not connected");

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_swap',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amount.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(buyToken.toString()),
      starknet.number.toBN(sellToken.toString())
    ].flatMap((x) => x)),
  });
  if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash;
};

export const getSwapPoolFee = async (
  amount: string,
  tokenIndexBuy: number,
  tokenIndexSell: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const buyToken = tokens[tokenIndexBuy].address;
  const sellToken = tokens[tokenIndexSell].address;

  // checks that enable succeeded
  if (wallet.isConnected === false)
    throw Error("starknet wallet not connected");

  const { amount: fee } = await wallet.account.estimateFee({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_swap',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amount.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(buyToken.toString()),
      starknet.number.toBN(sellToken.toString())
    ].flatMap((x) => x)),
  });

  return fee.toString();
};

export const getBalance = async (
  tokenIndex: number,
  address: string,
): Promise<any> => {
  const tokenAddress = tokens[tokenIndex].address;
  const erc20 = new starknet.Contract(starknetERC20_ABI as starknet.Abi, tokenAddress);
  const result = await erc20.balanceOf(address);
  const balance = starknet.uint256.uint256ToBN(result[0]);
  return balance.toString();
}

export const getPoolBalances = async (): Promise<any> => {
  const balances = await Promise.all([
    getBalance(0, poolAddress),
    getBalance(1, poolAddress),
    getBalance(2, poolAddress)
  ]);

  return balances;
};

export const getLiquidityBalances = async (): Promise<any> => {
  const userWalletAddress = await walletAddress();

  const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
  const result = await pool.balanceOf(userWalletAddress);
  const balance = starknet.uint256.uint256ToBN(result[0]);
  return balance.toString();
};

// ERC 20 Swap amount

export const getSwapAmount = async (
  tokenInIndex: number,
  tokenOutIndex: number,
  amountIn: string
) => {
  const tokenInAddress = tokens[tokenInIndex].address;
  const tokenOutAddress = tokens[tokenOutIndex].address;
  const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
  const result = await pool.view_out_given_in(
    Object.values(starknet.uint256.bnToUint256(amountIn)),
    tokenInAddress,
    tokenOutAddress
  );
  const swapAmount = starknet.uint256.uint256ToBN(result[0]);
  return swapAmount.toString();
};

// ERC 20 deposit to lp amount
export const getDepositERC20Amount = async (
  tokenInIndex: number,
  amountIn: string
) => {
  const tokenInAddress = tokens[tokenInIndex].address;
  const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
  const result = await pool.view_pool_minted_given_single_in(
    Object.values(starknet.uint256.bnToUint256(amountIn)),
    tokenInAddress
  );
  const swapAmount = starknet.uint256.uint256ToBN(result[0]);
  return swapAmount.toString();
};

// LP Token withdraw to erc20 amount
export const getWithdrawERC20Amount = async (
  tokenInIndex: number,
  amountIn: string
) => {
  const tokenInAddress = tokens[tokenInIndex].address;
  const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
  const result = await pool.view_single_out_given_pool_in(
    Object.values(starknet.uint256.bnToUint256(amountIn)),
    tokenInAddress
  );
  const swapAmount = starknet.uint256.uint256ToBN(result[0]);
  return swapAmount.toString();
};
