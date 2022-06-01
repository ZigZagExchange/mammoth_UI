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
  getPoolBalances,
  getLiquidityBalances
} from "../../services/pool.service";
import LoadingIndicator from "../../components/Indicator";
import { Button } from "../../components/Button/Button";
import cx from "classnames";
import { SwapButton } from "../../components/SwapButton";
import SwapSwapInput from "../../components/SwapComponent/SwapSwapInput";
import { Box } from "@mui/material";
import DipositAndWithdrawComponent from "../../components/DipositAndWithdrawComponent";
import MintDialogComponent from "../../components/MintDialogComponent";
import _ from "lodash";


const Swap = () => {
  const [swapAmount, changeAmount] = useState(0);
  const [LPAmount, changeLPAmount] = useState('0');
  const [tokenInIndex, changeIndexIn] = useState(0);
  const [tokenOutIndex, changeIndexOut] = useState(1);
  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState("Awaiting Swap");
  const [txComplete, changeTxComplete] = useState(false);
  const [txMessage, changeTxMsg] = useState("Swap Complete");
  const [isTokenApproved, changeTokenApproved] = useState(false);
  const [failMsg, changeFailMsg] = useState("");
  const [poolbalances, changeBalances] = useState(['0', '0', '0']);
  const [liquidityBalance, changeLiquidityBalance] = useState('0');

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

  const predictSwapResult = async (amount: number) => {
    const result = await getSwapAmount(
      tokenInIndex,
      tokenOutIndex,
      amount
    );
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
    await predictSwapResult(val);
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

    await predictSwapResult(swapAmount);
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
    await predictSwapResult(swapAmount);
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
      await swapPool(
        swapAmount,
        tokenInIndex,
        tokenOutIndex
      );
    } catch (e) {      
      console.log(e)
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

  const [modal, setModal] = useState(false);
  const [mintModal, setMintModal] = useState(false);
  const [swapDetails, _setSwapDetails] = useState(() => ({
    amount: "",
    currency: "USDC",
  }));

  const [toDetail, setToDetails] = useState(() => ({
    amount: "",
    currency: "ZZUSD",
  }));

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

  const switchTransferType = (e: any) => {}

  const setSwapDetails = async(values: any, from: boolean) => {

    console.log("asdfadsfas",from)

    if(from) {
      const details = {
        ...swapDetails,
        ...values,
      };
      if(details.currency === toDetail.currency) {
        setToDetails(swapDetails);
      }
      _setSwapDetails(details);
    }
    else{
      const detail2 = {
        ...toDetail,
        ...values,
      };
      if(detail2.currency === swapDetails.currency) {
        _setSwapDetails(toDetail);
      }
      setToDetails(detail2);
    }

    await predictSwapResult(swapAmount);
  }

  return (
   <>
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


      <Box display="flex" justifyContent={'center'} flexDirection="column" alignItems={'center'} pt="100px">
        <Box display="flex" width={'auto'} mb="50px" justifyContent={'center'} alignItems="center">
          <Box borderRadius={'24px'} boxShadow={'5px 5px 20px 2px #141414, 2px 2px 7px 0px #424242, -5px -5px 20px 2px #4a4a4a, -2px -2px 7px 0px #626262'} bgcolor="rgba(0, 0, 0, 0.2)" borderColor="lightgrey" width="70%" p="20px" display="flex" justifyContent={'space-between'}>
            <Box display='flex' flexDirection="column">
              <Box mb="30px">Total Token amount</Box>
              <Box textAlign={'center'}>{liquidityBalance}</Box>
            </Box>
            <Box display="flex" flexDirection="column" >
              <Box>Detailed balance report</Box>
              {
                _.map(poolbalances, (each: any, index)=>{
                  return <Box display={'flex'} key={index} justifyContent='space-between'>{tokens[index].name} :&nbsp; <b>{each}</b>{" "}</Box>
                })
              }
            </Box>
            
          </Box>
          <Box ml="35px" width="25%" display="flex" flexDirection="column" alignItems="center">
            <Button className="bg_btn" style={{borderRadius: '20px'}} text="MINT" onClick={()=>{setMintModal(true)}} />
            <Button className="bg_btn" style={{borderRadius: '20px'}} text="Dipost/Withdraw" onClick={()=>{setModal(true)}} />
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
              from={true}
              value={swapDetails}
              onChange={setSwapDetails}
            />
          </div>

          <div className="swap_box_bottom">
            <div className="swap_box_swap_wrapper">
              <SwapButton onClick={switchTransferType} />
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
              from={false}
              value={toDetail}
              onChange={setSwapDetails}
            />

            <div className="swap_button" style={{marginTop: '30px'}}>
              {(!isTokenApproved) && (
                <Button
                  loading={isLoading}
                  className={cx("bg_btn", {
                    // zig_disabled:
                      // !hasAllowance || swapDetails.amount.length === 0,
                  })}
                  style={{height: '50px', fontSize: '18px'}}
                  text="Approve"
                  // icon={<MdSwapCalls />}
                  onClick={handleApprove}
                />
              )}
              {(isTokenApproved) && (
                <Button
                  loading={isLoading}
                  className={cx("bg_btn", {
                    // zig_disabled:
                      // !hasAllowance || swapDetails.amount.length === 0,
                  })}
                  text="Swap"
                  // icon={<MdSwapCalls />}
                  onClick={handleSubmit}
                />
              )}
            </div>
          </div>
        </div>
      </Box>
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
