import React, { useCallback, useEffect, useState } from "react";
import {
  approveToken,
  swapPool,
  getSwapAmount,
  getAllowances,
  getPoolBalances,
  getUserBalances,
  getLiquidityBalances
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
import { getTokenIndex, formatPrice} from "../libs/utils";
import { NextPage } from "next/types";
import { ethers } from "ethers";

const Home: NextPage = () => {
  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState("Awaiting Swap");
  const [txComplete, changeTxComplete] = useState({status:false, tx: ""});
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
  const [openDrop, setOpenDrop] = useState(false);
  const [isMobile, setMobile] = useState("lg")

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let width;
      if(window && window.innerWidth < 480) width= "sm"
      else if(window && window.innerWidth < 660) width = "md"
      else width = "lg"
      setMobile(width);
    }
  }, [])

  useEffect(() => {
    if(!isWalletConnected()) {
      setToDetails({
        amount: "",
        symbol: tokens[1].symbol,
      })
      setFromDetails({
        amount: "",
        symbol: tokens[0].symbol,
      })
      changeTokenAllowances(["--","--","--"]);
      changeUserBalances(["--","--","--"]);
      changeTokenApproved(false);
      return;
    }
    onEvent();    
  }, [address]);

  const connectWallet = async () => {
    const wallet = getStarknet();
    const [address] = await wallet.enable({showModal: true});
    setAddress(address);
    const res: string = await getLiquidityBalances();
    changeLiquidityBalance(res);
  };

  const tokenApproval = useCallback(async () => {
    if(!isWalletConnected()) return;
    const i = getTokenIndex(fromDetails.symbol);
    const allowanceString = tokenAllowances[i];
    if (allowanceString === '--' || allowanceString === '') {
      changeTokenApproved(false);
      return;
    }
    const allowanceBN = ethers.BigNumber.from(allowanceString.split('.')[0]); // full number part
    const maxInt = ethers.BigNumber.from(Number.MAX_SAFE_INTEGER - 1); // MAX_SAFE_INTEGER - 1 because we use floor for allowanceBN
    // allowance might be grater the the MAX_SAFE_INTEGER range
    if (allowanceBN.gt(maxInt)) {
      changeTokenApproved(true);
      return;
    }
    changeTokenApproved(Number(allowanceString) > Number(fromDetails.amount));
  }, [fromDetails]);

  const tokenApprovalTo = useCallback(async () => {
    if(!isWalletConnected()) return;
    const i = getTokenIndex(toDetails.symbol);
    const allowanceString = tokenAllowances[i];
    if (allowanceString === '--' || allowanceString === '') {
      changeTokenApproved(false);
      return;
    }
    const allowanceBN = ethers.BigNumber.from(allowanceString.split('.')[0]); // full number part
    const maxInt = ethers.BigNumber.from(Number.MAX_SAFE_INTEGER - 1); // MAX_SAFE_INTEGER - 1 because we use floor for allowanceBN
    // allowance might be grater the the MAX_SAFE_INTEGER range
    if (allowanceBN.gt(maxInt)) {
      changeTokenApproved(true);
      return;
    }
    changeTokenApproved(Number(allowanceString) > Number(toDetails.amount));
  }, [toDetails]);

  useEffect(() => {
    if(!isWalletConnected()) return;
    (async () => {
      await tokenApproval();
      await tokenApprovalTo();
    })();
  }, [fromDetails.amount])

  useEffect(() => {
    if(!isWalletConnected()) return;
    (async () => {
      await tokenApproval();
      await tokenApprovalTo();
    })();
  }, [toDetails.amount])

  useEffect(()=>{
    const tmp = {...toDetails}
    tmp.amount = "";
    console.log("toDetail changes===========",tmp)
    setToDetails(tmp)
  }, [toDetails.symbol])

  useEffect(()=>{
    const tmp = {...fromDetails}
    tmp.amount = "";
    setFromDetails(tmp)
  }, [fromDetails.symbol])

  useEffect(() => {
    if (!txComplete.status) return;
    openErrorWindow(txMessage, 1, txComplete.tx)
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
    const detail2 = {
      ...toDetails,
      ...{ amount: `${result}` },
    };
    setToDetails(detail2);
  };

  const predictSwapResultTo = async (amount: number) => {
    const result = await getSwapAmount(
      getTokenIndex(fromDetails.symbol),
      getTokenIndex(toDetails.symbol),
      amount,
      true
    );
    const detail2 = {
      ...fromDetails,
      ...{ amount: `${result}` },
    };
    setFromDetails(detail2);
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
    let tx = ""
    try {
      tx = await swapPool(
        getString2Number(fromDetails.amount),
        getTokenIndex(toDetails.symbol),
        getTokenIndex(fromDetails.symbol)
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
      changeTxComplete({status: true, tx : tx});
    }
  };

  const getString2Number = (amount: string) => {
    return Number.isNaN(amount) ? 0 : Number(amount)
  }

  const handleApprove = async () => {

    changeIsLoading(true);
    changeLoadingMsg(`Approving ${tokens[getTokenIndex(fromDetails.symbol)].symbol}`);
    
    let success = true;
    let tx = "";
    try {
      tx = await approveToken(
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
      changeTxMsg(`${tokens[getTokenIndex(fromDetails.symbol)].symbol} approved`);
      changeTxComplete({status: true, tx : tx});
    }
  };

  const switchTransferType = (e: any) => {
    const tmp = {...toDetails}
    tmp.amount = Number(tmp.amount).toFixed(4)
    setFromDetails(tmp);
    const value = { amount: "" };
    setToDetails({ ...fromDetails, ...value })
  }

  const setSwapDetailsFrom = async (values: {amount: string, symbol: string}) => {
    const details = {
      ...fromDetails,
      ...values,
    };
    if(!values.symbol) {
      predictSwapResult(getString2Number(details.amount));
    } else {
      await predictSwapResult(0)
    }
    setFromDetails(details);
    if (details.symbol === toDetails.symbol) {
      console.log("onChange event ==========", details)
      setToDetails({ ...fromDetails, ...{ amount: '' } });
    }
    
  }

  const setSwapDetailsTo = async (values: {amount: string, symbol: string}) => {
    const detail2 = {
      ...toDetails,
      ...values,
    };
    if(!values.symbol) {
      predictSwapResultTo(getString2Number(detail2.amount));
    } else {
      await predictSwapResultTo(0);
    }
    setToDetails(detail2);
    if (detail2.symbol === fromDetails.symbol) {
      setFromDetails({ ...toDetails, ...{ amount: '' } });
    }
  }

  const openErrorWindow = (value: string, flag: number, tx = "") => {
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
        <Box display="flex" p="20px" flexDirection="column">
          <Box mb="5px">{value}</Box>
          <Box component="a" href={`https://goerli.voyager.online/tx/${tx}`} target="_blank" fontSize="12px" width="100%" textAlign="right">view TX</Box>
        </Box>,
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
    await predictSwapResultTo(getString2Number(toDetails.amount));
    await tokenApproval();
    await tokenApprovalTo();
  }

  const disconnect = () => {
    disconnectWallet();
    setAddress("")
  }
console.log(isMobile)
  return (
    <Box onClick={() => { setOpenDrop(false); }}>
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
        <Box display="flex" maxWidth={'90%'} width="590px" justifyContent={'center'} alignItems="center" flexDirection={isMobile !== "lg" ? "column" : "row"}>
          <Box borderRadius={'8px'} border="1px solid rgba(255, 255, 255, 0.13)" width="100%" p="30px" display="flex" flexDirection={isMobile !== "sm" ? "row" : "column"} justifyContent={'space-between'} mb="30px">
            <Box display='flex' flexDirection={isMobile !== "sm" ? "column" : "row"} mr="20px">
              <Box mb="30px">Total Token amount</Box>
              <Box textAlign={'center'}>{formatPrice(liquidityBalance)}</Box>
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
          <Box ml={isMobile === "lg" ? "35px" : ''} width={isMobile !== "lg" ? "auto":"25%"} height="100%" display="flex" flexDirection={isMobile !== "lg" ? "row" : "column"} alignItems="center" justifyContent={'space-between'} mb="30px">
            <Button className="bg_btn" style={{ borderRadius: '5px', marginRight: '10px', width: '90px' }} text="MINT" onClick={() => { setMintModal(true) }} />
            <Button className="bg_btn" style={{ borderRadius: '5px', marginRight: '10px', width: '90px' }} text="Deposit" onClick={() => { setDepositModal(true) }} />
            <Button className="bg_btn" style={{ borderRadius: '5px', marginRight: '10px', width: '90px' }} text="Withdraw" onClick={() => { setWithdrawModal(true) }} />
          </Box>
        </Box>
        <div className="swap_box">
          <Box px="30px" pt="20px" fontSize="22px" fontWeight="bold" color="white">Swap</Box>
          <div className="swap_box_top">
            <div className="swap_coin_title">
              <Box fontSize="16px" fontWeight="600">From</Box>
              <Box fontSize="12px" fontWeight="400">Balance: {Number(userBalances[getTokenIndex(fromDetails.symbol)]) ? Number(userBalances[getTokenIndex(fromDetails.symbol)]).toFixed(4) : userBalances[getTokenIndex(fromDetails.symbol)]} {fromDetails.symbol}</Box>
            </div>
            <SwapSwapInput
              balances={userBalances}
              // currencies={currencies}
              value={fromDetails}
              onChange={setSwapDetailsFrom}
            />
            {/* <Box mt="10px" color="rgba(255, 255, 255, 0.72)" fontSize="11px" textAlign="right">Estimated value: ~$ 30.33</Box> */}
          </div>

          <div className="swap_box_bottom">
            <div className="swap_box_swap_wrapper">
              <SwapButton onClick={switchTransferType} />
              <div className="swap_box_line" />
            </div>

            <div className="swap_coin_title" style={{ marginBottom: '10px' }}>
              <Box fontSize="16px" fontWeight="600" mr = "30px">To</Box>
              <Box display="flex" width={isMobile === "sm" ? "auto" : "100%"} justifyContent="space-between" flexDirection={isMobile === "sm" ? "column" : "row"}>
                <Box fontSize="12px" fontWeight="400">1 {fromDetails.symbol} = {
                  (fromDetails.amount && toDetails.amount) ? formatPrice(Number(fromDetails.amount) / Number(toDetails.amount)) : 0
                } {toDetails.symbol}</Box>
                <Box fontSize="12px" fontWeight="400">Balance: {Number(userBalances[getTokenIndex(toDetails.symbol)]) ? Number(userBalances[getTokenIndex(toDetails.symbol)]).toFixed(4) : userBalances[getTokenIndex(toDetails.symbol)]} {toDetails.symbol}</Box>
              </Box>
            </div>
            <SwapSwapInput
              balances={userBalances}
              // currencies={currencies}
              value={toDetails} // format to details amount
              onChange={setSwapDetailsTo}
              showMax={false}
            />
            <div className="swap_button" style={{ marginTop: '30px' }}>
              {(!isTokenApproved) && isWalletConnected() && (
                <Button
                  loading={isLoading}
                  className={cx("bg_btn", {
                    zig_disabled:
                    !fromDetails.amount,
                  })}
                  style={{ height: '40px', fontSize: '18px' }}
                  text="Approve"
                  // icon={<MdSwapCalls />}
                  onClick={() => handleApprove()}
                />
              )}
              {(isTokenApproved) && isWalletConnected() && (
                <Button
                  loading={isLoading}
                  className={cx("bg_btn", {
                    zig_disabled:
                    !fromDetails.amount,
                  })}
                  text="Swap"
                  // icon={<MdSwapCalls />}
                  onClick={() => handleSubmit()}
                />
              )}
              {!isWalletConnected() && (
                <Button
                  loading={isLoading}
                  className={cx("bg_btn", {
                    // zig_disabled:
                    // !hasAllowance || fromDetails.amount.length === 0,
                  })}
                  text="Connect Wallet"
                  // icon={<MdSwapCalls />}
                  onClick={() => connectWallet()}
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
