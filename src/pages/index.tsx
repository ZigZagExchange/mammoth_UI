import React, { useCallback, useEffect, useState } from "react";
import {
  approveToken,
  swapPool,
  getSwapAmount,
  getAllowances,
  getPoolBalances,
  getUserBalances,
  getLiquidityBalances,
} from "../services/pool.service";
import { truncateAddress } from "../services/address.service"
import { tokens } from "../services/constants";
import { Button } from "../components/Button/Button";
import cx from "classnames";
import { SwapButton } from "../components/SwapButton";
import SwapSwapInput from "../components/SwapComponent/SwapSwapInput";
import { Box } from "@mui/material";
import MintDialogComponent from "../components/MintDialogComponent";
import _ from "lodash";
import WithdrawComponent from "../components/WithdrawComponent";
import DepositComponent from "../components/DepositComponent";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getStarknet } from "get-starknet";
import styled from "@emotion/styled";
import { disconnectWallet, getExplorerBaseUrl, isWalletConnected } from "../services/wallet.service";
import { getTokenIndex } from "../libs/utils";
import { NextPage } from "next/types";

const Home: NextPage = () => {
  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState("Awaiting Swap");
  const [txComplete, changeTxComplete] = useState(false);
  const [txMessage, changeTxMsg] = useState("Swap Complete");
  const [isTokenApproved, changeTokenApproved] = useState(false);
  const [failMsg, changeFailMsg] = useState("");
  const [poolbalances, changePoolBalances] = useState(['--', '--', '--']);
  const [userBalances, changeUserBalances] = useState(['--', '--', '--']);
  const [liquidityBalance, changeLiquidityBalance] = useState('--');
  const [tokenAllowances, changeTokenAllowances] = useState(['--', '--', '--']);


  const [depositModal, setDepositModal] = useState(false);
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
  const [swapRate, setSwapRate] = useState(0);
  const [openDrop, setOpenDrop] = useState(false);

  useEffect(() => {
    onEvent();
    setInterval(() => { onEvent(); }, 30000);
  }, [])

  useEffect(() => {
    if(!isWalletConnected()) {
      setSwapRate(0);
      setToDetails({
        amount: "",
        symbol: tokens[1].symbol,
      })
      setFromDetails({
        amount: "",
        symbol: tokens[0].symbol,
      })
      changeTokenAllowances(["--","--","--"]);
      changePoolBalances(["--","--","--"]);
      changeUserBalances(["--","--","--"]);
      changeTokenApproved(false);
      return;
    }
    onEvent();    
  }, [address]);

  const connectWallet = async () => {
    const res: string = await getLiquidityBalances();
    changeLiquidityBalance(res);
    const wallet = getStarknet();
    const [address] = await wallet.enable({showModal: true});
    setAddress(address);
    console.log("test2", isWalletConnected())
  };

  const tokenApproval = useCallback(async () => {
    if(!isWalletConnected()) return;
    const i = getTokenIndex(fromDetails.symbol);
    changeTokenApproved(Number(tokenAllowances[i]) > Number(fromDetails.amount));
  }, [fromDetails.symbol]);

  useEffect(() => {
    if(!isWalletConnected()) return;
    (async () => {
      const res: string = await getSwapAmount(
        getTokenIndex(fromDetails.symbol),
        getTokenIndex(toDetails.symbol),
        1
      );
      setSwapRate(Number(res));
      await tokenApproval();
    })();
  }, [fromDetails.symbol, toDetails.symbol])

  useEffect(() => {
    if(!isWalletConnected()) return;
    (async () => {
      await predictSwapResult(getString2Number(fromDetails.amount));
    })();
  }, [toDetails.amount, fromDetails])

  useEffect(() => {
    if (!txComplete) return;
    console.log("asdadfasdf", txMessage)
    openErrorWindow(txMessage, 1)
  }, [txComplete])

  useEffect(() => {
    if (failMsg.length)
      openErrorWindow(failMsg, 2)
  }, [failMsg])

  useEffect(() => {
    if (!isLoading) return;
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
      ...{ amount: `${result}` },
    };
    setToDetails(detail2);
  };

  const handleSubmit = async () => {
    if(Number(toDetails.amount) === 0 || Number(fromDetails.amount) === 0 || isNaN(Number(toDetails.amount)) || isNaN(Number(fromDetails.amount))) return;
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
    } finally {
      onEvent();
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const getString2Number = (amount: string) => {
    return Number.isNaN(amount) ? 0 : Number(amount)
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
    } finally {
      onEvent();
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const switchTransferType = (e: any) => {
    setFromDetails(toDetails);
    const value = { amount: "" };
    setToDetails({ ...fromDetails, ...value })
    console.log({ ...fromDetails, ...value })
    // predictSwapResult(Number.isNaN(toDetails.amount) ? 0 : Number(toDetails.amount));
  }

  const setSwapDetails = async (values: {amount: string, symbol: string}, from: boolean) => {
    if (from) {
      const details = {
        ...fromDetails,
        ...values,
      };
      if (details.symbol === toDetails.symbol) {
        setToDetails({ ...fromDetails, ...{ amount: '' } });
      }
      setFromDetails(details);
    } else {
      const detail2 = {
        ...toDetails,
        ...values,
      };
      if (detail2.symbol === fromDetails.symbol) {
        setFromDetails({ ...toDetails, ...{ amount: '' } });
      }
      setToDetails(detail2);
    }
  }

  const openErrorWindow = (value: string, flag: number) => {
    if(toast.isActive(flag)) return;
    if(flag === 3) {
      toast.info(
        value,
        {
          closeOnClick: false,
          autoClose: 15000,
          position: toast.POSITION.BOTTOM_RIGHT,
          toastId: flag
        },
      );
    }
    if(flag === 2 ) {
      toast.error(
        value,
        {
          closeOnClick: false,
          autoClose: 15000,
          position: toast.POSITION.BOTTOM_RIGHT,
          toastId: flag
        },
      );
    }
    if(flag === 1) {
      toast.success(
        value,
        {
          closeOnClick: false,
          autoClose: 15000,
          position: toast.POSITION.BOTTOM_RIGHT,
          toastId: flag
        },
      );
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(address || "")
  }

  const onEvent = async () => {
    console.log("onEvent")

    const [
      _poolBalance,
      _userBalance,
      _tokenAlowance
    ] = await Promise.all([
      getPoolBalances(),
      getUserBalances(),
      getAllowances()
    ]);
    changePoolBalances(_poolBalance);
    changeUserBalances(_userBalance);
    changeTokenAllowances(_tokenAlowance);
    await predictSwapResult(getString2Number(fromDetails.amount));
    await tokenApproval();
  }

  const disconnect = () => {
    disconnectWallet();
    setAddress("")
  }

  return (
    <Box onClick={() => { setOpenDrop(false); }}>
      {console.log(openDrop, poolbalances)}
      <Box display="flex" justifyContent={'end'} mr="50px">
        <ConnectButton onClick={(e: any) => {
          if(address) {
            e.stopPropagation();
            setOpenDrop(!openDrop);
          } else {
            connectWallet();
          }
        }}>
          <Box>{address ? truncateAddress(address) : "Connect Wallet"}</Box>
          <Dropdown visible={openDrop} >
            <DropdownItem onClick={copyAddress}><img src="/copy.svg" width="20px" style={{ marginRight: '10px' }} /> Copy Address</DropdownItem>
            <DropdownItem href={`${getExplorerBaseUrl()}/contract/${address}`} target="_blank"><img src="/view.svg" width="20px" style={{ marginRight: '10px' }} /> View on Explorer</DropdownItem>
            <DropdownItem onClick={disconnect}><img src="/disconnect.svg" width="20px" style={{ marginRight: '10px' }} /> Disconnect</DropdownItem>
          </Dropdown>
        </ConnectButton>
      </Box>
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
                  return <Box display={'flex'} key={index} justifyContent='space-between'>{tokens[index].name} :&nbsp; <b>{each === '--' ? each : parseFloat(each).toFixed(4)}</b>{" "}</Box>
                })
              }
            </Box>

          </Box>
          <Box ml="35px" width="25%" height="100%" display="flex" flexDirection="column" alignItems="center" justifyContent={'space-between'}>
            <Button className="bg_btn" style={{ borderRadius: '5px' }} text="MINT" onClick={() => { setMintModal(true) }} />
            <Button className="bg_btn" style={{ borderRadius: '5px' }} text="Deposit" onClick={() => { setDepositModal(true) }} />
            <Button className="bg_btn" style={{ borderRadius: '5px' }} text="Withdraw" onClick={() => { setWithdrawModal(true) }} />
          </Box>
        </Box>
        <div className="swap_box">
          <Box px="30px" pt="20px" fontSize="22px" fontWeight="bold" color="white">Swap</Box>
          <div className="swap_box_top">
            <div className="swap_coin_title">
              <Box fontSize="16px" fontWeight="600">From</Box>
              {/* <Box fontSize="12px" fontWeight="400">Available Balance: {Number(userBalances[getTokenIndex(fromDetails.symbol)]).toFixed(4)} {fromDetails.symbol}</Box> */}
            </div>
            <SwapSwapInput
              balances={userBalances}
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
              <Box fontSize="12px" fontWeight="400">1 {fromDetails.symbol} = {swapRate} {toDetails.symbol}</Box>
            </div>
            <SwapSwapInput
              // balances={balances}
              // currencies={currencies}
              from={false}
              value={toDetails}
              onChange={setSwapDetails}
              readOnly={true}
            />
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
                  onClick={() => handleApprove()}
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
                  onClick={() => handleSubmit()}
                />
              )}
            </div>
          </div>
        </div>
      </Box>
      <DepositComponent
        open={depositModal}
        onClose={() => { setDepositModal(false) }}
        balance={userBalances}
        allowance={tokenAllowances}
        onEvent={onEvent}
      />
      <WithdrawComponent
        open={withdrawModal}
        onClose={() => { setWithdrawModal(false) }}
        onEvent={onEvent}
      />
      <MintDialogComponent
        open={mintModal}
        onClose={() => { setMintModal(false) }}
        onEvent={onEvent}
      />
      <ToastContainer />
    </Box>
  );
};

export default Home;

const ConnectButton = styled('div')(
  ({ theme }) =>
    `
    border-radius: 8px;
    padding: 10px 30px;
    margin-left: 20px;
    margin-top: 20px;
    width: 210px;
    border: 1px solid rgba(255, 255, 255, 0.13);
    cursor: pointer;
    background: rgba(0,0,0,0.8);
    position: relative;
    display: flex;
    transition: all 0.2s ease-out;
    z-index: 10;
    justify-content: end;

    &:hover {
      transition: all 0.2s ease-out;
      background: rgba(0,0,0,0.1);
    }
  
    &::after {
      content: '▾';
      margin-left: 10px;
    }
`
);

const Dropdown = styled.div<{ visible?: boolean }>`
  visibility: ${p => p.visible ? "visible" : "hidden"};
  opacity: ${p => p.visible ? 1 : 0};
  height: ${p => p.visible ? '150px' : '120px'};
  width: 250px;
  background: white;
  border-radius: 6px;
  position: absolute;
  top: 45px;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: 15px 25px;
  transition: all 0.2s ease-in;
`

const DropdownItem = styled.a`
  display: flex;
  align-items: center;
  color: black;
  height: 50px;
  text-decoration: none;
`
