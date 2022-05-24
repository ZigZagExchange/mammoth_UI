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
import { waitForTransaction } from "../../services/wallet.service";
import {
  decimalToBN,
  padDecimal,
  toFloatingPoint,
} from "../../core/floating-point";

const Deposit = () => {
  const [depositAmount, changeAmount] = useState("0");
  const [depositAmountDecimal, changeAmountDecimal] = useState("");

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

  const predictDepositResult = async (number: string, decimal: string) => {
    const total = BigNumber.from(number).mul(10000).add(decimalToBN(decimal));
    const amount = await getDepositERC20Amount(tokenIndex, total.toString());
    changeLPAmount(toFloatingPoint(amount.toString()));
  };

  const handleInputChange = async (e: any) => {
    e.preventDefault();
    const val = e.target.value;
    const parts = val.split(".");

    const hasDecmial = depositAmountDecimal.length;

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

      await predictDepositResult(newNumber, newDecimal);
    } else {
      changeAmount("0");
      changeAmountDecimal("");
    }
  };

  const handleTokenSelect = async (e: any) => {
    e.preventDefault();
    const val = e.target.value;
    //await tokenApproval();
    changeIndex(parseInt(val));
    await predictDepositResult(depositAmount, depositAmountDecimal);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    changeIsLoading(true);
    changeLoadingMsg(`Depositing ${tokens[tokenIndex].symbol}`);
    changeTxMsg(`Deposit ${tokens[tokenIndex].symbol} success`);
    let success = true;
    try {
      const tx = await depositPool(
        depositAmount + padDecimal(depositAmountDecimal),
        tokenIndex
      );
      await waitForTransaction(tx.transaction_hash);
    } catch (e) {
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

  const getFPString = () => {
    if (depositAmountDecimal.length > 0) {
      return depositAmount + "." + depositAmountDecimal;
    }
    return depositAmount;
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
            value={getFPString()}
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
