import React, { useEffect, useState } from "react";
import {
  getLiquidityBalances,
  getPoolBalances,
  mintToken,
} from "../../services/pool.service";
import {tokens } from "../../services/constants";
import Image from "next/image";
import styles from "../../styles/Pool.module.css";

const Pool = () => {
  const [poolbalances, changeBalances] = useState(['0', '0', '0']);

  const [liquidityBalance, changeLiquidityBalance] = useState("");

  useEffect(() => {
    (async () => {
      const res: string[] = await getPoolBalances();
      changeBalances(res);
    })();

    (async () => {
      const res: string = await getLiquidityBalances();
      changeLiquidityBalance(res);
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
