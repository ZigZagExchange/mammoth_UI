import { getStarknet } from 'get-starknet';
import * as starknet from 'starknet';
import { ethers } from 'ethers';
import { isWalletConnected, walletAddress } from './wallet.service';
import starknetERC20_ABI from './ABI/starknetERC20_ABI.json';
import starknetPool_ABI from './ABI/starknetPool_ABI.json';
import { tokens, routerAddress, poolAddress } from './constants';

export const mintToken = async (tokenIndex: number): Promise<any> => {
    const wallet = getStarknet();
    const [address] = await wallet.enable();
    const tokenAddress = tokens[tokenIndex].address;
    const tokenDecimals = tokens[tokenIndex].decimals;
    let amount = 0;
    if (tokenIndex === 2) {
        amount = 1000;
    } else if (tokenIndex === 1) {
        amount = 0.043;
    } else {
        amount = 0.625;
    }
    const amountBN = ethers.utils.parseUnits(amount.toFixed(tokenDecimals), tokenDecimals);

    const { code, transaction_hash } = await wallet.account.execute({
        contractAddress: tokenAddress,
        entrypoint: 'mint',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
            [
                starknet.number.toBN(address.toString()), // address decimal
                Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
            ].flatMap((x) => x),
        ),
    });

    if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return amount;
};

export const mintAllTokens = async (amount: number[] = [0.625, 0.043, 1000]): Promise<any> => {
    if (tokens.length !== amount.length) throw new Error('Amount array wrong lenght');

    const wallet = getStarknet();
    const [address] = await wallet.enable();
    const calldata: starknet.Call[] = [];

    for (let i = 0; i < tokens.length; i++) {
        const tokenAddress = tokens[i].address;
        const tokenDecimals = tokens[i].decimals;
        const amountBN = ethers.utils.parseUnits(amount[i].toFixed(tokenDecimals), tokenDecimals);

        calldata.push({
            contractAddress: tokenAddress,
            entrypoint: 'mint',
            calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
                [
                    starknet.number.toBN(address.toString()), // address decimal
                    Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
                ].flatMap((x) => x),
            ),
        });
    }

    const { code, transaction_hash } = await wallet.account.execute(calldata);
    if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return transaction_hash;
};

export const getTokenAllowance = async (tokenIndex: number) => {
    if (!isWalletConnected()) return '';
    const userWalletAddress = await walletAddress();
    if (!userWalletAddress) return '--';
    const tokenAddress = tokens[tokenIndex].address;
    const tokenDecimals = tokens[tokenIndex].decimals;

    const erc20 = new starknet.Contract(starknetERC20_ABI as starknet.Abi, tokenAddress);
    const result = await erc20.allowance(userWalletAddress, poolAddress);
    const allowanceBN = starknet.uint256.uint256ToBN(result[0]);
    if (allowanceBN.lt(1 / tokenDecimals)) return '--';
    const decimalString = ethers.utils
        .formatUnits(allowanceBN.toString(), tokenDecimals)
        .toString();
    return decimalString;
};

export const getTokenBalance = async (tokenIndex: number) => {
    if (!isWalletConnected()) return '';
    const userWalletAddress = await walletAddress();
    if (!userWalletAddress) return '--';
    const tokenAddress = tokens[tokenIndex].address;
    const tokenDecimals = tokens[tokenIndex].decimals;

    const erc20 = new starknet.Contract(starknetERC20_ABI as starknet.Abi, tokenAddress);
    const result = await erc20.balanceOf(userWalletAddress);
    const balanceBN = starknet.uint256.uint256ToBN(result[0]);
    if (balanceBN.lt(1 / tokenDecimals)) return '--';
    const decimalString = ethers.utils.formatUnits(balanceBN.toString(), tokenDecimals).toString();
    return decimalString;
};

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
    max = false,
): Promise<any> => {
    const wallet = getStarknet();
    await wallet.enable();
    const tokenAddress = tokens[tokenIndex].address;
    const tokenDecimals = tokens[tokenIndex].decimals;
    const amountBN = max
        ? ethers.constants.MaxUint256
        : ethers.utils.parseUnits(amount.toFixed(tokenDecimals), tokenDecimals);

    const { code, transaction_hash } = await wallet.account.execute({
        contractAddress: tokenAddress,
        entrypoint: 'approve',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
            [
                starknet.number.toBN(poolAddress.toString()), // address decimal
                Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
            ].flatMap((x) => x),
        ),
    });

    if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return transaction_hash;
};

export const getApproveTokenFee = async (
    tokenIndex: number,
    amount: number = 10000000,
): Promise<any> => {
    const wallet = getStarknet();
    await wallet.enable();
    const tokenAddress = tokens[tokenIndex].address;
    const tokenDecimals = tokens[tokenIndex].decimals;
    const amountBN = ethers.utils.parseUnits(amount.toFixed(tokenDecimals), tokenDecimals);

    const { suggestedMaxFee: fee } = await wallet.account.estimateFee({
        contractAddress: tokenAddress,
        entrypoint: 'approve',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
            [
                starknet.number.toBN(poolAddress.toString()), // address decimal
                Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
            ].flatMap((x) => x),
        ),
    });

    return ethers.utils.parseEther(fee).toString();
};

export const approveMultibleTokens = async (approveTokens: string[]): Promise<any> => {
    const wallet = getStarknet();
    await wallet.enable();
    const calldata: starknet.Call[] = [];

    approveTokens.forEach((tokenAddress) => {
        const amountBN = ethers.constants.MaxUint256;

        calldata.push({
            contractAddress: tokenAddress,
            entrypoint: 'approve',
            calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
                [
                    starknet.number.toBN(poolAddress.toString()), // address decimal
                    Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
                ].flatMap((x) => x),
            ),
        });
    });

    const { code, transaction_hash } = await wallet.account.execute(calldata);
    if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return transaction_hash;
};

export const depositPool = async (depositTokensDetails: number[][]): Promise<any> => {
    const wallet = getStarknet();
    const [address] = await wallet.enable();
    // checks that enable succeeded
    if (wallet.isConnected === false) throw Error('starknet wallet not connected');

    const calldata: starknet.Call[] = [];
    depositTokensDetails.forEach((detail) => {
        const [tokenIndex, amount] = detail;
        const tokenAddress = tokens[tokenIndex].address;
        const tokenDecimals = tokens[tokenIndex].decimals;
        const amountBN = ethers.utils.parseUnits(amount.toFixed(tokenDecimals), tokenDecimals);

        calldata.push({
            contractAddress: routerAddress,
            entrypoint: 'mammoth_deposit_single_asset',
            calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
                [
                    Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
                    starknet.number.toBN(address),
                    starknet.number.toBN(poolAddress),
                    starknet.number.toBN(tokenAddress),
                ].flatMap((x) => x),
            ),
        });
    });

    const { code, transaction_hash } = await wallet.account.execute(calldata);
    if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return transaction_hash;
};

export const getDepositPoolFee = async (tokenIndex: number, amount: number): Promise<any> => {
    const wallet = getStarknet();
    const [address] = await wallet.enable();
    const tokenAddress = tokens[tokenIndex].address;
    const tokenDecimals = tokens[tokenIndex].decimals;
    const amountBN = ethers.utils.parseUnits(amount.toFixed(tokenDecimals), tokenDecimals);

    // checks that enable succeeded
    if (wallet.isConnected === false) throw Error('starknet wallet not connected');

    const res = await wallet.account.estimateFee({
        contractAddress: routerAddress,
        entrypoint: 'mammoth_deposit_single_asset',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
            [
                Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
                starknet.number.toBN(address.toString()),
                starknet.number.toBN(poolAddress.toString()),
                starknet.number.toBN(tokenAddress.toString()),
            ].flatMap((x) => x),
        ),
    });
    if (!res.suggestedMaxFee) return '0';

    return ethers.utils.parseEther(res.suggestedMaxFee).toString();
};

export const withdrawPool = async (amount: number, tokenIndex: number): Promise<any> => {
    const wallet = getStarknet();
    const [address] = await wallet.enable();
    const tokenAddress = tokens[tokenIndex].address;

    const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
    const decimalsLpToken = Number(await pool.decimals());
    const amountBN = ethers.utils.parseUnits(amount.toFixed(decimalsLpToken), decimalsLpToken);

    // checks that enable succeeded
    if (wallet.isConnected === false) throw Error('starknet wallet not connected');

    const { code, transaction_hash } = await wallet.account.execute({
        contractAddress: routerAddress,
        entrypoint: 'mammoth_withdraw_single_asset',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
            [
                Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
                starknet.number.toBN(address.toString()),
                starknet.number.toBN(poolAddress.toString()),
                starknet.number.toBN(tokenAddress.toString()),
            ].flatMap((x) => x),
        ),
    });
    if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return transaction_hash;
};

export const getWithdrawPoolFee = async (amount: number, tokenIndex: number): Promise<any> => {
    const wallet = getStarknet();
    const [address] = await wallet.enable();
    const tokenAddress = tokens[tokenIndex].address;
    const tokenDecimals = tokens[tokenIndex].decimals;
    const amountBN = ethers.utils.parseUnits(amount.toFixed(tokenDecimals), tokenDecimals);

    // checks that enable succeeded
    if (wallet.isConnected === false) throw Error('starknet wallet not connected');

    const { suggestedMaxFee: fee } = await wallet.account.estimateFee({
        contractAddress: routerAddress,
        entrypoint: 'mammoth_withdraw_single_asset',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
            [
                Object.values(starknet.uint256.bnToUint256(amountBN.toString())),
                starknet.number.toBN(address.toString()),
                starknet.number.toBN(poolAddress.toString()),
                starknet.number.toBN(tokenAddress.toString()),
            ].flatMap((x) => x),
        ),
    });

    return ethers.utils.parseEther(fee).toString();
};

export const swapPool = async (
    amount: number,
    tokenIndexBuy: number,
    tokenIndexSell: number,
): Promise<any> => {
    if (!amount) return;

    const wallet = getStarknet();
    const [address] = await wallet.enable();
    const buyTokenAddress = tokens[tokenIndexBuy].address;
    const sellTokenAddress = tokens[tokenIndexSell].address;
    const sellTokenDecimals = tokens[tokenIndexSell].decimals;
    const sellAmountBN = ethers.utils.parseUnits(
        amount.toFixed(sellTokenDecimals),
        sellTokenDecimals,
    );

    // checks that enable succeeded
    if (wallet.isConnected === false) throw Error('starknet wallet not connected');

    const { code, transaction_hash } = await wallet.account.execute({
        contractAddress: routerAddress,
        entrypoint: 'mammoth_swap',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
            [
                Object.values(starknet.uint256.bnToUint256(sellAmountBN.toString())),
                starknet.number.toBN(address.toString()),
                starknet.number.toBN(poolAddress.toString()),
                starknet.number.toBN(sellTokenAddress.toString()),
                starknet.number.toBN(buyTokenAddress.toString()),
            ].flatMap((x) => x),
        ),
    });
    if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return transaction_hash;
};

export const getSwapPoolFee = async (
    amount: number,
    tokenIndexBuy: number,
    tokenIndexSell: number,
): Promise<any> => {
    const wallet = getStarknet();
    const [address] = await wallet.enable();
    const buyTokenAddress = tokens[tokenIndexBuy].address;
    const sellTokenAddress = tokens[tokenIndexSell].address;
    const sellTokenDecimals = tokens[tokenIndexSell].decimals;
    const sellAmountBN = ethers.utils.parseUnits(
        amount.toFixed(sellTokenDecimals),
        sellTokenDecimals,
    );

    // checks that enable succeeded
    if (wallet.isConnected === false) throw Error('starknet wallet not connected');

    const { suggestedMaxFee: fee } = await wallet.account.estimateFee({
        contractAddress: routerAddress,
        entrypoint: 'mammoth_swap',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
            [
                Object.values(starknet.uint256.bnToUint256(sellAmountBN.toString())),
                starknet.number.toBN(address.toString()),
                starknet.number.toBN(poolAddress.toString()),
                starknet.number.toBN(buyTokenAddress.toString()),
                starknet.number.toBN(sellTokenAddress.toString()),
            ].flatMap((x) => x),
        ),
    });

    return ethers.utils.formatEther(fee.toString()).toString();
};

export const getBalance = async (tokenIndex: number, address: string): Promise<any> => {
    const tokenAddress = tokens[tokenIndex].address;
    const tokenDecimals = tokens[tokenIndex].decimals;
    const erc20 = new starknet.Contract(starknetERC20_ABI as starknet.Abi, tokenAddress);
    const result = await erc20.balanceOf(address);
    const balance: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
    if (balance.lt(1 / tokenDecimals)) return '--';
    return ethers.utils.formatUnits(balance.toString(), tokenDecimals).toString();
};

export const getPoolBalances = async (): Promise<any> => {
    const promise: Promise<any>[] = tokens.map(async (_, index) => {
        return await getBalance(index, poolAddress);
    });
    return await Promise.all(promise);
};

export const getUserBalances = async (): Promise<any> => {
    if (!isWalletConnected()) return ['0', '0', '0'];
    const userWalletAddress = await walletAddress();
    if (!userWalletAddress) return ['0', '0', '0'];

    const promise: Promise<any>[] = tokens.map(async (_, index) => {
        return await getBalance(index, userWalletAddress);
    });
    return await Promise.all(promise);
};

export const getLiquidityBalances = async (): Promise<any> => {
    if (!isWalletConnected()) return '--';
    const userWalletAddress = await walletAddress();

    const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
    const decimalsLpToken = Number(await pool.decimals());
    const result = await pool.balanceOf(userWalletAddress);
    const balance: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
    if (balance.lt(1 / decimalsLpToken)) return '0';
    return ethers.utils.formatUnits(balance.toString(), decimalsLpToken).toString();
};

// ERC 20 Swap amount

export const getSwapAmount = async (
    tokenIndexSell: number,
    tokenIndexBuy: number,
    amountBuy: number,
    out = false,
) => {
    if (!amountBuy) return 0;
    const buyTokenAddress = tokens[tokenIndexBuy].address;
    const buyTokenDecimals = tokens[tokenIndexBuy].decimals;
    const sellTokenAddress = tokens[tokenIndexSell].address;
    const sellTokenDecimals = tokens[tokenIndexSell].decimals;
    const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
    let result;
    const buyAmountBN = ethers.utils.parseUnits(
        amountBuy.toFixed(buyTokenDecimals),
        buyTokenDecimals,
    );
    if (out === false) {
        result = await pool.view_out_given_in(
            Object.values(starknet.uint256.bnToUint256(buyAmountBN.toString())),
            sellTokenAddress,
            buyTokenAddress,
        );
    } else {
        result = await pool.view_in_given_out(
            Object.values(starknet.uint256.bnToUint256(buyAmountBN.toString())),
            sellTokenAddress,
            buyTokenAddress,
        );
    }

    const amountSellBN: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
    if (amountSellBN.lt(1 / sellTokenDecimals)) return 0;
    const decimalString = ethers.utils
        .formatUnits(amountSellBN.toString(), sellTokenDecimals)
        .toString();
    return Math.round(Number(decimalString) * 10000) / 10000;
};

// ERC 20 deposit to lp amount
export const getDepositERC20Amount = async (tokenIndexDeposit: number, amountDeposit: number) => {
    if (!amountDeposit) return '--';

    const depositTokenAddress = tokens[tokenIndexDeposit].address;
    const depositTokenDecimals = tokens[tokenIndexDeposit].decimals;
    const depositAmountBN = ethers.utils.parseUnits(
        amountDeposit.toFixed(depositTokenDecimals),
        depositTokenDecimals,
    );
    const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
    const decimalsLpToken = Number(await pool.decimals());
    const result = await pool.view_pool_minted_given_single_in(
        Object.values(starknet.uint256.bnToUint256(depositAmountBN.toString())),
        depositTokenAddress,
    );
    const depositReturnBN: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
    if (depositReturnBN.lt(1 / decimalsLpToken)) return '--';
    const decimalString = ethers.utils
        .formatUnits(depositReturnBN.toString(), decimalsLpToken)
        .toString();
    return decimalString;
};

// ERC 20 deposit to lp amount
export const getProportinalDepositERC20Amount = async (amountLpToken: number) => {
    if (!amountLpToken) return '--';

    const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
    const decimalsLpToken = Number(await pool.decimals());
    const amountLpTokenBN = ethers.utils.parseUnits(
        amountLpToken.toFixed(decimalsLpToken),
        decimalsLpToken,
    );

    const data = await pool.view_proportional_deposits_given_pool_out(
        Object.values(starknet.uint256.bnToUint256(amountLpTokenBN.toString())),
    );
    const result = data[0];

    const amounts = ['', '', ''];
    for (let i = 0; i < 3; i++) {
        const tokenAddress = `0x0${result[i].erc_address.toString('hex')}`;
        const tokenAmountBN: ethers.BigNumber = starknet.uint256.uint256ToBN(result[i].amount);

        const index = tokens.findIndex((t) => t.address === tokenAddress);
        const amount = ethers.utils
            .formatUnits(tokenAmountBN.toString(), tokens[index].decimals)
            .toString();
        amounts[index] = amount;
    }
    return amounts;
};

// ERC 20 deposit to lp amount
export const proportinalDepositERC20Amount = async (amountLpToken: number) => {
    if (!amountLpToken) return;
    const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
    const decimalsLpToken = Number(await pool.decimals());
    const amountLpTokenBN = ethers.utils.parseUnits(
        amountLpToken.toFixed(decimalsLpToken),
        decimalsLpToken,
    );

    const wallet = getStarknet();
    const [address] = await wallet.enable();
    // checks that enable succeeded
    if (wallet.isConnected === false) throw Error('starknet wallet not connected');

    const { code, transaction_hash } = await wallet.account.execute({
        contractAddress: routerAddress,
        entrypoint: 'mammoth_proportional_deposit',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
            [
                Object.values(starknet.uint256.bnToUint256(amountLpTokenBN.toString())),
                starknet.number.toBN(address.toString()),
                starknet.number.toBN(poolAddress.toString()),
            ].flatMap((x) => x),
        ),
    });

    if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return transaction_hash;
};

// LP Token withdraw to erc20 amount
export const getWithdrawERC20Amount = async (
    tokenIndexWithdraw: number,
    amountLPWithdraw: number,
) => {
    if (!amountLPWithdraw) return '--';

    const withdrawTokenAddress = tokens[tokenIndexWithdraw].address;
    const withdrawTokenDecimals = tokens[tokenIndexWithdraw].decimals;
    const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
    const decimalsLpToken = Number(await pool.decimals());
    const withdrawLpAmountBN = ethers.utils.parseUnits(
        amountLPWithdraw.toFixed(decimalsLpToken),
        decimalsLpToken,
    );

    const result = await pool.view_single_out_given_pool_in(
        Object.values(starknet.uint256.bnToUint256(withdrawLpAmountBN.toString())),
        withdrawTokenAddress,
    );
    const withdrawAmountBN: ethers.BigNumber = starknet.uint256.uint256ToBN(result[0]);
    if (withdrawAmountBN.lt(1 / withdrawTokenDecimals)) return '--';
    const decimalString = ethers.utils
        .formatUnits(withdrawAmountBN.toString(), withdrawTokenDecimals)
        .toString();
    return decimalString;
};

export const getProportinalWithdrawERC20Amount = async (amountLpToken: number) => {
    if (!amountLpToken) return '--';

    const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
    const decimalsLpToken = Number(await pool.decimals());
    const amountLpTokenBN = ethers.utils.parseUnits(
        amountLpToken.toFixed(decimalsLpToken),
        decimalsLpToken,
    );

    const data = await pool.view_proportional_withdraw_given_pool_in(
        Object.values(starknet.uint256.bnToUint256(amountLpTokenBN.toString())),
    );
    const result = data[0];

    const amounts = ['', '', ''];
    for (let i = 0; i < 3; i++) {
        const tokenAddress = `0x0${result[i].erc_address.toString('hex')}`;
        const tokenAmountBN: ethers.BigNumber = starknet.uint256.uint256ToBN(result[i].amount);

        const index = tokens.findIndex((t) => t.address === tokenAddress);
        const amount = ethers.utils
            .formatUnits(tokenAmountBN.toString(), tokens[index].decimals)
            .toString();
        amounts[index] = amount;
    }
    return amounts;
};

// ERC 20 deposit to lp amount
export const proportinalWithdrawERC20Amount = async (amountLpToken: number) => {
    if (!amountLpToken) return;
    const pool = new starknet.Contract(starknetPool_ABI as starknet.Abi, poolAddress);
    const decimalsLpToken = Number(await pool.decimals());
    const amountLpTokenBN = ethers.utils.parseUnits(
        amountLpToken.toFixed(decimalsLpToken),
        decimalsLpToken,
    );

    const wallet = getStarknet();
    const [address] = await wallet.enable();
    // checks that enable succeeded
    if (wallet.isConnected === false) throw Error('starknet wallet not connected');

    const { code, transaction_hash } = await wallet.account.execute({
        contractAddress: routerAddress,
        entrypoint: 'mammoth_proportional_withdraw',
        calldata: starknet.number.bigNumberishArrayToDecimalStringArray(
            [
                Object.values(starknet.uint256.bnToUint256(amountLpTokenBN.toString())),
                starknet.number.toBN(address.toString()),
                starknet.number.toBN(poolAddress.toString()),
            ].flatMap((x) => x),
        ),
    });

    if (code !== 'TRANSACTION_RECEIVED') throw new Error(code);
    await starknet.defaultProvider.waitForTransaction(transaction_hash);
    return transaction_hash;
};
