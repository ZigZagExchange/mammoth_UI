import React, { useState } from 'react';
import { getTokenIndex, formatPrice } from '../../../libs/utils';
import { tokens } from '../../../services/constants';
import TokenDropDownModal from '../../TokenDropdownModal';
import CustomButton from '../../CustomButton';
import { SwitchVerticalIcon } from '@heroicons/react/solid';
import { Circles } from 'react-loader-spinner';

const SwapPanel = ({
  userBalances,
  setSwapDetailsFrom,
  fromDetails,
  setSwapDetailsTo,
  toDetails,
  switchTransferType,
  rate,
  isTokenApproved,
  isWalletConnected,
  isLoading,
  handleApprove,
  handleSubmit,
  connectWallet
}: any) => {
  const onChangeFromToken = (token: any) => {
    let v = { amount: '', symbol: token.symbol };
    setSwapDetailsFrom(v);
  };

  const onChangeFromAmount = (e: any) => {
    const amount = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    let v = { amount: amount };
    setSwapDetailsFrom(v);
  };

  const onChangeToToken = (token: any) => {
    let v = { amount: '', symbol: token.symbol };
    setSwapDetailsTo(v);
  };

  const onChangeToAmount = (e: any) => {
    const amount = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    let v = { amount: amount };
    setSwapDetailsTo(v);
  };

  const onClickMax = () => {
    let amount =
      Math.round(
        Number(userBalances[getTokenIndex(fromDetails.symbol)]) * 10000
      ) / 10000;
    let v = { amount: amount };
    setSwapDetailsFrom(v);
  };

  return (
    <div className="mt-5">
      <div className="flex justify-between">
        <p className="font-semibold">From</p>
        <p className="text-sm">
          Balance:{' '}
          {Number(userBalances[getTokenIndex(fromDetails.symbol)])
            ? Number(userBalances[getTokenIndex(fromDetails.symbol)]).toFixed(4)
            : userBalances[getTokenIndex(fromDetails.symbol)]}{' '}
          {fromDetails.symbol}
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg bg-foreground-200 hover:ring-1 hover:ring-offset-0 hover:ring-foreground-500 ">
        <div className="flex items-center gap-2">
          <TokenDropDownModal
            tokens={tokens}
            userBalances={userBalances}
            onSelectedOption={onChangeFromToken}
            selectedOption={fromDetails}
            label={'Select a token'}
          />
          <button
            className="bg-[#07071C] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800 disabled:bg-slate-800 "
            onClick={onClickMax}
            disabled={!isWalletConnected}
          >
            Max
          </button>
        </div>
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent border-none w-36 md:w-64 focus:outline-none"
          placeholder="0.00"
          onChange={onChangeFromAmount}
          value={fromDetails.amount}
        />
      </div>
      <div className="relative h-px mx-2 my-12 bg-foreground-400">
        <button
          className="absolute inset-x-0 w-10 h-10 mx-auto -mt-5 rounded-full shadow-xl bg-gradient-to-r from-primary-900 to-secondary-900 hover:brightness-105"
          onClick={switchTransferType}
        >
          <SwitchVerticalIcon className="absolute inset-x-0 mx-auto -mt-3.5 w-7 hover:opacity-80 text-white origin-center hover:rotate-180 transition-all duration-300 ease-in-out" />
        </button>
      </div>
      <div className="flex justify-between">
        <div className="flex gap-7">
          <p className="font-semibold">To</p>
          <p>
            1 {fromDetails.symbol} = {rate} {toDetails.symbol}
          </p>
        </div>
        <p className="text-sm">
          Balance:{' '}
          {Number(userBalances[getTokenIndex(toDetails.symbol)])
            ? Number(userBalances[getTokenIndex(toDetails.symbol)]).toFixed(4)
            : userBalances[getTokenIndex(toDetails.symbol)]}{' '}
          {toDetails.symbol}
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg bg-foreground-200 hover:ring-1 hover:ring-offset-0 hover:ring-foreground-500 ">
        <div className="flex items-center gap-2">
          <TokenDropDownModal
            tokens={tokens}
            userBalances={userBalances}
            onSelectedOption={onChangeToToken}
            selectedOption={toDetails}
            label={'Select a token'}
            showMax={false}
          />
        </div>
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent border-none w-36 md:w-64 focus:outline-none"
          placeholder="0.00"
          onChange={onChangeToAmount}
          value={toDetails.amount}
        />
      </div>

      <div className="" style={{ marginTop: '30px' }}>
        {!isTokenApproved && isWalletConnected && (
          <CustomButton
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold uppercase rounded-md"
            disabled={!fromDetails.amount}
            onClick={handleApprove}
          >
            {isLoading ? (
              <Circles color="#FFF" height={22} width={22} />
            ) : (
              'Approve'
            )}
          </CustomButton>
        )}
        {isTokenApproved && isWalletConnected && (
          <CustomButton
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold uppercase rounded-md"
            disabled={!fromDetails.amount}
            onClick={handleSubmit}
          >
            {isLoading ? (
              <Circles color="#FFF" height={22} width={22} />
            ) : (
              'Swap'
            )}
          </CustomButton>
        )}
        {!isWalletConnected && (
          <CustomButton
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold uppercase rounded-md"
            loading={isLoading}
            onClick={connectWallet}
          >
            {isLoading ? (
              <Circles color="#FFF" height={22} width={22} />
            ) : (
              'Connect Wallet'
            )}
          </CustomButton>
        )}
      </div>
    </div>
  );
};

export default SwapPanel;
