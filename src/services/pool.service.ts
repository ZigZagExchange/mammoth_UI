import { getStarknet } from "get-starknet";
import * as starknet from "starknet";
import { ethers } from "ethers";
import { walletAddress } from "./wallet.service";
import starknetERC20_ABI from "./ABI/starknetERC20_ABI.json";
import starknetPool_ABI from "./ABI/starknetPool_ABI.json";

const tokenOne = {
  address: "0x032b911608a90366220ebbabd99f7a57b4b315804605e241920c37bcd74d76fc",
  name: "FantieCoin",
  symbol: "FC",
  decimals: 6,
};

const tokenTwo = {
  address: "0x067e22e3d37bc747b6444efe1e39b9a06f6f4610a77a7a87866b328467699afc",
  name: "testUSDC",
  symbol: "TUSDC",
  decimals: 4,
};

const tokenThree = {
  address: "0x012fd485450708217ffca7b9dd17e0323a3ea0299ccef5d8411577f120293977",
  name: "testETH",
  symbol: "TEETH",
  decimals: 8,
};

export const tokens = [tokenOne, tokenTwo, tokenThree];

const routerAddress = "0x07334817d544f8dc403da10e2b6732289e7abc5b04f0c17435e105bd5bd42195";

const poolAddress = "0x055dfb8a071d3ea23e63c3264edc0fecbde4162634e019c41c58a841db5689e6";

export const mintToken = async (
  tokenIndex: number,
  amount: number = 5000
): Promise<any> => {
  try {
    const total = amount + Math.random() * 5000;

    const userWalletAddress = await walletAddress();
    const tokenAddress = tokens[tokenIndex].address;
    const erc20 = new starknet.Contract(starknetERC20_ABI as starknet.Abi, tokenAddress);
    const { transaction_hash: mintTxHash } = await erc20.mint(
      userWalletAddress,
      starknet.uint256.bnToUint256(total)
    );
    console.log(`mintToken: wait for ${mintTxHash}`)
    await starknet.defaultProvider.waitForTransaction(mintTxHash);
    console.log(`mintToken: done ${mintTxHash}`)
  } catch (e) {
    console.log(e)
  }
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
  amount: number = 100
): Promise<any> => {
  const wallet = getStarknet();
  await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;
  const amountBN = ethers.utils.parseUnits(
    amount.toFixed(tokenDecimals),
    tokenDecimals
  );

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: tokenAddress,
    entrypoint: 'approve',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      starknet.number.toBN(poolAddress.toString()), // address decimal
      Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
    ].flatMap((x) => x)),
  });

  if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash
};

export const getApproveTokenFee = async (
  tokenIndex: number,
  amount: number = 10000000
): Promise<any> => {
  const wallet = getStarknet();
  await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;
  const amountBN = ethers.utils.parseUnits(
    amount.toFixed(tokenDecimals),
    tokenDecimals
  );

  const { amount: fee } = await wallet.account.estimateFee({
    contractAddress: tokenAddress,
    entrypoint: 'approve',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      starknet.number.toBN(poolAddress.toString()), // address decimal
      Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
    ].flatMap((x) => x)),
  });

  return ethers.utils.parseEther(fee).toString();
};

export const depositPool = async (
  amount: number,
  tokenIndex: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;
  const amountBN = ethers.utils.parseUnits(
    amount.toFixed(tokenDecimals),
    tokenDecimals
  );

  // checks that enable succeeded
  if (wallet.isConnected === false) throw Error("starknet wallet not connected");

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_deposit',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
      starknet.number.toBN(address),
      starknet.number.toBN(poolAddress),
      starknet.number.toBN(tokenAddress)
    ].flatMap((x) => x)),
  });
  if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash;
};

export const getDepositPoolFee = async (
  amount: number,
  tokenIndex: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;
  const amountBN = ethers.utils.parseUnits(
    amount.toFixed(tokenDecimals),
    tokenDecimals
  );

  // checks that enable succeeded
  if (wallet.isConnected === false) throw Error("starknet wallet not connected");

  const { amount: fee } = await wallet.account.estimateFee({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_deposit',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(tokenAddress.toString())
    ].flatMap((x) => x)),
  });

  return ethers.utils.parseEther(fee).toString();
};

export const withdrawPool = async (
  amount: number,
  tokenIndex: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;
  const amountBN = ethers.utils.parseUnits(
    amount.toFixed(tokenDecimals),
    tokenDecimals
  );

  // checks that enable succeeded
  if (wallet.isConnected === false) throw Error("starknet wallet not connected");

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_withdraw',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(tokenAddress.toString())
    ].flatMap((x) => x)),
  });
  if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash;
};

export const getWithdrawPoolFee = async (
  amount: number,
  tokenIndex: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;
  const amountBN = ethers.utils.parseUnits(
    amount.toFixed(tokenDecimals),
    tokenDecimals
  );

  // checks that enable succeeded
  if (wallet.isConnected === false) throw Error("starknet wallet not connected");

  const { amount: fee } = await wallet.account.estimateFee({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_withdraw',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(tokenAddress.toString())
    ].flatMap((x) => x)),
  });

  return ethers.utils.parseEther(fee).toString();
};

export const swapPool = async (
  amount: number,
  tokenIndexBuy: number,
  tokenIndexSell: number
): Promise<any> => {
  console.log(`swapPool: amount: ${amount}`)
  amount = 10;
  console.log(`swapPool: amount: ${amount}`)

  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const buyTokenAddress = tokens[tokenIndexBuy].address;
  const sellTokenAddress = tokens[tokenIndexSell].address;
  const sellTokenDecimals = tokens[tokenIndexSell].decimals;
  const sellAmountBN = ethers.utils.parseUnits(
    amount.toFixed(sellTokenDecimals),
    sellTokenDecimals
  );

  // checks that enable succeeded
  if (wallet.isConnected === false) throw Error("starknet wallet not connected");

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_swap',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(sellAmountBN.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(buyTokenAddress.toString()),
      starknet.number.toBN(sellTokenAddress.toString())
    ].flatMap((x) => x)),
  });
  if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash;
};

export const getSwapPoolFee = async (
  amount: number,
  tokenIndexBuy: number,
  tokenIndexSell: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const buyTokenAddress = tokens[tokenIndexBuy].address;
  const sellTokenAddress = tokens[tokenIndexSell].address;
  const sellTokenDecimals = tokens[tokenIndexSell].decimals;
  const sellAmountBN = ethers.utils.parseUnits(
    amount.toFixed(sellTokenDecimals),
    sellTokenDecimals
  );

  // checks that enable succeeded
  if (wallet.isConnected === false) throw Error("starknet wallet not connected");

  const { amount: fee } = await wallet.account.estimateFee({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_swap',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(sellAmountBN.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(buyTokenAddress.toString()),
      starknet.number.toBN(sellTokenAddress.toString())
    ].flatMap((x) => x)),
  });

  return ethers.utils.formatEther(fee.toString()).toString();
};

export const getBalance = async (
  tokenIndex: number,
  address: string,
): Promise<any> => {
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;
  const erc20 = new starknet.Contract(starknetERC20_ABI as starknet.Abi, tokenAddress);
  const result = await erc20.balanceOf(address);
  const balance: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
  if (balance.lt(1 / tokenDecimals)) return '0';
  return ethers.utils.formatUnits(
    balance.toString(),
    tokenDecimals
  ).toString();
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
  const decimalsLpToken = Number(await pool.decimals());
  const result = await pool.balanceOf(userWalletAddress);
  const balance: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
  if (balance.lt(1 / decimalsLpToken)) return '0';
  return ethers.utils.formatUnits(
    balance.toString(),
    decimalsLpToken
  ).toString();
};

// ERC 20 Swap amount

export const getSwapAmount = async (
  tokenIndexBuy: number,
  tokenIndexSell: number,
  amountBuy: number
) => {
  if (!amountBuy) return '0';
  const buyTokenAddress = tokens[tokenIndexBuy].address;
  const buyTokenDecimals = tokens[tokenIndexBuy].decimals;
  const sellTokenAddress = tokens[tokenIndexSell].address;
  const sellTokenDecimals = tokens[tokenIndexSell].decimals;
  const buyAmountBN = ethers.utils.parseUnits(
    amountBuy.toFixed(buyTokenDecimals),
    buyTokenDecimals
  );

  const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
  const result = await pool.view_out_given_in(
    Object.values(starknet.uint256.bnToUint256(buyAmountBN.toString())),
    buyTokenAddress,
    sellTokenAddress
  );
  const amountSellBN: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
  if (amountSellBN.lt(1 / sellTokenDecimals)) return '0';
  return ethers.utils.formatUnits(
    amountSellBN.toString(),
    sellTokenDecimals
  ).toString();
};

// ERC 20 deposit to lp amount
export const getDepositERC20Amount = async (
  tokenIndexDeposit: number,
  amountDeposit: number
) => {
  if (amountDeposit) return '0';

  const depositTokenAddress = tokens[tokenIndexDeposit].address;
  const depositTokenDecimals = tokens[tokenIndexDeposit].decimals;
  const depositAmountBN = ethers.utils.parseUnits(
    amountDeposit.toFixed(depositTokenDecimals),
    depositTokenDecimals
  );
  const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
  const decimalsLpToken = Number(await pool.decimals());
  const result = await pool.view_pool_minted_given_single_in(
    Object.values(starknet.uint256.bnToUint256(depositAmountBN.toString())),
    depositTokenAddress
  );
  const depositReturnBN: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
  if (depositReturnBN.lt(1 / decimalsLpToken)) return '0';
  return ethers.utils.formatUnits(
    depositReturnBN.toString(),
    decimalsLpToken
  ).toString();
};

// LP Token withdraw to erc20 amount
export const getWithdrawERC20Amount = async (
  tokenIndexWithdraw: number,
  amountLPWithdraw: number
) => {
  if (!amountLPWithdraw) return '0';

  const withdrawTokenAddress = tokens[tokenIndexWithdraw].address;
  const withdrawTokenDecimals = tokens[tokenIndexWithdraw].decimals;
  const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
  const decimalsLpToken = Number(await pool.decimals());
  const temp = await pool.decimals()
  const withdrawLpAmountBN = ethers.utils.parseUnits(
    amountLPWithdraw.toFixed(decimalsLpToken),
    decimalsLpToken
  );

  const result = await pool.view_single_out_given_pool_in(
    Object.values(starknet.uint256.bnToUint256(withdrawLpAmountBN.toString())),
    withdrawTokenAddress
  );
  const withdrawAmountBN: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
  if (withdrawAmountBN.lt(1 / withdrawTokenDecimals)) return '0';
  return ethers.utils.formatUnits(
    withdrawAmountBN.toString(),
    withdrawTokenDecimals
  ).toString();
};
