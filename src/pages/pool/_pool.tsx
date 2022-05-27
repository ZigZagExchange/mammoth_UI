import { BigNumber } from "ethers";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  getLiquidityBalances,
  getPoolBalances,
  mintToken,
  tokens,
} from "../../services/pool.service";
import Image from "next/image";
import styles from "../../styles/Pool.module.css";
import { toFloatingPoint } from "../../core/floating-point";

const Pool = () => {
  const [poolbalances, changeBalances] = useState([
    BigNumber.from(0),
    BigNumber.from(0),
    BigNumber.from(0),
  ]);

  const [liquidityBalance, changeLiquidityBalance] = useState("");

  useEffect(() => {
    (async () => {
      const res = await getPoolBalances();
      const fpBalances = res.map((e: BigNumber) =>
        toFloatingPoint(e.toString())
      );
      changeBalances(fpBalances);
    })();

    (async () => {
      const res: BigNumber = await getLiquidityBalances();
      const res2 = toFloatingPoint(res.toString());
      changeLiquidityBalance(res2);
    })();
  }, []);

  const handleMint = async (tokenIndex: number) => {
    await mintToken(tokenIndex);
  };

  const handleCopy = (tokenIndex: number) => {
    navigator.clipboard.writeText(tokens[tokenIndex].address);
  };

  let path = "";
  if (typeof window !== "undefined") {
    path = window.location.pathname.split("/")[2];
  }

  return (
    <div>
      <div className={styles.row}>
        <div className={styles.infoContainer}>
          <div className={styles.row}>
            <h4>Your Balance</h4>
          </div>
          <div className={styles.row}>
            LP Token : &nbsp; <b>{liquidityBalance.toString()}</b>
          </div>
        </div>
        <div className={styles.infoContainer}>
          <div className={styles.row}>
            <h4>Pool Balance</h4>
          </div>
          <div className={styles.row}>
            {tokens[0].name} :&nbsp; <b>{poolbalances[0].toString()}</b>{" "}
            <button className={styles.smallbtn} onClick={() => handleMint(0)}>
              Mint
            </button>
            <button className={styles.smallbtn} onClick={() => handleCopy(0)}>
              <Image
                src="/clipboard.svg"
                width="20"
                height="20"
                alt="copy the first token address"
              />
            </button>
          </div>
          <div className={styles.row}>
            {tokens[1].name} :&nbsp; <b>{poolbalances[1].toString()}</b>{" "}
            <button className={styles.smallbtn} onClick={() => handleMint(1)}>
              Mint
            </button>
            <button className={styles.smallbtn} onClick={() => handleCopy(1)}>
              <Image
                src="/clipboard.svg"
                width="20"
                height="20"
                alt="copy the first token address"
              />
            </button>
          </div>
          <div className={styles.row}>
            {tokens[2].name} :&nbsp; <b>{poolbalances[2].toString()}</b>{" "}
            <button className={styles.smallbtn} onClick={() => handleMint(2)}>
              Mint
            </button>
            <button className={styles.smallbtn} onClick={() => handleCopy(2)}>
              <Image
                src="/clipboard.svg"
                width="20"
                height="20"
                alt="copy the first token address"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pool;
