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
import { Button } from "../../components/Button/Button";
import cx from "classnames";
// import { BiError } from "react-icons/bi";
// import { MdSwapCalls } from "react-icons/md";
import { SwapButton } from "../../components/SwapButton";
import SwapSwapInput from "../../components/SwapComponent/SwapSwapInput";
import { Box } from "@mui/material";
import { Modal } from "../../components/Modal";
import DipositAndWithdrawComponent from "../../components/DepositAndWithdrawComponent";
import MintDialogComponent from "../../components/MintDialogComponent";


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

  const [swapDetails, _setSwapDetails] = useState(() => ({
    amount: "",
    currency: "ETH",
  }));

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

  const [modal, setModal] = useState(false);
  const [mintModal, setMintModal] = useState(false);

  const doTransfer = () => {}

  const switchTransferType = (e: any) => {}

  const setSwapDetails = (values: any) => {
    const details = {
      ...swapDetails,
      ...values,
    };

    _setSwapDetails(details);
  }

  // const openDipositWithdrawWindow = () => {
  //   const content = <>
  //     <Box></Box>
  //   </>
  // }

  // const openMintWindow = () => {}

  return (
   <>
      <Box display="flex" justifyContent={'center'} flexDirection="column" alignItems={'center'} pt="100px">
        <Box display="flex" width={'auto'} mb="20px" justifyContent={'center'}>
          <Box borderRadius={'24px'} bgcolor="rgba(0, 0, 0, 0.2)" borderColor="lightgrey" width="60%" p="20px" display="flex" justifyContent={'space-between'}>
            <Box display='flex' flexDirection="column">
              <Box>Total Token amount</Box>
              <Box>$0.00</Box>
            </Box>
            <Box>Detailed balance report</Box>
          </Box>
          <Box ml="10px" width="30%" display="flex" flexDirection="column" alignItems="center">
            <Button className="bg_btn" text="MINT" onClick={()=>{setMintModal(true)}} />
            <Button className="bg_btn" text="Dipost/Withdraw" onClick={()=>{setModal(true)}} />
          </Box>
        </Box> 
        <div className="swap_box">
          <div className="swap_box_top">
            <div className="swap_coin_title">
              <h5>FROM</h5>
            </div>
            <SwapSwapInput
              // balances={balances}
              // currencies={currencies}
              value={swapDetails}
              onChange={setSwapDetails}
            />
          </div>

          <div className="swap_box_bottom">
            <div className="swap_box_swap_wrapper">
              <SwapButton onClick={switchTransferType} />
              <h5>Switch</h5>
            </div>

            <div className="swap_coin_stats">
              <div className="swap_coin_stat">
                <div className="swap_coin_details">
                  <div className="swap_coin_title">
                    <h5>TO</h5>
                  </div>
                </div>
              </div>
            </div>
            <SwapSwapInput
              // balances={balances}
              // currencies={currencies}
              value={swapDetails}
              onChange={setSwapDetails}
            />

            <div className="swap_button" style={{marginTop: '30px'}}>
              {/* {!user.address && (
                <Button
                  className="bg_btn"
                  text="CONNECT WALLET"
                  img={darkPlugHead}
                  onClick={() => {}}
                />
              )}
              {user.address && hasError && (
                <Button
                  className="bg_btn zig_btn_disabled bg_err"
                  text={formErr}
                  icon={<BiError />}
                />
              )} */}
              {/* {user.address && !hasError && ( */}
                <Button
                  // loading={loading}
                  className={cx("bg_btn", {
                    // zig_disabled:
                      // !hasAllowance || swapDetails.amount.length === 0,
                  })}
                  text="ConnectWallet"
                  // icon={<MdSwapCalls />}
                  onClick={doTransfer}
                />
              {/* )} */}
            </div>
          </div>
        </div>
      </Box>
      {/* <Modal
        title="Select a token to Swap"
        onClose={() => setModal({open: false, content: null})}
        show={modal.open}
      >
        {modal.content}
      </Modal> */}
      <DipositAndWithdrawComponent
        open={modal}
        onClose={()=>{setModal(false)}}
      />
      <MintDialogComponent
        open={mintModal}
        onClose={()=>{setMintModal(false)}}
      />
    </> 
  );
};

export default Swap;
