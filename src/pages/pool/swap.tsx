import React, { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import {
  approveToken,
  swapPool,
  getSwapAmount,
  getTokenAllowance,
  getPoolBalances,
  getLiquidityBalances
} from "../../services/pool.service";
import {truncateAddress} from "../../services/address.service"
import {tokens } from "../../services/constants";
import LoadingIndicator from "../../components/Indicator";
import { Button } from "../../components/Button/Button";
import cx from "classnames";
import { SwapButton } from "../../components/SwapButton";
import SwapSwapInput from "../../components/SwapComponent/SwapSwapInput";
import { Box } from "@mui/material";
import MintDialogComponent from "../../components/MintDialogComponent";
import _ from "lodash";
import WithdrawComponent from "../../components/WithdrawComponent";
import DepositComponent from "../../components/DepositComponent";
import Image from "next/image";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getStarknet } from "get-starknet";

const Swap = () => {
  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState("Awaiting Swap");
  const [txComplete, changeTxComplete] = useState(false);
  const [txMessage, changeTxMsg] = useState("Swap Complete");
  const [isTokenApproved, changeTokenApproved] = useState(false);
  const [failMsg, changeFailMsg] = useState("");
  const [poolbalances, changeBalances] = useState(['0', '0', '0']);
  const [liquidityBalance, changeLiquidityBalance] = useState('0');
  const [tokenAllowance, setTokenAllowance] = useState("0");


  const [modal, setModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [mintModal, setMintModal] = useState(false);
  const [fromDetails, setFromDetails] = useState(() => ({
    amount: "",
    symbol: tokens[0].symbol,
  }));

  const [toDetails, setToDetails] = useState(() => ({
    amount: "",
    symbol: tokens[1].symbol,
  }));
  const [address, setAddress] = useState("")

  useEffect(() => {
    (async () => {
      const res: string[] = await getPoolBalances();
      changeBalances(res);
    })();

    (async () => {
      const res: string = await getLiquidityBalances();
      changeLiquidityBalance(res);
      const wallet = getStarknet();
      const [address] = await wallet.enable();
      setAddress(address);
      console.log(address)
    })();
  }, []);

  const tokenApproval = useCallback(async () => {
    const result: string = await getTokenAllowance(getTokenIndex(fromDetails.symbol));
    setTokenAllowance(result);
  }, [fromDetails.symbol]);

  useEffect(() => {
    (async () => {
      await tokenApproval();
    })();
  });

  useEffect(()=>{
    (async() =>{
      await predictSwapResult(getString2Number(fromDetails.amount));
    })();
  }, [toDetails.amount, fromDetails])

  useEffect(()=>{
    if(!txComplete) return;
    console.log("asdadfasdf", txMessage)
    openErrorWindow(txMessage, 1)
  }, [txComplete])

  useEffect(()=>{
    if(failMsg.length)
      openErrorWindow(failMsg, 2)
  },[failMsg])

  useEffect(()=>{
    if(!isLoading) return;
    openErrorWindow(loadingMsg, 3)
  }, [isLoading])

  const predictSwapResult = async (amount: number) => {
    const result = await getSwapAmount(
      getTokenIndex(fromDetails.symbol),
      getTokenIndex(toDetails.symbol),
      amount
    );
    // changeLPAmount(result);
    const detail2 = {
      ...toDetails,
      ...{amount: `${result}`},
    };
    setToDetails(detail2);
  };

  const handleSubmit = async () => {
    changeIsLoading(true);
    changeLoadingMsg(
      `Swapping ${tokens[getTokenIndex(fromDetails.symbol)].symbol} for ${tokens[getTokenIndex(toDetails.symbol)].symbol}`
    );
    changeTxMsg(
      `Swap ${tokens[getTokenIndex(fromDetails.symbol)].symbol} for ${tokens[getTokenIndex(toDetails.symbol)].symbol} success`
    );
    let success = true;
    try {
      await swapPool(
        getString2Number(toDetails.amount),
        getTokenIndex(fromDetails.symbol),
        getTokenIndex(toDetails.symbol)
      );
    } catch (e) {
      console.log(e)
      success = false;
      changeFailMsg("Swap failed");
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const getString2Number = (amount: string) => {
    return Number.isNaN(amount) ? 0 : Number(amount)
  }

  const getTokenIndex = (symbol: string) => {
    return _.findIndex(tokens, {symbol})
  }

  const handleApprove = async () => {

    changeIsLoading(true);
    changeLoadingMsg(`Approving ${tokens[getTokenIndex(fromDetails.symbol)].symbol}`);
    changeTxMsg(`${tokens[getTokenIndex(toDetails.symbol)].symbol} approved`);
    let success = true;
    try {
      await approveToken(
        getTokenIndex(fromDetails.symbol),
        Number(fromDetails.amount) * 1.05
      );
    } catch (e) {
      success = false;
      changeFailMsg("Approval failed");
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const switchTransferType = (e: any) => {
    setFromDetails(toDetails);
    const value = {amount: ""};
    setToDetails({...fromDetails, ...value})
    console.log({...fromDetails, ...value})
    // predictSwapResult(Number.isNaN(toDetails.amount) ? 0 : Number(toDetails.amount));
  }

  const setSwapDetails = async (values: {amount: string, symbol: string}, from: boolean) => {

    console.log("asdfadsfas", from, values)

    if (from) {
      const details = {
        ...fromDetails,
        ...values,
      };
      if (details.symbol === toDetails.symbol) {
        setToDetails({...fromDetails, ...{amount: ''}});
      }
      setFromDetails(details);
    } else {
      const detail2 = {
        ...toDetails,
        ...values,
      };
      if (detail2.symbol === fromDetails.symbol) {
        setFromDetails({...toDetails, ...{amount: ''}});
      }
      setToDetails(detail2);
    }

    changeTokenApproved(Number(tokenAllowance) > Number(fromDetails.amount));
  }

  const openErrorWindow = (value: string, flag: number) => {
    if(flag === 3)
      toast.warn(
        value,
        {
          closeOnClick: false,
          autoClose: 15000,
        },
      );
    if(flag ===2 )
      toast.error(
        value,
        {
          closeOnClick: false,
          autoClose: 15000,
        },
      );
    if(flag === 1) {
      toast.success(
        value,
        {
          closeOnClick: false,
          autoClose: 15000,
        },
      );
    }
  }

  return (
    <>
      <Box py="10px" borderRadius={'8px'} px="30px" ml="20px" mt="20px" width="190px" border="1px solid rgba(255, 255, 255, 0.13)">{address && truncateAddress(address)}</Box>
      <Box display="flex" justifyContent={'center'} flexDirection="column" alignItems={'center'} pt="100px">
        <Box display="flex" width={'auto'} mb="50px" justifyContent={'center'} alignItems="center">
          <Box borderRadius={'8px'} border="1px solid rgba(255, 255, 255, 0.13)" width="100%" p="30px" display="flex" justifyContent={'space-between'}>
            <Box display='flex' flexDirection="column" mr="20px">
              <Box mb="30px">Total Token amount</Box>
              <Box textAlign={'center'}>{liquidityBalance}</Box>
            </Box>
            <Box display="flex" flexDirection="column" >
              <Box>Detailed balance report</Box>
              {
                _.map(poolbalances, (each: any, index) => {
                  return <Box display={'flex'} key={index} justifyContent='space-between'>{tokens[index].name} :&nbsp; <b>{each}</b>{" "}</Box>
                })
              }
            </Box>

          </Box>
          <Box ml="35px" width="25%" height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent={'space-between'}>
            <Button className="bg_btn" style={{ borderRadius: '5px' }} text="MINT" onClick={() => { setMintModal(true) }} />
            <Button className="bg_btn" style={{ borderRadius: '5px' }} text="Deposit" onClick={() => { setModal(true) }} />
            <Button className="bg_btn" style={{ borderRadius: '5px' }} text="Withdraw" onClick={() => { setWithdrawModal(true) }} />
          </Box>
        </Box>
        <div className="swap_box">
          <div className="swap_box_top">
            <div className="swap_coin_title">
              <Box fontSize="16px" fontWeight="600">From</Box>
              <Box fontSize="12px" fontWeight="400">Available Balance: 1.09393USDC</Box>
            </div>
            <SwapSwapInput
              // balances={balances}
              // currencies={currencies}
              from={true}
              value={fromDetails}
              onChange={setSwapDetails}
            />
            {/* <Box mt="10px" color="rgba(255, 255, 255, 0.72)" fontSize="11px" textAlign="right">Estimated value: ~$ 30.33</Box> */}
          </div>

          <div className="swap_box_bottom">
            <div className="swap_box_swap_wrapper">
              <SwapButton onClick={switchTransferType} />
              <div className="swap_box_line" />
            </div>

            <div className="swap_coin_title" style={{ marginBottom: '10px' }}>
              <Box fontSize="16px" fontWeight="600">To</Box>
              <Box fontSize="12px" fontWeight="400">1 USDC = 1.22 ZZUSDC</Box>
            </div>
            <SwapSwapInput
              // balances={balances}
              // currencies={currencies}
              from={false}
              value={toDetails}
              onChange={setSwapDetails}
              readOnly={true}
            />
            <Box mt="10px" color="rgba(255, 255, 255, 0.72)" fontSize="11px" justifyContent="flex-end" alignItems="center" display="flex">
              {/* <Box mr="5px">Estimated value: ~$ 30.33</Box> */}
              <Image
                src="/Icon.svg"
                width="20"
                height="20"
                alt="mammoth pool logo"
              />
            </Box>


            <div className="swap_button" style={{ marginTop: '30px' }}>
              {(!isTokenApproved) && (
                <Button
                  loading={isLoading}
                  className={cx("bg_btn", {
                    // zig_disabled:
                    // !hasAllowance || fromDetails.amount.length === 0,
                  })}
                  style={{ height: '40px', fontSize: '18px' }}
                  text="Approve"
                  // icon={<MdSwapCalls />}
                  onClick={()=>handleApprove()}
                />
              )}
              {(isTokenApproved) && (
                <Button
                  loading={isLoading}
                  className={cx("bg_btn", {
                    // zig_disabled:
                    // !hasAllowance || fromDetails.amount.length === 0,
                  })}
                  text="Swap"
                  // icon={<MdSwapCalls />}
                  onClick={()=>handleSubmit()}
                />
              )}
            </div>
          </div>
        </div>
      </Box>
      <DepositComponent
        open={modal}
        onClose={() => { setModal(false) }}
      />
      <WithdrawComponent
        open={withdrawModal}
        onClose={() => { setWithdrawModal(false) }}
      />
      <MintDialogComponent
        open={mintModal}
        onClose={() => { setMintModal(false) }}
      />
      <ToastContainer />
    </>
  );
};

export default Swap;
