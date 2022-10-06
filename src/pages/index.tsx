import React, { useCallback, useEffect, useState } from 'react';
import {
  approveToken,
  swapPool,
  getSwapAmount,
  getAllowances,
  getPoolBalances,
  getUserBalances,
  getLiquidityBalances
} from '../services/pool.service';
import Header from '../components/Header';
import BalanceReportContainer from '../components/BalanceReportContainer';
import { tokens } from '../services/constants';
import { Button } from '../components/Button/Button';
import cx from 'classnames';
import { SwapButton } from '../components/SwapButton';
import SwapSwapInput from '../components/SwapComponent/SwapSwapInput';
import ProportioanlSwapInput from '../components/SwapComponent/ProportionalSwap';
import { Box } from '@mui/material';
import MintDialogComponent from '../components/MintDialogComponent';
import _ from 'lodash';
import WithdrawComponent from '../components/WithdrawComponent';
import DepositComponent from '../components/DepositComponent';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getStarknet } from 'get-starknet';
import styled from '@emotion/styled';
import {
  disconnectWallet,
  getExplorerBaseUrl,
  isWalletConnected
} from '../services/wallet.service';
import { getTokenIndex, formatPrice } from '../libs/utils';
import { NextComponentType, NextPage } from 'next/types';
import { ethers } from 'ethers';
import TabContainer from '../components/TabContainer';
import PoolTokenBalance from '../components/PoolTokensBalance';
import MyPoolBalance from '../components/MyPoolBalance';

const Home: NextPage = () => {
  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState('Awaiting Swap');
  const [txComplete, changeTxComplete] = useState({ status: false, tx: '' });
  const [txMessage, changeTxMsg] = useState('Swap Complete');
  const [isTokenApproved, changeTokenApproved] = useState(false);
  const [failMsg, changeFailMsg] = useState('');
  const [poolbalances, changePoolBalances] = useState(['--', '--', '--']);
  const [userBalances, changeUserBalances] = useState(['--', '--', '--']);
  const [liquidityBalance, changeLiquidityBalance] = useState('--');
  const [tokenAllowances, changeTokenAllowances] = useState(['--', '--', '--']);

  const [depositModal, setDepositModal] = useState(false);
  const [withdrawModal, setWithdrawModal] = useState(false);
  const [mintModal, setMintModal] = useState(false);
  const [fromDetails, setFromDetails] = useState<any>(() => ({
    amount: '',
    symbol: tokens[0].symbol
  }));

  const [toDetails, setToDetails] = useState(() => ({
    amount: '',
    symbol: tokens[1].symbol
  }));
  const [address, setAddress] = useState('');
  const [openDrop, setOpenDrop] = useState(false);
  const [isMobile, setMobile] = useState('lg');
  const [rate, setRate] = useState(0);
  const [openTab, setOpenTab] = React.useState(1);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let width;
      if (window && window.innerWidth < 480) width = 'sm';
      else if (window && window.innerWidth < 660) width = 'md';
      else width = 'lg';
      setMobile(width);
    }
  }, []);

  useEffect(() => {
    if (!isWalletConnected()) {
      setToDetails({
        amount: '',
        symbol: tokens[1].symbol
      });
      setFromDetails({
        amount: '',
        symbol: tokens[0].symbol
      });
      changeTokenAllowances(['--', '--', '--']);
      changeUserBalances(['--', '--', '--']);
      changeTokenApproved(false);
      return;
    }
    onEvent();
  }, [address]);

  const connectWallet = async () => {
    const wallet = getStarknet();
    const [address] = await wallet.enable({ showModal: true });
    setAddress(address);
    const res: string = await getLiquidityBalances();
    changeLiquidityBalance(res);
  };

  const tokenApproval = useCallback(async () => {
    if (!isWalletConnected()) return;
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
    if (!isWalletConnected()) return;
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
    if (!isWalletConnected()) return;
    (async () => {
      await tokenApproval();
      await tokenApprovalTo();
    })();
  }, [fromDetails.amount]);

  useEffect(() => {
    if (!isWalletConnected()) return;
    (async () => {
      await tokenApproval();
      await tokenApprovalTo();
    })();
  }, [toDetails.amount]);

  useEffect(() => {
    const tmp = { ...toDetails };
    tmp.amount = '';
    console.log('toDetail changes===========', tmp);
    setToDetails(tmp);
    getSwapAmount(
      getTokenIndex(fromDetails.symbol),
      getTokenIndex(toDetails.symbol),
      1
    ).then(data => {
      setRate(data);
    });
  }, [toDetails.symbol]);

  useEffect(() => {
    const tmp = { ...fromDetails };
    tmp.amount = '';
    setFromDetails(tmp);
    getSwapAmount(
      getTokenIndex(fromDetails.symbol),
      getTokenIndex(toDetails.symbol),
      1
    ).then(data => {
      setRate(data);
    });
  }, [fromDetails.symbol]);

  useEffect(() => {
    if (!txComplete.status) return;
    openErrorWindow(txMessage, 1, txComplete.tx);
  }, [txComplete]);

  useEffect(() => {
    if (failMsg.length) openErrorWindow(failMsg, 2);
  }, [failMsg]);

  useEffect(() => {
    if (!isLoading) return;
    openErrorWindow(loadingMsg, 3);
  }, [isLoading]);

  const predictSwapResult = async (amount: number) => {
    const result = await getSwapAmount(
      getTokenIndex(fromDetails.symbol),
      getTokenIndex(toDetails.symbol),
      amount
    );
    const detail2 = {
      ...toDetails,
      ...{ amount: `${result}` }
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
      ...{ amount: `${result}` }
    };
    setFromDetails(detail2);
  };

  const handleSubmit = async () => {
    if (
      Number(toDetails.amount) === 0 ||
      Number(fromDetails.amount) === 0 ||
      isNaN(Number(toDetails.amount)) ||
      isNaN(Number(fromDetails.amount))
    )
      return;
    changeIsLoading(true);
    changeLoadingMsg(
      `Swapping ${tokens[getTokenIndex(fromDetails.symbol)].symbol} for ${
        tokens[getTokenIndex(toDetails.symbol)].symbol
      }`
    );
    changeTxMsg(
      `Swap ${tokens[getTokenIndex(fromDetails.symbol)].symbol} for ${
        tokens[getTokenIndex(toDetails.symbol)].symbol
      } success`
    );
    let success = true;
    let tx = '';
    try {
      tx = await swapPool(
        getString2Number(fromDetails.amount),
        getTokenIndex(toDetails.symbol),
        getTokenIndex(fromDetails.symbol)
      );
    } catch (e) {
      console.log(e);
      success = false;
      changeFailMsg('Swap failed');
    } finally {
      onEvent();
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete({ status: true, tx: tx });
    }
  };

  const getString2Number = (amount: any) => {
    return amount === '' ? 0 : Number(amount);
  };

  const handleApprove = async () => {
    changeIsLoading(true);
    changeLoadingMsg(
      `Approving ${tokens[getTokenIndex(fromDetails.symbol)].symbol}`
    );

    let success = true;
    let tx = '';
    try {
      tx = await approveToken(
        getTokenIndex(fromDetails.symbol),
        Number(fromDetails.amount) * 1.05
      );
    } catch (e) {
      success = false;
      changeFailMsg('Approval failed');
    } finally {
      onEvent();
    }
    changeIsLoading(false);
    if (success) {
      changeTxMsg(
        `${tokens[getTokenIndex(fromDetails.symbol)].symbol} approved`
      );
      changeTxComplete({ status: true, tx: tx });
    }
  };

  const switchTransferType = (e: any) => {
    const tmp = { ...toDetails };
    tmp.amount = Number(tmp.amount).toFixed(4);
    setFromDetails(tmp);
    const value = { amount: '' };
    setToDetails({ ...fromDetails, ...value });
  };

  const setSwapDetailsFrom = async (values: {
    amount: string;
    symbol: string;
  }) => {
    const details = {
      ...fromDetails,
      ...values
    };
    if (!values.symbol) {
      predictSwapResult(getString2Number(details.amount));
    } else {
      await predictSwapResult(0);
    }
    setFromDetails(details);
    if (details.symbol === toDetails.symbol) {
      console.log('onChange event ==========', details);
      setToDetails({ ...fromDetails, ...{ amount: '' } });
    }
  };

  const setSwapDetailsTo = async (values: {
    amount: string;
    symbol: string;
  }) => {
    const detail2 = {
      ...toDetails,
      ...values
    };
    if (!values.symbol) {
      predictSwapResultTo(getString2Number(detail2.amount));
    } else {
      await predictSwapResultTo(0);
    }
    setToDetails(detail2);
    if (detail2.symbol === fromDetails.symbol) {
      setFromDetails({ ...toDetails, ...{ amount: '' } });
    }
  };

  const openErrorWindow = (value: string, flag: number, tx = '') => {
    if (toast.isActive(flag)) return;
    if (flag === 3) {
      toast.info(value, {
        closeOnClick: false,
        autoClose: 15000,
        position: toast.POSITION.BOTTOM_RIGHT,
        toastId: flag
      });
    }
    if (flag === 2) {
      toast.error(value, {
        closeOnClick: false,
        autoClose: 15000,
        position: toast.POSITION.BOTTOM_RIGHT,
        toastId: flag
      });
    }
    if (flag === 1) {
      toast.success(
        <Box display="flex" p="20px" flexDirection="column">
          <Box mb="5px">{value}</Box>
          <Box
            component="a"
            href={`https://goerli.voyager.online/tx/${tx}`}
            target="_blank"
            fontSize="12px"
            width="100%"
            textAlign="right"
          >
            view TX
          </Box>
        </Box>,
        {
          closeOnClick: false,
          autoClose: 15000,
          position: toast.POSITION.BOTTOM_RIGHT,
          toastId: flag
        }
      );
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address || '');
  };

  const onEvent = async () => {
    console.log('onEvent');

    const [_poolBalance, _userBalance, _tokenAlowance] = await Promise.all([
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
  };

  const disconnect = () => {
    disconnectWallet();
    setAddress('');
  };
  return (
    <div
      onClick={() => {
        setOpenDrop(false);
      }}
    >
      <Header
        onClickConnectWallet={connectWallet}
        onClickCopyAddress={copyAddress}
        onClickDisconnect={disconnect}
        connected={isWalletConnected()}
        address={address}
        link={`${getExplorerBaseUrl()}/contract/${address}`}
      />
      <div className="mx-6 mt-12 space-y-6 lg:space-y-0 lg:gap-4 lg:grid xl:grid-cols-4 lg:grid-cols-3 2xl:mx-48 xl:mx-8 lg:mx-2 md:mx-6">
        <div className="md:col-span-1">
          <BalanceReportContainer
            className=""
            poolbalances={poolbalances}
            liquidityBalance={liquidityBalance}
          />
        </div>
        <div className="lg:col-span-2 ">
          <TabContainer
            onEvent={onEvent}
            userBalances={userBalances}
            setSwapDetailsFrom={setSwapDetailsFrom}
            fromDetails={fromDetails}
            setSwapDetailsTo={setSwapDetailsTo}
            toDetails={toDetails}
            switchTransferType={switchTransferType}
            rate={rate}
            isTokenApproved={isTokenApproved}
            isWalletConnected={isWalletConnected()}
            isLoading={isLoading}
            handleApprove={handleApprove}
            handleSubmit={handleSubmit}
            connectWallet={connectWallet}
            tokenAllowances={tokenAllowances}
          />
        </div>
        <div className="space-y-6 xl:col-span-1 xl:grid-cols-1 md:space-y-0 md:grid md:grid-cols-2 md:col-span-3 md:gap-5 h-fit">
          <div>
            <PoolTokenBalance className="" userBalances={userBalances} />
          </div>
          {isWalletConnected() && (
            <div>
              <MyPoolBalance className="" poolbalances={poolbalances} />
            </div>
          )}
        </div>
      </div>
      <div>
        <MintDialogComponent
          open={mintModal}
          onClose={() => {
            setMintModal(false);
          }}
          onEvent={onEvent}
        />
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;
