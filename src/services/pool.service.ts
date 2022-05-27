import { getStarknet } from "@argent/get-starknet";
import { compileCalldata, number, stark, uint256 } from "starknet";
import { BigNumber, BigNumberish, FixedNumber, utils } from "ethers";
import { waitForTransaction } from "./wallet.service";

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

const routerAddress =
  "0x07334817d544f8dc403da10e2b6732289e7abc5b04f0c17435e105bd5bd42195";

const poolAddress =
  "0x055dfb8a071d3ea23e63c3264edc0fecbde4162634e019c41c58a841db5689e6";

const mintSelector = stark.getSelectorFromName("mint");

const balanceOfSelecter = stark.getSelectorFromName("balanceOf");

const swapAmountSelector = stark.getSelectorFromName("view_out_given_in");

const depositAmountSelector = stark.getSelectorFromName(
  "view_pool_minted_given_single_in"
);

const withdrawAmountSelector = stark.getSelectorFromName(
  "view_single_out_given_pool_in"
);

const approveERC20Selector = stark.getSelectorFromName("approve");
const allowanceERC20Selector = stark.getSelectorFromName("allowance");
const depositSelector = stark.getSelectorFromName("mammoth_deposit");
const withdrawSelector = stark.getSelectorFromName("mammoth_withdraw");
const swapSelector = stark.getSelectorFromName("mammoth_swap");

function getUint256CalldataFromBN(bn: number.BigNumberish) {
  return { type: "struct" as const, ...uint256.bnToUint256(bn) };
}

function normalizeNumber(x: BigNumberish) {
  return BigNumber.from(x).mul("10000").toString();
}

function normalizeAndUint256(x: BigNumberish) {
  return getUint256CalldataFromBN(normalizeNumber(x));
}
export const mintToken = async (tokenIndex: number): Promise<any> => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  return await starknet.signer.invokeFunction(
    tokens[tokenIndex].address,
    mintSelector,
    compileCalldata({
      receiver: number.toBN(activeAccount).toString(), //receiver (self)
      amount: getUint256CalldataFromBN(100000), // amount
    })
  );
};

export const getTokeAllowance = async (tokenIndex: number) => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  const res = await starknet.signer?.callContract({
    contract_address: tokens[tokenIndex].address,
    entry_point_selector: allowanceERC20Selector,
    calldata: compileCalldata({
      owner: activeAccount,
      spender: poolAddress,
    }),
  });

  return uint256.uint256ToBN({
    low: res?.result[0],
    high: res?.result[1],
  });
};

export const approveToken = async (
  tokenIndex: number,
  amount: string = "10000000"
): Promise<any> => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  let uintAmount = getUint256CalldataFromBN(amount);
  const tx = await starknet.signer.invokeFunction(
    tokens[tokenIndex].address,
    approveERC20Selector,
    compileCalldata({
      spender: poolAddress,
      amount: uintAmount,
    })
  );
  await waitForTransaction(tx.transaction_hash);
};

export const depositPool = async (
  amount: string,
  tokenIndex: number
): Promise<any> => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  return await starknet.signer.invokeFunction(
    routerAddress,
    depositSelector,
    compileCalldata({
      amount: getUint256CalldataFromBN(amount),
      user_address: activeAccount,
      pool_address: poolAddress,
      erc20_address: tokens[tokenIndex].address,
    })
  );
};

export const withdrawPool = async (
  amount: string,
  tokenIndex: number
): Promise<any> => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  return await starknet.signer.invokeFunction(
    routerAddress,
    withdrawSelector,
    compileCalldata({
      amount: getUint256CalldataFromBN(amount),
      user_address: activeAccount,
      pool_address: poolAddress,
      erc20_address: tokens[tokenIndex].address,
    })
  );
};

export const swapPool = async (
  amount: string,
  tokenIndex: number,
  tokenIndex2: number
): Promise<any> => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  return await starknet.signer.invokeFunction(
    routerAddress,
    swapSelector,
    compileCalldata({
      amount: getUint256CalldataFromBN(amount),
      user_address: activeAccount,
      pool_address: poolAddress,
      erc20_address_in: tokens[tokenIndex].address,
      erc20_address_out: tokens[tokenIndex2].address,
    })
  );
};

export const getPoolBalances = async (): Promise<any> => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  const tokenOneBalance = starknet.provider.callContract({
    contract_address: tokens[0].address,
    entry_point_selector: balanceOfSelecter,
    calldata: compileCalldata({
      account: number.toBN(poolAddress).toString(), //receiver (self)
    }),
  });

  const tokenTwoBalance = starknet.provider.callContract({
    contract_address: tokens[1].address,
    entry_point_selector: balanceOfSelecter,
    calldata: compileCalldata({
      account: number.toBN(poolAddress).toString(), //receiver (self)
    }),
  });

  const tokenThreeBalance = starknet.provider.callContract({
    contract_address: tokens[2].address,
    entry_point_selector: balanceOfSelecter,
    calldata: compileCalldata({
      account: number.toBN(poolAddress).toString(), //receiver (self)
    }),
  });

  const balances = await Promise.all([
    tokenOneBalance,
    tokenTwoBalance,
    tokenThreeBalance,
  ]);

  return balances.map((balance) => {
    return uint256.uint256ToBN({
      low: balance.result[0],
      high: balance.result[1],
    });
  });
};

export const getLiquidityBalances = async (): Promise<any> => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  const liquidityBalance = await starknet.provider.callContract({
    contract_address: poolAddress,
    entry_point_selector: balanceOfSelecter,
    calldata: compileCalldata({
      account: number.toBN(activeAccount).toString(), //receiver (self)
    }),
  });

  return uint256.uint256ToBN({
    low: liquidityBalance.result[0],
    high: liquidityBalance.result[1],
  });
};

// ERC 20 Swap amount

export const getSwapAmount = async (
  tokenInIndex: number,
  tokenOutIndex: number,
  amountIn: string
) => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  const res = await starknet.provider.callContract({
    contract_address: poolAddress,
    entry_point_selector: swapAmountSelector,
    calldata: compileCalldata({
      amount_in: getUint256CalldataFromBN(amountIn),
      erc20_address_in: tokens[tokenInIndex].address,
      erc20_address_out: tokens[tokenOutIndex].address,
    }),
  });

  return uint256.uint256ToBN({
    low: res.result[0],
    high: res.result[1],
  });
};

// ERC 20 deposit to lp amount
export const getDepositERC20Amount = async (
  tokenInIndex: number,
  amountIn: string
) => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  const res = await starknet.provider.callContract({
    contract_address: poolAddress,
    entry_point_selector: depositAmountSelector,
    calldata: compileCalldata({
      amount_to_deposit: getUint256CalldataFromBN(amountIn),
      erc20_address: tokens[tokenInIndex].address,
    }),
  });
  return uint256.uint256ToBN({
    low: res.result[0],
    high: res.result[1],
  });
};

// LP Token withdraw to erc20 amount
export const getWithdrawERC20Amount = async (
  tokenInIndex: number,
  amountIn: string
) => {
  const starknet = getStarknet();

  const [activeAccount] = await starknet.enable();

  // checks that enable succeeded
  if (starknet.isConnected === false)
    throw Error("starknet wallet not connected");

  const res = await starknet.provider.callContract({
    contract_address: poolAddress,
    entry_point_selector: withdrawAmountSelector,
    calldata: compileCalldata({
      pool_amount_in: getUint256CalldataFromBN(amountIn),
      erc20_address: tokens[tokenInIndex].address,
    }),
  });

  return uint256.uint256ToBN({
    low: res.result[0],
    high: res.result[1],
  });
};
