import Pool from "./_pool";
import styles from "../../styles/Pool.module.css";
import React, { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import {
  approveToken,
  depositPool,
  getDepositERC20Amount,
  getTokeAllowance,
  tokens,
} from "../../services/pool.service";
import LoadingIndicator from "../../components/Indicator";

const Deposit = () => {
  const [depositAmount, changeAmount] = useState(0);
  const [LPAmount, changeLPAmount] = useState("0");
  const [tokenIndex, changeIndex] = useState(0);
  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState("Awaiting Deposit");
  const [txComplete, changeTxComplete] = useState(false);
  const [txMessage, changeTxMsg] = useState("Deposit Complete");
  const [failMsg, changeFailMsg] = useState("");
  const [isTokenApproved, changeTokenApproved] = useState(false);

  const tokenApproval = useCallback(async () => {
    const res: BigNumber = await getTokeAllowance(tokenIndex);
    if (res.isZero()) {
      changeTokenApproved(false);
    } else {
      changeTokenApproved(true);
    }
  }, [tokenIndex]);

  useEffect(() => {
    (async () => {
      await tokenApproval();
    })();
  });

  const predictDepositResult = async (amount: number) => {
    const result = await getDepositERC20Amount(tokenIndex, amount);
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
    await predictDepositResult(val);
  };

  const handleTokenSelect = async (e: any) => {
    e.preventDefault();
    const val = e.target.value;
    //await tokenApproval();
    changeIndex(parseInt(val));
    await predictDepositResult(depositAmount);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    changeIsLoading(true);
    changeLoadingMsg(`Depositing ${tokens[tokenIndex].symbol}`);
    changeTxMsg(`Deposit ${tokens[tokenIndex].symbol} success`);
    let success = true;
    try {
      await depositPool(
        depositAmount,
        tokenIndex
      );
    } catch (e) {
      console.log(e)
      success = false;
      changeFailMsg("Deposit failed");
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
      changeTokenApproved(true);
    }
  };

  const handleApprove = async (e: any) => {
    e.preventDefault();

    changeLoadingMsg(`Approving ${tokens[tokenIndex].symbol}`);
    changeTxMsg(`${tokens[tokenIndex].symbol} approved`);
    changeIsLoading(true);
    let success = true;
    try {
      await approveToken(tokenIndex);
    } catch (e) {
      console.log(e);
      success = false;
      changeFailMsg("Approval failed");
    }
    changeIsLoading(false);
    if (success) {
      console.log("success");
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
          <select value={tokenIndex.toString()} onChange={handleTokenSelect}>
            <option value="0">FantieCoin</option>
            <option value="1">testUSDC</option>
            <option value="2">testETH</option>
          </select>
          <input
            onChange={handleInputChange}
            className={styles.textbox}
            name="amount"
            aria-label="Set increment amount"
            value={depositAmount}
            type="number"
          />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.transactionPart}>
          <span className={styles.textspan}>Receive</span>
          <div>
            <div
              className={styles.Receivebox}
              aria-label="Set increment amount"
            >
              {LPAmount.toString()}
              <span className={styles.textspangrey}>LP Tokens</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.row}>
        <button disabled={isTokenApproved} onClick={handleApprove}>
          Approve
        </button>
        <button disabled={isLoading || !isTokenApproved} onClick={handleSubmit}>
          Deposit
        </button>
      </div>
    </div>
  );
};

export default Deposit;
