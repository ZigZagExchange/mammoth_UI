import React, { useCallback, useEffect, useState } from "react";
import { BigNumber } from "ethers";
import Dialog from '@mui/material/Dialog';
import { Box } from '@mui/material';
import CoinInfo from "../libs/CoinInfo.json"
import SelectUnstyled, {
  SelectUnstyledProps,
  selectUnstyledClasses,
} from '@mui/base/SelectUnstyled';
import OptionUnstyled, { optionUnstyledClasses } from '@mui/base/OptionUnstyled';
import { styled } from '@mui/system';
import { PopperUnstyled } from '@mui/base';

import {
  approveToken,
  depositPool,
  getDepositERC20Amount,
  getTokenAllowance
} from "../services/pool.service";
import {tokens } from "../services/constants";
import LoadingIndicator from "./Indicator";
// import { waitForTransaction } from "../services/wallet.service";

import { Button as CustomButton } from "./Button/Button";
import SwapSwapInput from "./SwapComponent/SwapSwapInput";
import _ from "lodash";
import cx from "classnames";

interface DepositDialogProps {
  open: boolean;
  onClose: () => void;
}


const blue = {
  100: '#DAECFF',
  200: '#99CCF3',
  400: '#3399FF',
  500: '#007FFF',
  600: '#0072E5',
  900: '#003A75',
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
  900: '#1A2027',
};

const StyledButton = styled('button')(
  ({ theme }) => `
    font-family: IBM Plex Sans, sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    min-height: calc(1.5em + 22px);
    min-width: 320px;
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
    `,
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
    `,
);

export const StyledOption = styled(OptionUnstyled)(
  ({ theme }) => `
    list-style: none;
    padding: 8px;
    border-radius: 0.45em;
    cursor: default;
    display: flex;
    align-items: center;
  
    &:last-of-type {
      border-bottom: none;
    }
  
    &.${optionUnstyledClasses.selected} {
      background-color: '#3C435A';
      color: ${theme.palette.mode === 'dark' ? blue[100] : blue[900]};
    }
  
    &.${optionUnstyledClasses.highlighted} {
      background-color: #3C435A;
      color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    }
  
    &.${optionUnstyledClasses.highlighted}.${optionUnstyledClasses.selected} {
      background-color: #3C435A;
      color: #E0E3E7;
    }
  
    &.${optionUnstyledClasses.disabled} {
      color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
    }
  
    &:hover:not(.${optionUnstyledClasses.disabled}) {
      background-color: #3C435A;
      color: #E0E3E7;
    }
  
    & img {
      margin-right: 10px;
    }
    `,
);

const StyledPopper = styled(PopperUnstyled)`
    z-index: 1;
  `;

export const CustomSelect = React.forwardRef(function CustomSelect(
  props: SelectUnstyledProps<number>,
  ref: any,
) {
  const components: SelectUnstyledProps<number>['components'] = {
    Root: StyledButton,
    Listbox: StyledListbox,
    Popper: StyledPopper,
    ...props.components,
  };

  return <SelectUnstyled {...props} ref={ref} components={components} />;
});

export const CustomInput = styled((props: any) => <input {...props} />)`
    border: none;
    height: 1.8vw;
    font-size: 1vw;
    background: #191A33;
    color: white;
    &:focus-visible{
        outline: none;
        border: none;
    }
`

export default function DepositComponent(props: DepositDialogProps) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    setOpen(props.open)
  }, [props.open])

  const handleClose = () => {
    props.onClose();
    setOpen(false);
  };

  const [depositAmount, changeDepositAmount] = useState(0);

  const [LPAmount, changeLPAmount] = useState("0");
  const [tokenIndex, changeIndex] = useState(0);
  const [isLoading, changeIsLoading] = useState(false);
  const [loadingMsg, changeLoadingMsg] = useState("Awaiting Deposit");
  const [txComplete, changeTxComplete] = useState(false);
  const [txMessage, changeTxMsg] = useState("Deposit Complete");
  const [failMsg, changeFailMsg] = useState("");
  const [isTokenApproved, changeTokenApproved] = useState(false);
  const [swapDetails, _setSwapDetails] = useState(() => ({
    amount: "",
    currency: "USDC",
  }));

  const tokenApproval = useCallback(async () => {
    const res: BigNumber = await getTokenAllowance(tokenIndex);
    if (res.isZero()) {
      changeTokenApproved(false);
    } else {
      changeTokenApproved(true);
    }
  }, [tokenIndex]);

  useEffect(() => {
    (async () => {
      await tokenApproval();
    })();
  });

  const predictDepositResult = async (amount: number) => {
    const result = await getDepositERC20Amount(tokenIndex, amount);
    changeLPAmount(result);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    changeIsLoading(true);
    changeLoadingMsg(`Depositing ${tokens[tokenIndex].symbol}`);
    changeTxMsg(`Deposit ${tokens[tokenIndex].symbol} success`);
    let success = true;
    try {
      await depositPool(
        depositAmount,
        tokenIndex
      );
    } catch (e) {
      success = false;
      changeFailMsg("Deposit failed");
    }
    changeIsLoading(false);
    if (success) {
      changeTxComplete(true);
      changeTokenApproved(true);
    }
  };

  const handleApprove = async (e: any) => {
    e.preventDefault();

    changeLoadingMsg(`Approving ${tokens[tokenIndex].symbol}`);
    changeTxMsg(`${tokens[tokenIndex].symbol} approved`);
    changeIsLoading(true);
    let success = true;
    try {
      await approveToken(tokenIndex);
    } catch (e) {
      success = false;
      changeFailMsg("Approval failed");
    }
    changeIsLoading(false);
    if (success) {
      console.log("success");
      changeTxComplete(true);
      changeTokenApproved(true);
    }
  };

  const handleIndicatorClose = () => {
    changeTxComplete(false);
  };

  const handleFailIndicatorClose = () => {
    changeFailMsg("");
  };

  const setSwapDetails = async (values: any, from: boolean) => {
    const details = {
      ...swapDetails,
      ...values,
    };
    _setSwapDetails(details);
    console.log("val=========",details)

    let val = details.amount;

    if (typeof val === "string") {
      val = parseFloat(val.replace(",", "."));
    }
    val = Number.isNaN(val) ? 0 : val;
    const index = _.findIndex(CoinInfo, {coin: details.currency});
    console.log("index", index);
    changeIndex(index);
    changeDepositAmount(val);
    await predictDepositResult(val);
  }


  return (
    <Box>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        style={{ backdropFilter: 'blur(2px)' }}
        PaperProps={{
          style: {
            background: 'linear-gradient(180deg, #32374B 0%, #1C1E27 100%)',
            borderRadius: '6px',
            overflow: 'auto',
            fontSize: '0.8rem',
          },
        }}
      >
        {isLoading ? (
          <LoadingIndicator msg={loadingMsg} isLoading={true} />
        ) : null}
        {txComplete ? (
          <LoadingIndicator
            closeable={true}
            msg={txMessage}
            onClose={handleIndicatorClose}
          />
        ) : null}
        {failMsg.length ? (
          <LoadingIndicator
            closeable={true}
            msg={failMsg}
            onClose={handleFailIndicatorClose}
          />
        ) : null}
        <Box fontSize="18px" fontWeight="700" px="30px" py="25px" color="white">Deposit</Box>
        <Box display="flex" flexDirection="column" px="40px" pb="50px" bgcolor={'#232735'}>
          <Box bgcolor="#181B25" color="#636EA8" mt="33px" mb="23px" p="11px 13px" fontFamily="Inter" fontWeight={700} fontSize="13px">
            Tip: When you add liquidity, you will receive pool tokens representing your position. These tokens automatically earn fees proportional to your share of the pool, and can be redeemed at any time.
          </Box>
          <SwapSwapInput
            // balances={balances}
            // currencies={currencies}
            from={true}
            value={swapDetails}
            onChange={setSwapDetails}
            borderBox
          />
          <Box textAlign={'right'} mt="20px" mb="42px" color="rgb(256,256,256,0.5)" fontSize="14px">Balance: {35000} USDC</Box>
          <Box display="flex" width="100%">
            <Box width="100%" height="100%" display="flex">
               <CustomButton
                className={cx("bg_btn_deposit", {
                  zig_disabled: isTokenApproved,
                })}
                text="Approve"
                onClick={handleApprove}
                style={{marginRight: '10px' }}
              />
              <CustomButton
                className={cx("bg_btn_deposit", {
                  zig_disabled: !isTokenApproved,
                })}
                text="Supply"
                onClick={handleSubmit}
              />
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}