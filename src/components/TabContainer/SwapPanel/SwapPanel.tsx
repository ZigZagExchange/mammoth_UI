import React, { useState } from 'react';
import { ethers } from 'ethers';
import {
  approveToken,
  swapPool,
  getSwapAmount,
  getAllowances,
  getPoolBalances,
  getUserBalances,
  getLiquidityBalances
} from '../../../services/pool.service';
import { getTokenIndex, formatPrice } from '../../../libs/utils';
import { tokens } from '../../../services/constants';
import TokenDropDownModal from '../../TokenDropdownModal';

import {
  SwitchVerticalIcon,
  SwitchHorizontalIcon
} from '@heroicons/react/solid';

const SwapPanel = ({ userBalances }: any) => {
  const [sellToken, setSellToken] = useState(tokens[0]);
  const [fromAmounts, setFromAmounts] = useState();

  const onChangeFromAmounts = (e: any) => {
    const amount = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    setFromAmounts(amount);
  };

  return (
    <div className="mt-5">
      <div className="flex justify-between">
        <p className="font-semibold">From</p>
        <p className="text-sm">
          Balance:{' '}
          {Number(userBalances[getTokenIndex(sellToken.symbol)])
            ? Number(userBalances[getTokenIndex(sellToken.symbol)]).toFixed(4)
            : userBalances[getTokenIndex(sellToken.symbol)]}{' '}
          {sellToken.symbol}
        </p>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg bg-foreground-200 hover:ring-1 hover:ring-offset-0 hover:ring-foreground-500 ">
        <div className="flex items-center gap-2">
          <TokenDropDownModal
            tokens={tokens}
            userBalances={userBalances}
            onSelectedOption={setSellToken}
            selectedOption={sellToken}
            label={'Select a token'}
          />
          <button
            className="bg-[#07071C] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800 "
            // onClick={onClickMax}
          >
            Max
          </button>
        </div>
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent border-none w-36 md:w-64 focus:outline-none"
          placeholder="0.00"
          onChange={onChangeFromAmounts}
          value={fromAmounts}
        />
      </div>
      <div className="relative h-px mx-2 my-12 bg-foreground-400">
        <button
          className="absolute inset-x-0 w-10 h-10 mx-auto -mt-5 rounded-full shadow-xl bg-gradient-to-r from-primary-900 to-secondary-900 hover:brightness-105"
          //   onClick={onSwitchTokenBtn}
        >
          <SwitchVerticalIcon className="absolute inset-x-0 mx-auto -mt-3.5 w-7 hover:opacity-80 text-white origin-center hover:rotate-180 transition-all duration-300 ease-in-out" />
        </button>
      </div>
      <div className="flex items-center justify-between px-3 py-2 mt-3 rounded-lg bg-foreground-200 hover:ring-1 hover:ring-offset-0 hover:ring-foreground-500 ">
        <div className="flex items-center gap-2">
          <TokenDropDownModal
            tickers={tokens}
            onSelectedOption={setSellToken}
            selectedOption={sellToken}
            label={'Select a token'}
          />
          <button
            className="bg-[#07071C] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800 "
            // onClick={onClickMax}
          >
            Max
          </button>
        </div>
        <input
          className="ml-3 text-2xl font-semibold text-right bg-transparent border-none w-36 md:w-64 focus:outline-none"
          placeholder="0.00"
          onChange={onChangeFromAmounts}
          value={fromAmounts}
        />
      </div>
    </div>
  );
};

export default SwapPanel;
