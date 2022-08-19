import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import { Box, Slider } from '@mui/material';
import MuiInput from '@mui/material/Input';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import SettingsIcon from '@mui/icons-material/Settings';
import { tokens } from '../services/constants';
import SelectUnstyled, {
  SelectUnstyledProps,
  selectUnstyledClasses
} from '@mui/base/SelectUnstyled';
import OptionUnstyled, {
  optionUnstyledClasses
} from '@mui/base/OptionUnstyled';
import { border, styled } from '@mui/system';
import { PopperUnstyled } from '@mui/base';

import {
  depositPool,
  approveMultibleTokens,
  getDepositERC20Amount,
  getProportinalDepositERC20Amount,
  proportinalDepositERC20Amount
} from '../services/pool.service';
import ToggleButton from './Toggle/ToggleButton';

import { Button as CustomButton } from './Button/Button';
import DepositWithdrawInput from './SwapComponent/DepositWithdrawInput';
import ProportioanlSwapInput from './SwapComponent/ProportionalSwap';
import _ from 'lodash';
import cx from 'classnames';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatPrice } from '../libs/utils';
import { ethers } from 'ethers';

interface DepositDialogProps {
  balance: string[];
  allowance: string[];
  onEvent: () => void;
}

const blue = {
  100: '#DAECFF',
  200: '#99CCF3',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75'
};

const grey = {
  100: '#E7EBF0',
  200: '#E0E3E7',
  300: '#CDD2D7',
  400: '#B2BAC2',
  500: '#A0AAB4',
  600: '#6F7E8C',
  700: '#3E5060',
  800: '#2D3843',
  900: '#1A2027'
};

const Input = styled(MuiInput)`
  width: 42px;
`;

const StyledButton = styled('button')(
  ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    min-height: calc(1.5em + 22px);
    min-width: 390px;
    background: #232735;
    border: 1px solid #3C435A;
    border-radius: 5px;
    margin: 0.5em;
    padding: 10px;
    text-align: left;
    line-height: 1.5;
    color: white;
  
    &:hover {
      background: #232735;
      border-color: grey[400];
    }
  
    &.${selectUnstyledClasses.focusVisible} {
      outline: 3px solid '#232735';
    }
  
    &.${selectUnstyledClasses.expanded} {
      &::after {
        content: '▴';
      }
    }
  
    &::after {
      content: '▾';
      float: right;
    }
  
    & img {
      margin-right: 10px;
    }
    `
);

const StyledListbox = styled('ul')(
  ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    
    padding: 1px;
    margin: 0px 0;
    min-width: 410px;
    max-height: 410px;
    background: #3C435A;
    border-radius: 5px;
    color: white;
    overflow: auto;
    outline: 0px;
    `
);

export const StyledOption = styled(OptionUnstyled)(
  ({ theme }) => `
    list-style: none;
    padding: 8px;
    border-radius: 0.45em;
    cursor: default;
    display: flex;
    align-items: center;
    width: 100%;
  
    &:last-of-type {
      border-bottom: none;
    }
  
    // &.${optionUnstyledClasses.selected} {
    //   background-color: '#3C435A';
    //   color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    // }
  
    // &.${optionUnstyledClasses.highlighted} {
    //   background-color: #3C435A;
    //   color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    // }
  
    // &.${optionUnstyledClasses.highlighted}.${
    optionUnstyledClasses.selected
  } {
    //   background-color: #3C435A;
    //   color: #E0E3E7;
    // }
  
    // &.${optionUnstyledClasses.disabled} {
    //   color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
    // }
  
    // &:hover:not(.${optionUnstyledClasses.disabled}) {
    //   background-color: #3C435A;
    //   color: #E0E3E7;
    // }
  
    & img {
      margin-right: 10px;
    }
    `
);

const StyledPopper = styled(PopperUnstyled)`
  z-index: 1;
`;

export const CustomSelect = React.forwardRef(function CustomSelect(
  props: SelectUnstyledProps<number>,
  ref: any
) {
  const components: SelectUnstyledProps<number>['components'] = {
    Root: StyledButton,
    Listbox: StyledListbox,
    Popper: StyledPopper,
    ...props.components
  };

  return <SelectUnstyled {...props} ref={ref} components={components} />;
});

export const CustomInput = styled((props: any) => <input {...props} />)`
  border: none;
  height: 1.8vw;
  font-size: 1vw;
  background: #191a33;
  color: white;
  &:focus-visible {
    outline: none;
    border: none;
  }
`;

export default function DepositComponent(props: DepositDialogProps) {
  const [isTokenApproved, setTokenApproved] = useState([false, false, false]);

  const [isUnLimitApprove, setUnlimitApprove] = useState([false, false, false]);

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

  const [LPAmount, setLPAmount] = useState(0);

  const [proportionalMode, setProportionalMode] = useState(false);

  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState('Awaiting Deposit');
  const [txComplete, changeTxComplete] = useState(false);
  const [txMessage, changeTxMsg] = useState('Deposit Complete');
  const [failMsg, changeFailMsg] = useState('');
  const [open, setOpen] = React.useState(false);

  useEffect(() => {
    const newTokenApprove = [false, false, false];
    const newTokenUnlimitApprove = [false, false, false];

    for (let i = 0; i <= 2; i++) {
      const allowanceString = props.allowance[i];
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
  }, [tokenDetails, props.allowance]);

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
      props.onEvent();
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
      props.onEvent();
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
      props.onEvent();
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
    }
  };

  const setDepositDetailsOne = (values: any) => {
    const details = {
      ...tokenDetails[0],
      ...values
    };
    setTokenDetails([details, tokenDetails[1], tokenDetails[2]]);
  };

  const setDepositDetailsOTwo = (values: any) => {
    const details = {
      ...tokenDetails[1],
      ...values
    };
    setTokenDetails([tokenDetails[0], details, tokenDetails[2]]);
  };

  const setDepositDetailsThree = (values: any) => {
    const details = {
      ...tokenDetails[2],
      ...values
    };
    setTokenDetails([tokenDetails[0], tokenDetails[1], details]);
  };

  const changeLpAmount = (values: any) => {
    setLPAmount(values.amount);
  };

  const [value, setValue] = React.useState<
    number | string | Array<number | string>
  >(0);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue);
    setLPAmount(Number(value));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value === '' ? '' : Number(event.target.value));
    setLPAmount(Number(value));
  };

  const handleBlur = () => {
    if (value < 0) {
      setValue(0);
    } else if (value > 100) {
      setValue(100);
    }
  };
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value: string) => {
    setOpen(false);
  };

  return (
    <Box>
      <Box
        display="flex"
        flexDirection="column"
        px="40px"
        pb="50px"
        style={{ position: 'relative' }}
      >
        <SettingsIcon
          cursor="pointer"
          style={{ position: 'absolute', top: '5px', right: '40px' }}
        />
        <Box
          bgcolor="#181B25"
          color="#636EA8"
          mt="43px"
          mb="23px"
          p="11px 13px"
          fontFamily="Inter"
          fontWeight={700}
          fontSize="13px"
        >
          Tip: When you add liquidity, you will receive pool tokens representing
          your position. These tokens automatically earn fees proportional to
          your share of the pool, and can be redeemed at any time.
        </Box>
        {proportionalMode && (
          <div>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb="4px"
            >
              <AvatarGroup>
                {tokens.map((c, i) => (
                  <Avatar
                    style={{ width: '25px', height: '25px' }}
                    src={c.logo}
                    alt=""
                    key={c.symbol}
                  />
                ))}
              </AvatarGroup>
              <Box fontSize="22px">00</Box>
            </Box>
            <Box mt="0px" mb="30px" textAlign="right">
              $00.00
            </Box>

            <Box display="flex" justifyContent="space-between">
              <Box>Proportional Deposit</Box>
              <Box display="flex">
                <Input
                  value={value}
                  size="small"
                  style={{
                    color: 'white'
                  }}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  inputProps={{
                    step: 1,
                    min: 0,
                    max: 100,
                    type: 'number',
                    'aria-labelledby': 'input-slider'
                  }}
                />
                <Box>%</Box>
              </Box>
            </Box>

            <Slider
              value={typeof value === 'number' ? value : 0}
              onChange={handleSliderChange}
              aria-labelledby="input-slider"
            />
          </div>
        )}

        {!proportionalMode && (
          <div>
            <Box
              textAlign={'right'}
              mt="20px"
              mb="4px"
              color="rgb(256,256,256,0.5)"
              fontSize="14px"
            >
              Balance: {formatPrice(props.balance[0])} {tokenDetails[0].symbol}
            </Box>
          </div>
        )}

        <DepositWithdrawInput
          balances={props.balance}
          value={tokenDetails[0]}
          onChange={setDepositDetailsOne}
          borderBox
          listWidth={505}
          readOnly={proportionalMode}
          imageSource={tokens[0].logo}
          imageSymbol={tokens[0].symbol}
          imageLogo={tokens[0].logo}
        />
        {proportionalMode && (
          <Box
            textAlign={'right'}
            mt="4px"
            mb="20px"
            color="rgb(256,256,256,0.5)"
            fontSize="14px"
          >
            $00.00
          </Box>
        )}
        {!proportionalMode && (
          <div>
            <Box
              textAlign={'right'}
              mt="20px"
              mb="4px"
              color="rgb(256,256,256,0.5)"
              fontSize="14px"
            >
              Balance: {formatPrice(props.balance[1])} {tokenDetails[1].symbol}
            </Box>
          </div>
        )}

        <DepositWithdrawInput
          balances={props.balance}
          value={tokenDetails[1]}
          onChange={setDepositDetailsOTwo}
          borderBox
          listWidth={505}
          readOnly={proportionalMode}
          imageSource={tokens[1].logo}
          imageSymbol={tokens[1].symbol}
          imageLogo={tokens[1].logo}
        />
        {proportionalMode && (
          <div>
            <Box
              textAlign={'right'}
              mt="4px"
              mb="20px"
              color="rgb(256,256,256,0.5)"
              fontSize="14px"
            >
              $00.00
            </Box>
          </div>
        )}
        {!proportionalMode && (
          <div>
            <Box
              textAlign={'right'}
              mt="20px"
              mb="4px"
              color="rgb(256,256,256,0.5)"
              fontSize="14px"
            >
              Balance: {formatPrice(props.balance[2])} {tokenDetails[2].symbol}
            </Box>
          </div>
        )}

        <DepositWithdrawInput
          balances={props.balance}
          value={tokenDetails[2]}
          onChange={setDepositDetailsThree}
          borderBox
          listWidth={505}
          readOnly={proportionalMode}
          imageSource={tokens[2].logo}
          imageSymbol={tokens[2].symbol}
          imageLogo={tokens[2].logo}
        />
        {proportionalMode && (
          <div>
            <Box
              textAlign={'right'}
              mt="4px"
              mb="20px"
              color="rgb(256,256,256,0.5)"
              fontSize="14px"
            >
              $00.00
            </Box>
          </div>
        )}
        {/* {proportionalMode && (
          <div>
            <ProportioanlSwapInput
              balances={props.balance}
              value={{ amount: LPAmount, symbol: 'MLP' }}
              onChange={changeLpAmount}
              borderBox
              listWidth={505}
            />
          </div>
        )} */}
        {!proportionalMode && (
          <Box
            textAlign={'right'}
            mt="42px"
            mb="42px"
            color="rgb(256,256,256,0.5)"
            fontSize="14px"
          >
            Estimated amount: {LPAmount ? LPAmount : '--'} MLP <br />
            Price impact: 0%
          </Box>
        )}
        {proportionalMode && (
          <Box p="10px">
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>Total</Box>
              <Box>$00.00</Box>
            </Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>Price Impact</Box>
              <Box>0%</Box>
            </Box>
            <Box></Box>
          </Box>
        )}
        <ToggleButton
          type="option"
          size="sm"
          leftLabel="Single"
          rightLabel="Proportional"
          width="160"
          leftSelected={!proportionalMode}
          toggleClick={() => setProportionalMode(!proportionalMode)}
        />
        <Box display="flex" width="100%">
          <Box width="100%" height="100%" display="flex">
            {!isUnLimitApprove && (
              <CustomButton
                className={cx('bg_btn_deposit', {})}
                text="ApproveUnlimit"
                onClick={() => handleApprove(true)}
                style={{ marginRight: '10px' }}
              />
            )}
            {!isUnLimitApprove && (
              <CustomButton
                className={cx('bg_btn_deposit', {
                  zig_disabled: isTokenApproved
                })}
                text="Approve"
                onClick={() => handleApprove()}
                style={{ marginRight: '10px' }}
              />
            )}
            <CustomButton
              className={cx('bg_btn_deposit', {
                zig_disabled: !isTokenApproved
              })}
              text="Preview"
              onClick={() => handleClickOpen()}
            />
          </Box>
        </Box>
      </Box>
      <Dialog onClose={handleClose} open={open}>
        <Box
          style={{
            backgroundColor: '#191a33',
            color: '#ffffff',
            width: '400px',
            border: '1px solid #ffffff25'
          }}
        >
          <Box p="10px">
            <Box style={{ color: '#fff' }} fontSize="22px" mb="40px">
              Investment Preview
            </Box>

            <Box>
              {tokens.map((coin, index) => (
                <Box
                  key={coin.symbol}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p="10px"
                >
                  <Box display="flex" alignItems="center">
                    <img src={coin.logo} alt="" height="30" width="30" />
                    <Box ml="10px">0 {coin.symbol}</Box>
                  </Box>
                  <Box>
                    <Box fontSize="12px" color="#ffffff50">
                      $00.00 (0%)
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box>
              <Box p="10px" mt="40px">
                Summary
              </Box>
              <Box p="10px">
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>Total</Box>
                  <Box>$00.00</Box>
                </Box>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box>Price Impact</Box>
                  <Box>0%</Box>
                </Box>
                <Box></Box>
              </Box>
            </Box>
            <Box display="flex" width="100%">
              <Box color="#09aaf5" width="100%" height="100%" mr="1vw">
                <CustomButton
                  className="bg_btn_deposit"
                  text="Invest"
                  onClick={() =>
                    proportionalMode
                      ? handleSubmitProportional()
                      : handleSubmitNormal()
                  }
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
