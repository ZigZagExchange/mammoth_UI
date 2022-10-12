import React, { useState, useEffect } from 'react';
import { IoMdSettings } from 'react-icons/io';
import { ethers } from 'ethers';

import ModeSelection from './ModeSelection';
import CustomButton from '../../CustomButton';
import InfoPopover from './InfoPopover';
import PreviewModal from './PreviewModal';
import AmountSlider from '../../AmountSlider';
import { tokens } from '../../../services/constants';
import { formatPrice } from '../../../libs/utils';
import {
  depositPool,
  approveMultibleTokens,
  getDepositERC20Amount,
  getProportinalDepositERC20Amount,
  proportinalDepositERC20Amount
} from '../../../services/pool.service';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const modes = [
  {
    name: 'single',
    value: false
  },
  {
    name: 'proportional',
    value: true
  }
];

const DepositPanel = ({
  balance,
  allowance,
  onEvent,
  isWalletConnected
}: any) => {
  const [isTokenApproved, setTokenApproved] = useState([false, false, false]);
  const [isUnLimitApprove, setUnlimitApprove] = useState([false, false, false]);

  const [selectedMode, setSelectedMode] = useState(modes[0]);
  const [proportionalMode, setProportionalMode] = useState(false);
  const [LPAmount, setLPAmount] = useState(0);

  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState('Awaiting Deposit');
  const [txComplete, changeTxComplete] = useState(false);
  const [txMessage, changeTxMsg] = useState('Deposit Complete');
  const [failMsg, changeFailMsg] = useState('');
  const [value, setValue] = React.useState<
    number | string | Array<number | string>
  >(0);

  const [tokenDetails, setTokenDetails] = useState(() => [
    {
      amount: '',
      symbol: tokens[0].symbol
    },
    {
      amount: '',
      symbol: tokens[1].symbol
    },
    {
      amount: '',
      symbol: tokens[2].symbol
    }
  ]);

  useEffect(() => {
    if (proportionalMode) return;
    updateNormalMode();
  }, [proportionalMode, tokenDetails]);

  useEffect(() => {
    const newTokenApprove = [false, false, false];
    const newTokenUnlimitApprove = [false, false, false];

    for (let i = 0; i <= 2; i++) {
      const allowanceString = allowance[i];
      const amount = tokenDetails[i].amount;
      if (allowanceString === '--' || allowanceString === '') continue;

      const userAllownace = ethers.BigNumber.from(
        allowanceString.split('.')[0]
      ); // full number part
      const maxInt = ethers.BigNumber.from(Number.MAX_SAFE_INTEGER - 1); // MAX_SAFE_INTEGER - 1 because we use floor for userAllownace
      // userAllownace might be grater the the MAX_SAFE_INTEGER range
      if (userAllownace.gt(maxInt)) {
        newTokenApprove[i] = true;
        newTokenUnlimitApprove[i] = true;
        continue;
      }

      const minAllowance = ethers.constants.MaxUint256.div(100);
      newTokenUnlimitApprove[i] = minAllowance.lt(userAllownace);
    }
    setTokenApproved(newTokenApprove);
    setUnlimitApprove(newTokenUnlimitApprove);
  }, [tokenDetails, allowance]);

  useEffect(() => {
    if (!txComplete) return;
    openErrorWindow(txMessage, 1);
  }, [txComplete]);

  useEffect(() => {
    if (failMsg.length) openErrorWindow(failMsg, 2);
  }, [failMsg]);

  useEffect(() => {
    if (!isLoading) return;
    openErrorWindow(loadingMsg, 3);
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

  useEffect(() => {
    if (proportionalMode) return;
    updateNormalMode();
  }, [proportionalMode, tokenDetails]);

  const updateProportionalMode = async () => {
    if (!proportionalMode) return;
    const result = await getProportinalDepositERC20Amount(Number(LPAmount));

    const newTokenDetails = tokenDetails.map((details, index) => {
      details.amount = formatPrice(result[index]);
      return details;
    });
    setTokenDetails(newTokenDetails);
  };

  useEffect(() => {
    if (!proportionalMode) return;
    updateProportionalMode();
  }, [proportionalMode, LPAmount]);

  const handleSubmitNormal = async () => {
    if (proportionalMode) return;
    const depositTokensDetails = [];
    const tokenSymbols = [];
    for (let i = 0; i < 3; i++) {
      const amount = Number(tokenDetails[i].amount);
      if (amount > 0) {
        depositTokensDetails.push([i, amount]);
        tokenSymbols.push(tokens[i].symbol);
      }
    }
    if (depositTokensDetails.length === 0) return;

    changeIsLoading(true);
    changeLoadingMsg(`Depositing ${tokenSymbols}`);
    changeTxMsg(`Deposit ${tokenSymbols} success`);
    let success = true;
    try {
      await depositPool(depositTokensDetails);
    } catch (e) {
      success = false;
      changeFailMsg('Deposit failed');
    } finally {
      onEvent();
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const handleSubmitProportional = async () => {
    if (!proportionalMode) return;
    const tokenSymbols = [];
    for (let i = 0; i < 3; i++) {
      tokenSymbols.push(tokens[i].symbol);
    }

    changeIsLoading(true);
    changeLoadingMsg(`Depositing ${tokenSymbols}`);
    changeTxMsg(`Deposit ${tokenSymbols} success`);
    let success = true;
    try {
      await proportinalDepositERC20Amount(Number(LPAmount));
    } catch (e) {
      success = false;
      changeFailMsg('Deposit failed');
    } finally {
      onEvent();
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const handleApprove = async (maxApprove = false) => {
    const approveTokens = [];
    const tokenSymbols = [];
    for (let i = 0; i < 3; i++) {
      if (!isTokenApproved[i]) {
        approveTokens.push(tokens[i].address);
        tokenSymbols.push(tokens[i].symbol);
      }
    }
    if (approveTokens.length === 0) return;

    changeLoadingMsg(`Approving ${tokenSymbols}`);
    changeTxMsg(`${tokenSymbols} approved`);
    changeIsLoading(true);
    let success = true;
    try {
      await approveMultibleTokens(approveTokens);
    } catch (e) {
      success = false;
      changeFailMsg('Approval failed');
    } finally {
      onEvent();
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const changeLpAmount = (values: any) => {
    setLPAmount(values.amount);
  };

  const handleSliderChange = (newValue: any) => {
    setValue(newValue);
    setLPAmount(Number(value));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    setValue(Number(amount));
    setLPAmount(Number(amount));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };

  const updateNormalMode = async () => {
    if (proportionalMode) return;
    const result: Promise<any>[] = tokens.map(async (_, index) => {
      const amount = Number(tokenDetails[index].amount);
      return await getDepositERC20Amount(index, amount);
    });
    const lpAmounts: number[] = await Promise.all(result);
    const sum = lpAmounts.reduce((pv, cv) => pv + Number(cv), 0);
    setLPAmount(sum);
  };

  const onChangeMode = (mode: any) => {
    setSelectedMode(mode);
    setProportionalMode(mode.value);
    setTokenDetails([
      {
        amount: '',
        symbol: tokens[0].symbol
      },
      {
        amount: '',
        symbol: tokens[1].symbol
      },
      {
        amount: '',
        symbol: tokens[2].symbol
      }
    ]);
    setValue(0);
    setLPAmount(0);
  };

  const setDepositDetails = (e: any, index: any) => {
    const amount = e.target.value.replace(',', '.').replace(/[^0-9.]/g, '');
    let values = { amount: amount };
    const details = {
      ...tokenDetails[index],
      ...values
    };

    switch (index) {
      case 0:
        setTokenDetails([details, tokenDetails[1], tokenDetails[2]]);
        break;
      case 1:
        setTokenDetails([tokenDetails[0], details, tokenDetails[2]]);
        break;
      case 2:
        setTokenDetails([tokenDetails[0], tokenDetails[1], details]);
        break;
    }
  };

  const onClickMax = (tokenIndex: any) => {
    let amount = Math.round(Number(balance[tokenIndex]) * 10000) / 10000;
    let values = { amount: String(amount) };
    const details = {
      ...tokenDetails[tokenIndex],
      ...values
    };

    switch (tokenIndex) {
      case 0:
        setTokenDetails([details, tokenDetails[1], tokenDetails[2]]);
        break;
      case 1:
        setTokenDetails([tokenDetails[0], details, tokenDetails[2]]);
        break;
      case 2:
        setTokenDetails([tokenDetails[0], tokenDetails[1], details]);
        break;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <ModeSelection
          setSelected={onChangeMode}
          selected={selectedMode}
          options={modes}
        />
        <div className="flex items-center justify-end gap-3">
          <InfoPopover />
          <IoMdSettings className="w-6 h-6" />
        </div>
      </div>

      {proportionalMode && (
        <div className="flex justify-between mt-8">
          <div className="flex -space-x-2">
            {tokens.map((token, index) => {
              return (
                <div key={index} className="">
                  <img
                    src={token.logo}
                    alt={token.symbol}
                    className="w-12 h-12 max-w-fit"
                  />
                </div>
              );
            })}
          </div>
          <div className="text-right">
            <p className="text-3xl font-medium">00.00</p>
            <p className="text-base font-normal">$0.00</p>
          </div>
        </div>
      )}

      {proportionalMode && (
        <AmountSlider
          value={typeof value === 'number' ? value : 0}
          onChangeValue={handleSliderChange}
          onChangeInputValue={handleInputChange}
          label="Proportional Deposit"
        />
      )}

      {tokens.map((token, index) => {
        return (
          <div key={index} className="mt-4">
            {!proportionalMode && (
              <p className="flex justify-end text-sm">
                Balance: {formatPrice(balance[index])} {token.symbol}
              </p>
            )}
            <div className="flex items-center justify-between px-3 py-2 mt-2 rounded-lg bg-foreground-200 ring-1 ring-offset-0 ring-foreground-500 ">
              <div className="flex items-center gap-2">
                <div className="flex items-center p-2 text-sm font-medium rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 ">
                  <img src={token.logo} alt={token.symbol} className="w-7" />
                  <p className="ml-3 text-lg ">{token.symbol}</p>
                </div>
                <button
                  className="bg-[#07071C] px-2 py-1 rounded-md text-sm font-semibold text-primary-900 ml-2.5 hover:bg-slate-800 disabled:bg-slate-800 "
                  onClick={() => onClickMax(index)}
                  disabled={!isWalletConnected}
                >
                  Max
                </button>
              </div>
              <input
                className="ml-3 text-2xl font-semibold text-right bg-transparent border-none w-36 md:w-72 focus:outline-none read-only:bg-transparent"
                placeholder="0.00"
                onChange={e => setDepositDetails(e, index)}
                value={tokenDetails[index]?.amount}
                readOnly={proportionalMode}
              />
            </div>
            {proportionalMode && <p className="mt-2 text-right">$00.00</p>}
          </div>
        );
      })}

      {!proportionalMode && (
        <div className="flex flex-col items-end mt-5 text-base text-right">
          Estimated amount: {LPAmount ? LPAmount.toFixed(2) : '--'} MLP <br />
          Price impact: 0%
        </div>
      )}

      {proportionalMode && (
        <div className="py-5 mt-5 space-y-2 border-t border-foreground-500">
          <div className="flex items-center justify-between">
            <p className="font-normal text-md">Total</p>
            <p className="text-lg font-semibold">$00.00</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="font-normal text-md">Price Impact</p>
            <p className="text-lg font-semibold">0.00%</p>
          </div>
        </div>
      )}

      <div>
        {!isUnLimitApprove && (
          <CustomButton
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold uppercase rounded-md mt-5"
            disabled={!isTokenApproved}
            onClick={() => handleApprove(true)}
          >
            ApproveUnlimit
          </CustomButton>
        )}
        {!isUnLimitApprove && (
          <CustomButton
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 font-semibold uppercase rounded-md mt-5"
            disabled={!isTokenApproved}
            onClick={() => handleApprove()}
          >
            Approve
          </CustomButton>
        )}
        <PreviewModal
          isTokenApproved={isTokenApproved}
          tokenDetails={tokenDetails}
          handleSubmitNormal={handleSubmitNormal}
          handleSubmitProportional={handleSubmitProportional}
          proportionalMode={proportionalMode}
          balance={balance}
        />
      </div>
    </div>
  );
};

export default DepositPanel;
