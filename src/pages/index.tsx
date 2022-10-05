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
  const [fromDetails, setFromDetails] = useState(() => ({
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

  const TabData = () => {
    if (openTab === 1) {
      return (
        <div>
          <div className="swap_box_top">
            <div className="swap_coin_title">
              <Box fontSize="16px" fontWeight="600">
                From
              </Box>
              <Box fontSize="12px" fontWeight="400">
                Balance:{' '}
                {Number(userBalances[getTokenIndex(fromDetails.symbol)])
                  ? Number(
                      userBalances[getTokenIndex(fromDetails.symbol)]
                    ).toFixed(4)
                  : userBalances[getTokenIndex(fromDetails.symbol)]}{' '}
                {fromDetails.symbol}
              </Box>
            </div>
            <SwapSwapInput
              balances={userBalances}
              // currencies={currencies}
              value={fromDetails}
              onChange={setSwapDetailsFrom}
              imageSource={tokens[getTokenIndex(fromDetails.symbol)].logo}
              imageSymbol={tokens[getTokenIndex(fromDetails.symbol)].symbol}
              imageLogo={tokens[getTokenIndex(fromDetails.symbol)].logo}
            />
            {/* <Box mt="10px" color="rgba(255, 255, 255, 0.72)" fontSize="11px" textAlign="right">Estimated value: ~$ 30.33</Box> */}
          </div>

          <div className="swap_box_bottom">
            <div className="swap_box_swap_wrapper">
              <SwapButton onClick={switchTransferType} />
              <div className="swap_box_line" />
            </div>

            <div className="swap_coin_title" style={{ marginBottom: '10px' }}>
              <Box fontSize="16px" fontWeight="600" mr="30px">
                To
              </Box>
              <Box
                display="flex"
                width={isMobile === 'sm' ? 'auto' : '100%'}
                justifyContent="space-between"
                flexDirection={isMobile === 'sm' ? 'column' : 'row'}
              >
                <Box fontSize="12px" fontWeight="400">
                  1 {fromDetails.symbol} = {rate} {toDetails.symbol}
                </Box>
                <Box fontSize="12px" fontWeight="400">
                  Balance:{' '}
                  {Number(userBalances[getTokenIndex(toDetails.symbol)])
                    ? Number(
                        userBalances[getTokenIndex(toDetails.symbol)]
                      ).toFixed(4)
                    : userBalances[getTokenIndex(toDetails.symbol)]}{' '}
                  {toDetails.symbol}
                </Box>
              </Box>
            </div>
            <SwapSwapInput
              balances={userBalances}
              // currencies={currencies}
              value={toDetails} // format to details amount
              onChange={setSwapDetailsTo}
              showMax={false}
              imageSource={tokens[getTokenIndex(toDetails.symbol)].logo}
              imageSymbol={tokens[getTokenIndex(toDetails.symbol)].symbol}
              imageLogo={tokens[getTokenIndex(toDetails.symbol)].logo}
            />
            <div className="swap_button" style={{ marginTop: '30px' }}>
              {!isTokenApproved && isWalletConnected() && (
                <Button
                  loading={isLoading}
                  className={cx('bg_btn', {
                    zig_disabled: !fromDetails.amount
                  })}
                  style={{ height: '40px', fontSize: '18px' }}
                  text="Approve"
                  // icon={<MdSwapCalls />}
                  onClick={() => handleApprove()}
                />
              )}
              {isTokenApproved && isWalletConnected() && (
                <Button
                  loading={isLoading}
                  className={cx('bg_btn', {
                    zig_disabled: !fromDetails.amount
                  })}
                  text="Swap"
                  // icon={<MdSwapCalls />}
                  onClick={() => handleSubmit()}
                />
              )}
              {!isWalletConnected() && (
                <Button
                  loading={isLoading}
                  className={cx('bg_btn', {
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
      );
    } else if (openTab === 2) {
      return (
        <DepositComponent
          balance={userBalances}
          allowance={tokenAllowances}
          onEvent={onEvent}
        />
      );
    } else if (openTab === 3) {
      return <WithdrawComponent onEvent={onEvent} />;
    } else {
      return <div></div>;
    }
  };

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

  const getString2Number = (amount: string) => {
    return Number.isNaN(amount) ? 0 : Number(amount);
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
    console.log(values);
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
      <div className="mx-6 space-y-6 lg:space-y-0 lg:gap-4 lg:grid xl:grid-cols-4 lg:grid-cols-3 2xl:mx-24 xl:mx-8 lg:mx-2 md:mx-6">
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
        <div className="xl:col-span-1 xl:grid-cols-1 xl:space-y-0 md:grid md:grid-cols-2 md:col-span-3 md:gap-5">
          <div>
            <PoolTokenBalance className="" userBalances={userBalances} />
          </div>
          <div>
            <MyPoolBalance className="" poolbalances={poolbalances} />
          </div>
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
