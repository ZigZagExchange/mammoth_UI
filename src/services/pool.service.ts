import { getStarknet } from "get-starknet";
import * as starknet from "starknet";
import { ethers } from "ethers";
import { isWalletConnected, walletAddress } from "./wallet.service";
import starknetERC20_ABI from "./ABI/starknetERC20_ABI.json";
import starknetPool_ABI from "./ABI/starknetPool_ABI.json";
import {
  tokens,
  routerAddress,
  poolAddress
} from "./constants";

export const mintToken = async (
  tokenIndex: number,
  amount: number = 25
): Promise<any> => {
    const wallet = getStarknet();
    const [address] = await wallet.enable();
    const tokenAddress = tokens[tokenIndex].address;
    const tokenDecimals = tokens[tokenIndex].decimals;
    const amountBN = ethers.utils.parseUnits(
      amount.toFixed(tokenDecimals),
      tokenDecimals
    );

    const { code, transaction_hash } = await wallet.account.execute({
      contractAddress: tokenAddress,
      entrypoint: 'mint',
      calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
        starknet.number.toBN(address.toString()), // address decimal
        Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
      ].flatMap((x) => x)),
    });

    if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return transaction_hash
};

export const mintAllTokens = async (
  amount: number[] = [50, 1750, 1]
): Promise<any> => {
  if (tokens.length !== amount.length) throw new Error('Amount array wrong lenght')
  
  const wallet = getStarknet();
  await wallet.enable();
  const calldata: starknet.Call[] = [];

  for(let i = 0; i < tokens.length; i++) {
    const tokenAddress = tokens[i].address;
    const tokenDecimals = tokens[i].decimals;
    const amountBN = ethers.utils.parseUnits(
      amount[i].toFixed(tokenDecimals),
      tokenDecimals
    );

    calldata.push({
      contractAddress: tokenAddress,
      entrypoint: 'mint',
      calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
        starknet.number.toBN(poolAddress.toString()), // address decimal
        Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
      ].flatMap((x) => x)),
    });
  }

  const { code, transaction_hash } = await wallet.account.execute(calldata);
  if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash
};

export const getTokenAllowance = async (tokenIndex: number) => {
  if(!isWalletConnected()) return "";
  const userWalletAddress = await walletAddress();
  if (!userWalletAddress) return '--';
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;

  const erc20 = new starknet.Contract(starknetERC20_ABI as starknet.Abi, tokenAddress);
  const result = await erc20.allowance(
    userWalletAddress,
    routerAddress
  );
  const allowanceBN = starknet.uint256.uint256ToBN(result[0]);
  if (allowanceBN.lt(1 / tokenDecimals)) return '--';
  const decimalString = ethers.utils.formatUnits(
    allowanceBN.toString(),
    tokenDecimals
  ).toString();
  return decimalString;
};

export const getTokenBalance = async (tokenIndex: number) => {
  if(!isWalletConnected()) return "";
  const userWalletAddress = await walletAddress();
  if (!userWalletAddress) return '--';
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;

  const erc20 = new starknet.Contract(starknetERC20_ABI as starknet.Abi, tokenAddress);
  const result = await erc20.balanceOf(
    userWalletAddress
  );
  const balanceBN = starknet.uint256.uint256ToBN(result[0]);
  if (balanceBN.lt(1 / tokenDecimals)) return '--';
  const decimalString = ethers.utils.formatUnits(
    balanceBN.toString(),
    tokenDecimals
  ).toString();
  return decimalString;
}

export const getAllowances = async () => {
  const allowances = [];
  for (let i = 0; i < tokens.length; i++) {
    allowances[i] = await getTokenAllowance(i);
  }
  return allowances;
};

export const approveToken = async (
  tokenIndex: number,
  amount: number = 100,
  max = false
): Promise<any> => {
  const wallet = getStarknet();
  await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;
  const amountBN = max ? ethers.constants.MaxUint256 : ethers.utils.parseUnits(
    amount.toFixed(tokenDecimals),
    tokenDecimals
  );

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: tokenAddress,
    entrypoint: 'approve',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      starknet.number.toBN(routerAddress.toString()), // address decimal
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
      starknet.number.toBN(routerAddress.toString()), // address decimal
      Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
    ].flatMap((x) => x)),
  });

  return ethers.utils.parseEther(fee).toString();
};

export const approveAllTokens = async (): Promise<any> => {
  const wallet = getStarknet();
  await wallet.enable();
  const calldata: starknet.Call[] = [];

  tokens.forEach(token => {
    const tokenAddress = token.address;
    const amountBN = ethers.constants.MaxUint256;

    calldata.push({
      contractAddress: tokenAddress,
      entrypoint: 'approve',
      calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
        starknet.number.toBN(routerAddress.toString()), // address decimal
        Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
      ].flatMap((x) => x)),
    });
  })

  const { code, transaction_hash } = await wallet.account.execute(calldata);
  if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash
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
  tokenIndex: number,
  amount: number
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

  const res = await wallet.account.estimateFee({
    contractAddress: routerAddress,
    entrypoint: 'mammoth_deposit',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
      starknet.number.toBN(address.toString()),
      starknet.number.toBN(poolAddress.toString()),
      starknet.number.toBN(tokenAddress.toString())
    ].flatMap((x) => x)),
  });
  if(!res.amount) return '0';

  return ethers.utils.parseEther(res.amount).toString();
};

export const withdrawPool = async (
  amount: number,
  tokenIndex: number
): Promise<any> => {
  const wallet = getStarknet();
  const [address] = await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;

  const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
  const decimalsLpToken = Number(await pool.decimals());
  const amountBN = ethers.utils.parseUnits(
    amount.toFixed(decimalsLpToken),
    decimalsLpToken
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
  if (!amount) return;
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
  if (balance.lt(1 / tokenDecimals)) return '--';
  return ethers.utils.formatUnits(
    balance.toString(),
    tokenDecimals
  ).toString();
}

export const getPoolBalances = async (): Promise<any> => {
  const promise: Promise<any>[] = tokens.map(async (_, index) => {
    return await getBalance(index, poolAddress);
  });
  return await Promise.all(promise);
};

export const getUserBalances = async (): Promise<any> => {
  if(!isWalletConnected()) return ['0', '0', '0'];
  const userWalletAddress = await walletAddress();
  if (!userWalletAddress) return ['0', '0', '0'];

  const promise: Promise<any>[] = tokens.map(async (_, index) => {
    return await getBalance(index, userWalletAddress);
  });
  return await Promise.all(promise);
};

export const getLiquidityBalances = async (): Promise<any> => {
  if(!isWalletConnected()) return '--';
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
  console.log(`getSwapAmount: amountBuy ==> ${amountBuy}`)
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
  console.log(amountSellBN.toString());
  if (amountSellBN.lt(1 / sellTokenDecimals)) return '0';
  const decimalString = ethers.utils.formatUnits(
    amountSellBN.toString(),
    sellTokenDecimals
  ).toString();
  console.log(`getSwapAmount: return ==> ${decimalString}`)
  return decimalString;
};

// ERC 20 deposit to lp amount
export const getDepositERC20Amount = async (
  tokenIndexDeposit: number,
  amountDeposit: number
) => {
  console.log(`getDepositERC20Amount: amountDeposit ==> ${amountDeposit}`)
  if (!amountDeposit) return '--';

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
  if (depositReturnBN.lt(1 / decimalsLpToken)) return '--';
  const decimalString = ethers.utils.formatUnits(
    depositReturnBN.toString(),
    decimalsLpToken
  ).toString();
  console.log(`getDepositERC20Amount: result ==> ${decimalString}`)
  return decimalString;
};

// LP Token withdraw to erc20 amount
export const getWithdrawERC20Amount = async (
  tokenIndexWithdraw: number,
  amountLPWithdraw: number
) => {
  console.log(`getWithdrawERC20Amount: result ==> ${amountLPWithdraw}`)
  if (!amountLPWithdraw) return '--';

  const withdrawTokenAddress = tokens[tokenIndexWithdraw].address;
  const withdrawTokenDecimals = tokens[tokenIndexWithdraw].decimals;
  const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
  const decimalsLpToken = Number(await pool.decimals());
  const withdrawLpAmountBN = ethers.utils.parseUnits(
    amountLPWithdraw.toFixed(decimalsLpToken),
    decimalsLpToken
  );

  const result = await pool.view_single_out_given_pool_in(
    Object.values(starknet.uint256.bnToUint256(withdrawLpAmountBN.toString())),
    withdrawTokenAddress
  );
  const withdrawAmountBN: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
  if (withdrawAmountBN.lt(1 / withdrawTokenDecimals)) return '--';
  const decimalString = ethers.utils.formatUnits(
    withdrawAmountBN.toString(),
    withdrawTokenDecimals
  ).toString();
  console.log(`getWithdrawERC20Amount: result ==> ${decimalString}`)
  return decimalString;
};

// this is not used and should probably removed 
/*
export const transfer = async (
  tokenIndex: number,
  transferTo: string,
  transferAmount: number,
): Promise<any> => {
  const wallet = getStarknet();
  await wallet.enable();
  const tokenAddress = tokens[tokenIndex].address;
  const tokenDecimals = tokens[tokenIndex].decimals;
  const amountBN = ethers.utils.parseUnits(
    transferAmount.toFixed(tokenDecimals),
    tokenDecimals
  );

  // checks that enable succeeded
  if (wallet.isConnected === false)
    throw Error("starknet wallet not connected");  

  const { code, transaction_hash } = await wallet.account.execute({
    contractAddress: tokenAddress,
    entrypoint: 'transfer',
    calldata: starknet.number.bigNumberishArrayToDecimalStringArray([
      starknet.number.toBN(transferTo.toString()),
      starknet.uint256.bnToUint256(amountBN)
    ].flatMap((x) => x)),
  });  
  if (code !== 'TRANSACTION_RECEIVED') return false;
  await starknet.defaultProvider.waitForTransaction(transaction_hash);
  return transaction_hash;
};
*/