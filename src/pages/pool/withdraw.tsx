import Pool from "./_pool";
import styles from "../../styles/Pool.module.css";
import React, { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import {
  withdrawPool,
  getWithdrawERC20Amount,
  tokens,
} from "../../services/pool.service";
import LoadingIndicator from "../../components/Indicator";

const Withdraw = () => {
  const [withdrawAmount, changeAmount] = useState(0);
  const [LPAmount, changeLPAmount] = useState('0');
  const [tokenIndex, changeIndex] = useState(0);
  const [isLoading, changeIsLoading] = useState(false);
  const [txComplete, changeTxComplete] = useState(false);
  const [failMsg, changeFailMsg] = useState("");

  const predictWithdrawResult = async (amount: number) => {
    const result = await getWithdrawERC20Amount(tokenIndex, amount);
    changeLPAmount(result);
  };

  const handleInputChange = async (e: any) => {
    e.preventDefault();
    let val = e.target.value;

    if (typeof val === "string") {
      val = parseFloat(val.replace(",", "."));
    }
    val = Number.isNaN(val) ? 0 : val;
    changeAmount(val);
    await predictWithdrawResult(val);
  };

  const handleTokenSelect = async (e: any) => {
    e.preventDefault();
    const val = e.target.value;
    //await tokenApproval();
    changeIndex(parseInt(val));
    await predictWithdrawResult(withdrawAmount);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    changeIsLoading(true);
    let success = true;
    try {
      await withdrawPool(
        withdrawAmount,
        tokenIndex
      );
    } catch (e) {      
      console.log(e)
      success = false;
      changeFailMsg("Withdraw failed");
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const handleIndicatorClose = () => {
    changeTxComplete(false);
  };

  const handleFailIndicatorClose = () => {
    changeFailMsg("");
  };

  return (
    <div>
      {isLoading ? (
        <LoadingIndicator msg={"Awaiting Withdraw"} isLoading={true} />
      ) : null}
      {txComplete ? (
        <LoadingIndicator
          closeable={true}
          msg={"Withdraw Complete"}
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
          <div>
            <span className={styles.textspangrey}>LP Tokens</span>
            <input
              onChange={handleInputChange}
              className={styles.textbox}
              name="amount"
              aria-label="Set increment amount"
              value={withdrawAmount}
              type="number"
            />
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.transactionPart}>
          <span className={styles.textspan}>Receive</span>
          <select value={tokenIndex.toString()} onChange={handleTokenSelect}>
            <option value="0">FantieCoin</option>
            <option value="1">testUSDC</option>
            <option value="2">testETH</option>
          </select>

          <div className={styles.Receivebox} aria-label="Set increment amount">
            {LPAmount.toString()}
            <span className={styles.textspangrey}>
              {tokens[tokenIndex].symbol}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <button disabled={isLoading} onClick={handleSubmit}>
          Withdraw
        </button>
      </div>
    </div>
  );
};

export default Withdraw;
