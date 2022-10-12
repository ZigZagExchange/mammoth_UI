import React, { useState, useEffect } from 'react';

import _ from 'lodash';
import { tokens } from '../../../services/constants';
import TokenDropdown from './TokenDropdown';
import InfoPopover from './InfoPopover';
import AmountSlider from '../../AmountSlider';
import PreviewModal from './PreviewModal';

import { IoMdSettings } from 'react-icons/io';
import { toast } from 'react-toastify';

import {
  getWithdrawERC20Amount,
  withdrawPool,
  getLiquidityBalances
} from '../../../services/pool.service';

const WithdrawPanel = ({ onEvent, isWalletConnected, balance }: any) => {
  // const [coin, setCoin] = useState(AllTokens());
  const [noShow, setNoShow] = useState('none');
  const [tokenList, setTokenList] = useState<any>();
  const [coinStage, setCoinStage] = useState<any>();
  const [value, setValue] = useState<number | string | Array<number | string>>(
    0
  );

  const [withdrawAmount, changeWithdrawAmount] = useState(0);
  const [ERC20Amount, changeERC20Amount] = useState({
    0: '0'
  } as any);
  const [tokenIndex, changeIndex] = useState(0);
  const [isLoading, changeIsLoading] = useState(false);
  const [txComplete, changeTxComplete] = useState(false);
  const [failMsg, changeFailMsg] = useState('');
  const [withdrawDetails, _setWithdrawDetails] = useState(() => ({
    amount: 0,
    symbol: tokens[0].symbol
  }));
  const [liquidityBalance, changeLiquidityBalance] = useState('0');

  useEffect(() => {
    let allToken = {
      name: 'All tokens',
      symbol: 'All tokens',
      logo: '',
      proportionalMode: true
    };
    setTokenList([allToken, ...tokens]);
    setCoinStage(allToken);
  }, [tokens]);

  const AllTokenImage = () => {
    return (
      <div className="flex -space-x-2">
        {tokens.map((token, index) => {
          return (
            <div key={index} className="">
              <img
                src={token.logo}
                alt={token.symbol}
                className="w-7 h-7 max-w-fit"
              />
            </div>
          );
        })}
      </div>
    );
  };

  const handleSliderChange = (newValue: any) => {
    setValue(newValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    setValue(Number(amount));
  };

  const changeTokenSelection = (value: any) => {
    setCoinStage(value);
    let values = { amount: 0 };

    const details = {
      ...withdrawDetails,
      ...values
    };
    _setWithdrawDetails(details);
    changeWithdrawAmount(0);
  };

  React.useEffect(() => {
    (async () => {
      const val = await getLiquidityBalances();
      changeLiquidityBalance(val);
    })();
  });

  React.useEffect(() => {
    if (!txComplete) return;
    openErrorWindow('Withdraw Completed', 1);
  }, [txComplete]);

  React.useEffect(() => {
    if (failMsg.length) openErrorWindow(failMsg, 2);
  }, [failMsg]);

  React.useEffect(() => {
    if (!isLoading) return;
    openErrorWindow('Withdrawing...', 3);
  }, [isLoading]);

  const openErrorWindow = (value: string, flag: number) => {
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
      toast.success(value, {
        closeOnClick: false,
        autoClose: 15000,
        position: toast.POSITION.BOTTOM_RIGHT,
        toastId: flag
      });
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) return;
    changeIsLoading(true);
    let success = true;
    try {
      await withdrawPool(withdrawAmount, tokenIndex);
    } catch (e) {
      success = false;
      changeFailMsg('Withdraw failed');
    } finally {
      const val = await getLiquidityBalances();
      changeLiquidityBalance(val);
      let val2: any = withdrawDetails.amount as any;
      if (typeof val2 === 'string') {
        val2 = parseFloat(val.replace(',', '.'));
      }
      await predictWithdrawResult(val2);
      onEvent();
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const predictWithdrawResult = async (amount: number) => {
    const result = await getWithdrawERC20Amount(tokenIndex, amount);
    const oldERC20: any = ERC20Amount;
    oldERC20[amount] = result;
    changeERC20Amount(oldERC20);
  };

  const setWithdrawDetails = async (e: any) => {
    const amount = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    let values = { amount: amount };

    const details = {
      ...withdrawDetails,
      ...values
    };
    _setWithdrawDetails(details);

    let val = details.amount;

    if (typeof val === 'string') {
      val = parseFloat(val.replace(',', '.'));
    }
    val = Number.isNaN(val) ? 0 : val;
    const index = _.findIndex(tokens, { symbol: details.symbol });
    changeIndex(index);
    changeWithdrawAmount(val);
    await predictWithdrawResult(val);
  };

  // const onClickMax = (tokenIndex: any) => {
  //   let amount = Math.round(Number(balance[tokenIndex]) * 10000) / 10000;
  //   let values = { amount: String(amount) };
  //   const details = {
  //     ...withdrawDetails[tokenIndex],
  //     ...values
  //   };

  //   switch (tokenIndex) {
  //     case 0:
  //       setTokenDetails([details, tokenDetails[1], tokenDetails[2]]);
  //       break;
  //     case 1:
  //       setTokenDetails([tokenDetails[0], details, tokenDetails[2]]);
  //       break;
  //     case 2:
  //       setTokenDetails([tokenDetails[0], tokenDetails[1], details]);
  //       break;
  //   }
  // };

  return (
    <div>
      <div className="flex items-center justify-end gap-3">
        <InfoPopover />
        <IoMdSettings className="w-6 h-6" />
      </div>
      <div className="flex items-center justify-between mt-4">
        <TokenDropdown
          selectedToken={coinStage}
          onSelectedToken={changeTokenSelection}
          allTokenImage={AllTokenImage}
          tokenList={tokenList}
        />
        <p className="text-3xl font-medium">00.00</p>
      </div>
      <div className="mt-5">
        {coinStage?.proportionalMode && (
          <AmountSlider
            value={typeof value === 'number' ? value : 0}
            onChangeValue={handleSliderChange}
            onChangeInputValue={handleInputChange}
            label="Proportional Withdraw"
          />
        )}
      </div>
      {coinStage?.proportionalMode && (
        <div className="-mt-5">
          {tokens.map((token, index) => {
            return (
              <div
                className="flex items-center justify-between space-y-4"
                key={index}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    className="w-10 h-10"
                  />
                  <p className="text-lg font-poppins">{token.symbol}</p>
                </div>
                <div>
                  <p className="text-2xl font-medium font-poppins">00.00</p>
                  <p className="text-base font-normal text-right font-poppins">
                    $00.00
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {!coinStage?.proportionalMode && (
        <div className="mt-8 border-t border-foreground-500">
          <div className="flex items-center justify-between px-3 py-2 mt-8 rounded-lg bg-foreground-200 ring-1 ring-offset-0 ring-foreground-500">
            <div className="flex items-center gap-2">
              <div className="flex items-center p-2 text-sm font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ">
                <img
                  src={coinStage?.logo}
                  alt={coinStage?.symbol}
                  className="w-7"
                />
                <p className="ml-3 text-lg ">{coinStage?.symbol}</p>
              </div>
              {/* <button
              className="bg-[#07071C] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800 disabled:bg-slate-800 "
              onClick={() => onClickMax(index)}
              disabled={!isWalletConnected}
            >
              Max
            </button> */}
            </div>
            <input
              className="ml-3 text-2xl font-semibold text-right bg-transparent border-none w-36 md:w-72 focus:outline-none read-only:bg-transparent"
              placeholder="0.00"
              onChange={e => setWithdrawDetails(e)}
              value={withdrawAmount}
            />
          </div>
        </div>
      )}
      <PreviewModal
        tokenDetails={withdrawDetails}
        handleWithdraw={handleWithdraw}
      />
    </div>
  );
};

export default WithdrawPanel;
