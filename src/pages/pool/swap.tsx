import Pool from "./_pool";
import styles from "../../styles/Pool.module.css";
import React, { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import {
  approveToken,
  swapPool,
  getSwapAmount,
  tokens,
  getTokeAllowance,
} from "../../services/pool.service";
import LoadingIndicator from "../../components/Indicator";
import { waitForTransaction } from "../../services/wallet.service";
import {
  decimalToBN,
  padDecimal,
  toFloatingPoint,
} from "../../core/floating-point";

const Swap = () => {
  const [swapAmount, changeAmount] = useState("0");
  const [swapAmountDecimal, changeAmountDecimal] = useState("");
  const [LPAmount, changeLPAmount] = useState("0");
  const [tokenInIndex, changeIndexIn] = useState(0);
  const [tokenOutIndex, changeIndexOut] = useState(1);
  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState("Awaiting Swap");
  const [txComplete, changeTxComplete] = useState(false);
  const [txMessage, changeTxMsg] = useState("Swap Complete");
  const [isTokenApproved, changeTokenApproved] = useState(false);
  const [failMsg, changeFailMsg] = useState("");

  const tokenApproval = useCallback(async () => {
    const res: BigNumber = await getTokeAllowance(tokenInIndex);
    if (res.isZero()) {
      changeTokenApproved(false);
    } else {
      changeTokenApproved(true);
    }
  }, [tokenInIndex]);

  useEffect(() => {
    (async () => {
      await tokenApproval();
    })();
  });

  const predictSwapResult = async (number: string, decimal: string) => {
    const total = BigNumber.from(number).mul(10000).add(decimalToBN(decimal));
    const amount = await getSwapAmount(
      tokenInIndex,
      tokenOutIndex,
      total.toString()
    );
    changeLPAmount(toFloatingPoint(amount.toString()));
  };

  const handleInputChange = async (e: any) => {
    e.preventDefault();
    const val = e.target.value;
    const parts = val.split(".");

    const hasDecmial = swapAmountDecimal.length;

    if (val.length > 0) {
      let newNumber = "0";
      if (parts[0].length) {
        newNumber = parts[0];
      }
      changeAmount(newNumber);

      let newDecimal = "";

      if (parts[1]?.length) {
        newDecimal = parts[1].substring(0, 4);
      } else if (parts[1] === undefined && hasDecmial) {
        newDecimal = "";
      }
      changeAmountDecimal(newDecimal);

      await predictSwapResult(newNumber, newDecimal);
    } else {
      changeAmount("0");
      changeAmountDecimal("");
    }
  };

  const handleTokenInSelect = async (e: any) => {
    e.preventDefault();
    const val = e.target.value;

    const newTokenIn = parseInt(val);
    if (newTokenIn == tokenOutIndex) {
      const temp = tokenInIndex;
      changeIndexOut(temp);
      changeIndexIn(newTokenIn);
    } else {
      changeIndexIn(val);
    }

    await predictSwapResult(swapAmount, swapAmountDecimal);
  };

  const handleTokenOutSelect = async (e: any) => {
    e.preventDefault();
    const val = e.target.value;

    const newTokenOut = parseInt(val);
    if (newTokenOut === tokenInIndex) {
      const temp = tokenOutIndex;
      changeIndexIn(temp);
      changeIndexOut(newTokenOut);
    } else {
      changeIndexOut(val);
    }
    await predictSwapResult(swapAmount, swapAmountDecimal);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    changeIsLoading(true);
    changeLoadingMsg(
      `Swapping ${tokens[tokenInIndex].symbol} for ${tokens[tokenOutIndex].symbol}`
    );
    changeTxMsg(
      `Swap ${tokens[tokenInIndex].symbol} for ${tokens[tokenOutIndex].symbol} success`
    );
    let success = true;
    try {
      const tx = await swapPool(
        swapAmount + padDecimal(swapAmountDecimal),
        tokenInIndex,
        tokenOutIndex
      );

      await waitForTransaction(tx.transaction_hash);
    } catch (e) {
      success = false;
      changeFailMsg("Swap failed");
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
      changeTokenApproved(true);
    }
  };

  const handleApprove = async (e: any) => {
    e.preventDefault();
    changeIsLoading(true);
    changeLoadingMsg(`Approving ${tokens[tokenInIndex].symbol}`);
    changeTxMsg(`${tokens[tokenOutIndex].symbol} approved`);
    let success = true;
    try {
      await approveToken(tokenInIndex);
    } catch (e) {
      success = false;
      changeFailMsg("Approval failed");
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
      changeTokenApproved(true);
    }
  };

  const handleIndicatorClose = () => {
    changeTxComplete(false);
  };

  const handleFailIndicatorClose = () => {
    changeFailMsg("");
  };

  const getFPString = () => {
    if (swapAmountDecimal.length > 0) {
      return swapAmount + "." + swapAmountDecimal;
    }
    return swapAmount;
  };

  return (
    <div>
      {isLoading ? (
        <LoadingIndicator msg={loadingMsg} isLoading={true} />
      ) : null}
      {txComplete ? (
        <LoadingIndicator
          closeable={true}
          msg={txMessage}
          onClose={handleIndicatorClose}
        />
      ) : null}
      {failMsg.length ? (
        <LoadingIndicator
          closeable={true}
          msg={failMsg}
          onClose={handleFailIndicatorClose}
        />
      ) : null}
      <Pool />
      <div className={styles.row}>
        <div className={styles.transactionPart}>
          <select
            value={tokenInIndex.toString()}
            onChange={handleTokenInSelect}
          >
            <option value="0">FantieCoin</option>
            <option value="1">testUSDC</option>
            <option value="2">testETH</option>
          </select>

          <input
            onChange={handleInputChange}
            className={styles.textbox}
            name="amount"
            aria-label="Set increment amount"
            value={getFPString()}
            type="number"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.transactionPart}>
          <span className={styles.textspan}>Receive</span>
          <select
            value={tokenOutIndex.toString()}
            onChange={handleTokenOutSelect}
          >
            <option value="0">FantieCoin</option>
            <option value="1">testUSDC</option>
            <option value="2">testETH</option>
          </select>

          <div className={styles.Receivebox} aria-label="Set increment amount">
            {LPAmount.toString()}
            <span className={styles.textspangrey}>
              {tokens[tokenOutIndex].symbol}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <button disabled={isTokenApproved} onClick={handleApprove}>
          Approve
        </button>
        <button disabled={isLoading || !isTokenApproved} onClick={handleSubmit}>
          Swap
        </button>
      </div>
    </div>
  );
};

export default Swap;
